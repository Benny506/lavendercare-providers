import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useVoiceNote } from "@/hooks/chatHooks/useVoiceNote";
import { Loader2 } from "lucide-react";

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function AudioPlayer({ channelId, filePath, durationMillis }) {
    const {
        isPlaying,
        playbackPosition,
        currentTrack,
        loadingTrack,
        playVoiceNote,
        pausePlayBack,
        seekTo,
    } = useVoiceNote();

    const isCurrent = currentTrack && currentTrack.filePath === filePath;
    const playingThis = isCurrent && isPlaying;
    const isLoading = loadingTrack === filePath;

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                    onClick={() => {
                        if (isLoading) return;
                        if (playingThis) {
                            pausePlayBack();
                        } else {
                            playVoiceNote(channelId, filePath, durationMillis);
                        }
                    }}
                    style={{
                        background: "transparent",
                        border: "none",
                        fontSize: 20,
                        cursor: "pointer",
                    }}
                >
                    {
                        isLoading
                            ?
                            <Loader2 className="w-5 h-5 animate-spin" />
                            :
                            (playingThis ? "⏸" : "▶️")
                    }
                </button>

                <div style={{ flex: 1 }}>
                    <Slider
                        min={0}
                        max={durationMillis}
                        value={isCurrent ? playbackPosition : 0}
                        onChange={(val) => {
                            seekTo(val)
                            // while sliding (dragging), we might optionally show it
                            // but actual seek on release:
                        }}
                        onChangeComplete={(val) => {
                            // seekTo(val);
                        }}
                        trackStyle={{ backgroundColor: "#703dcb", height: 6 }}
                        railStyle={{ backgroundColor: "#ccc", height: 6 }}
                        handleStyle={{
                            borderColor: "#703dcb",
                            height: 16,
                            width: 16,
                            marginTop: -5,
                            backgroundColor: "#fff",
                        }}
                    />
                </div>
            </div>

            <div style={{ fontSize: 12, minWidth: 80 }}>
                {isCurrent ? formatTime(playbackPosition) : "00:00"} /{" "}
                {formatTime(durationMillis)}
            </div>
        </div>
    );
}
