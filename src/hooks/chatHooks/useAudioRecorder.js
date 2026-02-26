import { useState, useRef, useCallback } from "react";

export const useAudioRecorder = ({ onStop }) => {
  const [status, setStatus] = useState("idle");
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const sourceRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    try {
      setStatus("acquiring_media");
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      chunksRef.current = [];

      processor.onaudioprocess = (event) => {
        const channelData = event.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(channelData));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setStatus("recording");

    } catch (err) {
      console.error(err);
      setError("Failed to start recording");
      setStatus("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!audioContextRef.current) return;

    processorRef.current.disconnect();
    sourceRef.current.disconnect();

    streamRef.current.getTracks().forEach(track => track.stop());

    const audioContext = audioContextRef.current;
    const sampleRate = audioContext.sampleRate;

    const wavBlob = encodeWAV(chunksRef.current, sampleRate);

    const url = URL.createObjectURL(wavBlob);
    setMediaBlobUrl(url);
    setStatus("stopped");

    if (onStop) {
      onStop(url, wavBlob);
    }

    audioContext.close();
    audioContextRef.current = null;

  }, [onStop]);

  return {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    error
  };
};


/* ---------------------------------------- */
/* -------- WAV ENCODER FUNCTION --------- */
/* ---------------------------------------- */

function encodeWAV(chunks, sampleRate) {
  const flat = flattenChunks(chunks);
  const buffer = new ArrayBuffer(44 + flat.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + flat.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, flat.length * 2, true);

  floatTo16BitPCM(view, 44, flat);

  return new Blob([view], { type: "audio/wav" });
}

function flattenChunks(chunks) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

function floatTo16BitPCM(view, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}