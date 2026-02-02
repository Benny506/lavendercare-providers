import { CircleX, Image, Play } from "lucide-react";
import React, { useState } from "react";

const primary = "#703dcb";

export default function MediaDisplay({
  url,
  type,
  align = "left",
}) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  const isRight = align === "right";

  return (
    <>
      {/* === Chat Thumbnail === */}
      <div
        onClick={() => setOpen(true)}
        className={`relative cursor-pointer rounded-2xl overflow-hidden shadow-md group
        ${isRight ? "ml-auto" : "mr-auto"}`}
        style={{
          width: 240,
          height: 240,
          border: `2px solid ${primary}25`,
          background: "#f3f4f6",
        }}
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}

        {type === "image" ? (
          <img
            src={url}
            alt="media"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition duration-300 group-hover:scale-105 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <video
            src={url}
            onLoadedData={() => setLoaded(true)}
            className={`w-full h-full object-cover ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            muted
          />
        )}

        {/* Overlay icon */}
        <div
          className="absolute bottom-3 right-3 text-white p-2 rounded-full shadow-lg"
          style={{ background: primary }}
        >
          {type === "image" ? <Image size={14} /> : <Play size={14} />}
        </div>
      </div>

      {/* === Fullscreen Modal === */}
      {open && (
        <div style={{
            zIndex: '1000'
        }} className="fixed inset-0 bg-black/85 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="fixed top-6 right-6 z-50 bg-white text-black rounded-full p-3 shadow-xl hover:scale-110 transition"
          >
            <CircleX size={20} />
          </button>

          {/* Media Content */}
          <div className="max-w-[95vw] max-h-[90vh] flex items-center justify-center">
            {type === "image" ? (
              <img
                src={url}
                alt="preview"
                className="max-h-[90vh] max-w-[95vw] rounded-xl shadow-2xl object-contain"
              />
            ) : (
              <video
                src={url}
                controls
                autoPlay
                className="max-h-[90vh] max-w-[95vw] rounded-xl shadow-2xl object-contain"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
