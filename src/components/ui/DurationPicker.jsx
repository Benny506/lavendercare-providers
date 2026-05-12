import React, { useState } from "react";

const DurationPicker = ({
    value = 0, // in seconds
    onChange,
    unit: initialUnit = "hours", // "hours" | "days"
    allowedUnits = ["hours", "days"],
    label,
    error
}) => {
    const defaultUnit = allowedUnits.includes(initialUnit) ? initialUnit : allowedUnits[0];
    const [unit, setUnit] = useState(defaultUnit);

    // Convert seconds to readable values
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const days = Math.floor(value / 86400);

    const handleHourChange = (h) => {
        const totalSeconds = (h * 3600) + (minutes * 60);
        onChange(totalSeconds);
    };

    const handleMinuteChange = (m) => {
        const totalSeconds = (hours * 3600) + (m * 60);
        onChange(totalSeconds);
    };

    const handleDayChange = (d) => {
        onChange(d * 86400);
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                {label && <label className="block text-sm font-bold text-gray-700">{label}</label>}

                {/* Unit Toggle */}
                {allowedUnits.length > 1 && (
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {allowedUnits.includes("hours") && (
                            <button
                                type="button"
                                onClick={() => setUnit("hours")}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition ${unit === "hours" ? "bg-white shadow-sm text-primary-600" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                Hours
                            </button>
                        )}
                        {allowedUnits.includes("days") && (
                            <button
                                type="button"
                                onClick={() => setUnit("days")}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition ${unit === "days" ? "bg-white shadow-sm text-primary-600" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                Days
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {unit === "hours" ? (
                    <>
                        {/* Hour Select */}
                        <div className="relative flex-1">
                            <select
                                value={hours}
                                onChange={(e) => handleHourChange(Number(e.target.value))}
                                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition shadow-sm"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>{i}h</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        <span className="text-gray-300 font-bold">:</span>

                        {/* Minute Select */}
                        <div className="relative flex-1">
                            <select
                                value={minutes}
                                onChange={(e) => handleMinuteChange(Number(e.target.value))}
                                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition shadow-sm"
                            >
                                {[0, 15, 30, 45].map((m) => (
                                    <option key={m} value={m}>{m}m</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Day Input */
                    <div className="relative flex-1">
                        <input
                            type="number"
                            min="1"
                            value={days === 0 ? "" : days}
                            placeholder="e.g. 3"
                            onChange={(e) => handleDayChange(Number(e.target.value))}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition shadow-sm"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">Days</span>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default DurationPicker;