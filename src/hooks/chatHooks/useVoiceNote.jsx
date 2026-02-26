import { requestApi, getPublicUrl } from "@/lib/requestApi";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const VoiceNoteContext = createContext(null);

export const VoiceNoteProvider = ({ children }) => {
    const audioRef = useRef(new Audio());
    const [currentTrack, setCurrentTrack] = useState(null); // { channelId, filePath, uri, durationMillis }
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(0);
    const [loadingTrack, setLoadingTrack] = useState(null);

    // --- Attach listeners once ---
    useEffect(() => {
        const audio = audioRef.current;

        const onTimeUpdate = () => setPlaybackPosition(audio.currentTime * 1000);
        const onEnded = () => {
            setIsPlaying(false);
            setPlaybackPosition(0);
            setCurrentTrack(null);
            setLoadingTrack(null);
        };
        const onLoadedMetadata = () => {
            setPlaybackDuration(audio.duration * 1000)
            setLoadingTrack(null);
        };
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onWaiting = () => {
            if (currentTrack) setLoadingTrack(currentTrack.filePath);
        };
        const onCanPlay = () => setLoadingTrack(null);

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("waiting", onWaiting);
        audio.addEventListener("canplay", onCanPlay);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("waiting", onWaiting);
            audio.removeEventListener("canplay", onCanPlay);
        };
    }, []);

    // --- Core Controls ---
    async function playVoiceNote(channelId, filePath, durationMillis) {
        try {
            const audio = audioRef.current;

            // Toggle play/pause if same track
            if (currentTrack && currentTrack.filePath === filePath) {
                if (isPlaying) {
                    audio.pause();
                } else {
                    await audio.play();
                }
                return;
            }

            // Fetch the public URL
            let urlToPlay = null;

            setLoadingTrack(filePath);

            if (typeof filePath === 'object') {
                urlToPlay = URL.createObjectURL(filePath);
            } else {
                const { publicUrl, error } = await getPublicUrl({
                    filePath,
                    bucket_name: "voice_notes",
                });

                if (!publicUrl || error) {
                    console.error("Error fetching public URL", error);
                    setLoadingTrack(null);
                    return;
                }
                urlToPlay = publicUrl;
            }

            // Load the new track
            audio.src = urlToPlay;
            audio.load();

            setCurrentTrack({ channelId, filePath, uri: urlToPlay, durationMillis });

            await audio.play();
        } catch (err) {
            console.error("playVoiceNote failed:", err);
            setLoadingTrack(null);
        }
    }

    async function pausePlayBack() {
        try {
            const audio = audioRef.current;
            if (audio && isPlaying) audio.pause();
        } catch (err) {
            console.error("pausePlayback failed:", err);
        }
    }

    async function stopPlayback() {
        try {
            const audio = audioRef.current;
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                setIsPlaying(false);
                setCurrentTrack(null);
            }
        } catch (err) {
            console.error("stopPlayback failed:", err);
        }
    }

    const seekTo = (ms) => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;
        audio.currentTime = ms / 1000;
    };

    return (
        <VoiceNoteContext.Provider
            value={{
                // playback
                isPlaying,
                playbackPosition,
                playbackDuration,
                currentTrack,
                loadingTrack,
                playVoiceNote,
                stopPlayback,
                pausePlayBack,
                seekTo,
            }}
        >
            {children}
        </VoiceNoteContext.Provider>
    );
};

export function useVoiceNote() {
    const ctx = useContext(VoiceNoteContext);
    if (!ctx) throw new Error("useVoiceNote must be used within VoiceNoteProvider");
    return ctx;
}
