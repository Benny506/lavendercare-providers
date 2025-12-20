import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { DateTime } from "luxon";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getMaxByKey({ arr, key }) {
  if (!arr.length) return null;

  return arr.reduce((maxObj, current) => {
    return current[key] > maxObj[key] ? current : maxObj;
  });
}

export function generateNumericCode(length = 6) {
  const charset = '0123456789';
  let code = '';

  // Use crypto for stronger randomness if available
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      code += charset[values[i] % charset.length];
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      code += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  }

  return code;
}

export function formatNumberWithCommas(value) {
  if (value === null || value === undefined || isNaN(value)) return "";

  return Number(value).toLocaleString();
}

export function getAppointmentStatus({ status, start_time, duration_secs }) {
  const now = DateTime.now();
  const bookingStartTime = DateTime.fromISO(start_time);
  const bookingEndTime = bookingStartTime.plus({ seconds: duration_secs });

  const hasStarted = now >= bookingStartTime;
  const hasEnded = now > bookingEndTime;

  // 1) If the appointment is new/awaiting_completion and ongoing
  if ((status === "new" || status === "awaiting_completion") && hasStarted && !hasEnded) {
    return "ongoing";
  }

  // 2) new → either still new or missed
  if (status === "new") {
    return hasStarted ? "missed" : "new";
  }

  // 3) cancelled → as is
  if (status === "cancelled") {
    return "cancelled";
  }

  // 4) completed → as is
  if (status === "completed") {
    return "completed";
  }

  // 5) awaiting_completion → as is
  if (status === "awaiting_completion") {
    return "awaiting_completion";
  }

  // fallback
  return status;
}

export function formatTo12Hour({ time }) {
  const date = typeof time === "string" ? new Date(time) : time;

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'

  const minutesStr = minutes < 10 ? "0" + minutes : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
}

export function formatSlot(slot, userZone = "local") {
  // slot is in UTC from Supabase
  const dt = DateTime.fromISO(slot, { zone: "utc" });

  // convert to user zone
  const local = userZone === "local" ? dt.toLocal() : dt.setZone(userZone);

  // format in 12hr style e.g. 8:15 AM
  return local.toFormat("h:mm a");
}

export function secondsToLabel({ seconds }) {
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours > 0 && remainingMins > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMins} min${remainingMins > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${remainingMins} min${remainingMins > 1 ? 's' : ''}`;
  }
}
export function clockTimer({ start_time }) {
  const now = DateTime.now();
  const target = DateTime.fromISO(start_time, { zone: "utc" }).toLocal(); // convert to local

  // Difference as Duration
  const diff = target.diff(now, ["days", "hours", "minutes", "seconds"]).toObject();

  if (target <= now) {
    return { str: "00days : 00hr : 00mins : 00secs", isZero: true };
  }

  const days = Math.floor(diff.days ?? 0);
  const hours = Math.floor(diff.hours ?? 0);
  const minutes = Math.floor(diff.minutes ?? 0);
  const seconds = Math.floor(diff.seconds ?? 0);

  return {
    str: `${days}days : ${hours}hr : ${minutes}mins : ${seconds}secs`,
    isZero: false,
  };
}


export function timeToAMPM_FromHour({ hour }) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0); // hour:00:00
  const hours = date.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours.toString().padStart(2, '0')}:00 ${suffix}`;
}

export function extractHour_FromHHMM({ hourString }) {
  return parseInt(hourString.split(":")[0], 10);
}

export function hourNumberToHHMM(hour) {
  if (hour === null || hour === undefined) return "";
  return `${String(hour).padStart(2, "0")}:00`;
}

export function isValidHourRange(opening, closing) {
  if (opening == null || closing == null) return true; // allow empty days
  return closing > opening;
}

export function timeToAMPM_FromHour_Duration({ startHour, durationInSeconds }) {
  const date = new Date();
  date.setHours(startHour, 0, 0, 0);
  const endDate = new Date(date.getTime() + durationInSeconds * 1000);
  const hours = endDate.getHours();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours.toString().padStart(2, '0')}:00 ${suffix}`;
}

export const isoToDateTime = ({ isoString }) => {
  return DateTime.fromISO(isoString)
    .toFormat("ccc LLL dd. hh:mma");
};

export function formatDate1({ dateISO }) {
  try {
    if (!dateISO || typeof dateISO !== "string") {
      return ""; // or "Invalid date"
    }

    const date = DateTime.fromISO(dateISO);

    if (!date.isValid) {
      return ""; // or "Invalid date"
    }

    return date.toFormat("ccc dd LLLL");
  } catch (error) {
    console.error("formatDate1 error:", error);
    return ""; // fallback if something unexpected happens
  }
}

export function isoToAMPM({ isoString }) {
  const dt = DateTime.fromISO(isoString);
  if (!dt.isValid) return '';
  return dt.toFormat('hh:mm a'); // hh = 2-digit hour, a = AM/PM
}

export function getUniqueByKey({ arr, key }) {
  const seen = new Set();
  return arr.filter(item => {
    const val = item[key];
    if (seen.has(val)) {
      return false;
    }
    seen.add(val);
    return true;
  });
}

export function removeDuplicates(arr) {
  return [...new Set(arr)];
}

export function removeDuplicatesWithCount({ arr, key }) {
  if (!key) {
    // Primitive mode
    const counts = {};
    arr.forEach(item => {
      const identifier = String(item);
      counts[identifier] = (counts[identifier] || 0) + 1;
    });

    return {
      unique: Object.keys(counts),
      counts
    };
  }

  // Object mode
  const map = new Map();

  arr.forEach(item => {
    const identifier = String(item[key]);
    if (map.has(identifier)) {
      map.get(identifier).count++;
    } else {
      map.set(identifier, { ...item, count: 1 });
    }
  });

  return {
    unique: Array.from(map.values())
  };
}



export function sortByKey({ arr, key, order = "asc" }) {
  if (!Array.isArray(arr)) {
    throw new Error("First argument must be an array");
  }

  const sorted = [...arr].sort((a, b) => {
    const valA = Number(a[key]) || 0;
    const valB = Number(b[key]) || 0;

    return order === "asc" ? valA - valB : valB - valA;
  });

  return sorted;
}

export const sortByStatusPriority = (arr) => {
  const priorityOrder = [
    'ongoing',
    'new',
    'awaiting_completion',
    'completed',
    'missed',
    'cancelled'
  ];

  return [...arr].sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.status);
    const bIndex = priorityOrder.indexOf(b.status);
    return aIndex - bIndex;
  });
};

export function splitSeconds(seconds) {
  const total = Number(seconds) || 0; // safety

  const hour = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  return { hour, minutes };
}

export function removeDuplicatesFromStringArr({ arr }) {
  return [...new Set(arr)];
}