import { useEffect, useRef, useState } from "react";

/**
 * useCountdown Hook
 *
 * Modes:
 *  - endDate: counts down until exact date/time
 *  - startTime + durationInSeconds: counts down from startTime
 *  - startHour + durationInSeconds: counts down from hour today
 *
 * Extras:
 *  - allowBeforeStart: if true, hook is "active" even before countdown starts
 *
 * Returns:
 *  - remaining (seconds)
 *  - formatted (human readable)
 *  - status: "not_started" | "running" | "ended"
 *  - isInRange: boolean (true until window expires)
 */
export function useCountdown({
  startHour,
  durationInSeconds,
  endDate,
  startTime,
  allowBeforeStart = true,
}) {
  const [remaining, setRemaining] = useState(null);
  const [status, setStatus] = useState("running");
  const [isInRange, setIsInRange] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (
      !endDate &&
      (startHour == null || durationInSeconds == null) &&
      (startTime == null || durationInSeconds == null)
    ) {
      return;
    }

    const getStartTimeFromHour = () => {
      const now = new Date();
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startHour,
        0,
        0,
        0
      );
    };

    const tick = () => {
      const now = new Date();

      let startBoundary = null;
      let endBoundary = null;
      let newRemaining = 0;

      // ─────────────────────────────
      // Mode 1: Exact end date
      // ─────────────────────────────
      if (endDate) {
        endBoundary = new Date(endDate);
        const diff = Math.floor((endBoundary.getTime() - now.getTime()) / 1000);
        newRemaining = Math.max(diff, 0);
        setStatus(diff > 0 ? "running" : "ended");
        setIsInRange(diff > 0);
      }

      // ─────────────────────────────
      // Mode 2: startTime + duration
      // ─────────────────────────────
      else if (startTime) {
        startBoundary = new Date(startTime);
        endBoundary = new Date(
          startBoundary.getTime() + durationInSeconds * 1000
        );

        if (now < startBoundary) {
          newRemaining = 0;
          setStatus("not_started");
          setIsInRange(allowBeforeStart);
        } else {
          const diff = Math.floor(
            (endBoundary.getTime() - now.getTime()) / 1000
          );
          newRemaining = Math.max(diff, 0);
          setStatus(diff > 0 ? "running" : "ended");
          setIsInRange(diff > 0);
        }
      }

      // ─────────────────────────────
      // Mode 3: startHour + duration
      // ─────────────────────────────
      else {
        startBoundary = getStartTimeFromHour();
        endBoundary = new Date(
          startBoundary.getTime() + durationInSeconds * 1000
        );

        if (now < startBoundary) {
          newRemaining = 0;
          setStatus("not_started");
          setIsInRange(allowBeforeStart);
        } else {
          const diff = Math.floor(
            (endBoundary.getTime() - now.getTime()) / 1000
          );
          newRemaining = Math.max(diff, 0);
          setStatus(diff > 0 ? "running" : "ended");
          setIsInRange(diff > 0);
        }
      }

      setRemaining(newRemaining);

      // Stop ticking once expired
      if (newRemaining === 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    tick(); // run immediately
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    startHour,
    durationInSeconds,
    endDate,
    startTime,
    allowBeforeStart,
  ]);

  // ─────────────────────────────
  // Formatter
  // ─────────────────────────────
  const formatTime = (seconds) => {
    if (seconds == null) return null;

    if (status === "not_started") return "Not started yet";
    if (status === "ended") return "Ended";

    let s = seconds;

    const years = Math.floor(s / (365 * 24 * 60 * 60));
    s -= years * 365 * 24 * 60 * 60;

    const months = Math.floor(s / (30 * 24 * 60 * 60));
    s -= months * 30 * 24 * 60 * 60;

    const days = Math.floor(s / (24 * 60 * 60));
    s -= days * 24 * 60 * 60;

    const hours = Math.floor(s / (60 * 60));
    s -= hours * 60 * 60;

    const mins = Math.floor(s / 60);
    s -= mins * 60;

    const secs = s;

    const parts = [];
    if (years) parts.push(`${years}yr${years > 1 ? "s" : ""}`);
    if (months) parts.push(`${months}month${months > 1 ? "s" : ""}`);
    if (days) parts.push(`${days}day${days > 1 ? "s" : ""}`);
    if (hours) parts.push(`${hours}hour${hours > 1 ? "s" : ""}`);
    if (mins) parts.push(`${mins}min${mins > 1 ? "s" : ""}`);
    if (secs || parts.length === 0)
      parts.push(`${secs}sec${secs > 1 ? "s" : ""}`);

    return parts.join(" ");
  };

  return {
    remaining,
    formatted: formatTime(remaining),
    status,
    isInRange,
  };
}
