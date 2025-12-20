import { requestApi, getPublicUrl } from "@/lib/requestApi";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const VoiceNoteContext = createContext(null);

export const VoiceNoteProvider = ({ children }) => {
    const audioRef = useRef(new Audio());
    const [currentTrack, setCurrentTrack] = useState(null); // { channelId, filePath, uri, durationMillis }
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(0);

    // --- Attach listeners once ---
    useEffect(() => {
        const audio = audioRef.current;

        const onTimeUpdate = () => setPlaybackPosition(audio.currentTime * 1000);
        const onEnded = () => {
            setIsPlaying(false);
            setPlaybackPosition(0);
            setCurrentTrack(null);
        };
        const onLoadedMetadata = () => setPlaybackDuration(audio.duration * 1000);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
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
            const { publicUrl, error } = await getPublicUrl({
                filePath,
                bucket_name: "voice_notes",
            });

            if (!publicUrl || error) {
                console.error("Error fetching public URL", error);
                return;
            }

            // Load the new track
            audio.src = publicUrl;
            audio.load();

            setCurrentTrack({ channelId, filePath, uri: publicUrl, durationMillis });

            await audio.play();
        } catch (err) {
            console.error("playVoiceNote failed:", err);
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
