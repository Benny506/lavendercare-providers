import React from "react";
import { Icon } from "@iconify/react";

export default function ServiceAvailability({ availability, setFieldValue }) {
    // Rigid Monday-first order
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const handleTimeChange = (day, type, value) => {
        setFieldValue(`availability.${day}.${type}`, value);
    };

    const toggleDay = (day) => {
        const isCurrentlyActive = availability[day]?.opening || availability[day]?.closing;
        if (isCurrentlyActive) {
            setFieldValue(`availability.${day}.opening`, "");
            setFieldValue(`availability.${day}.closing`, "");
        } else {
            setFieldValue(`availability.${day}.opening`, "08:00");
            setFieldValue(`availability.${day}.closing`, "17:00");
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
                    <Icon icon="material-symbols:calendar-clock-outline-rounded" width="24" height="24" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Working Hours</h2>
                    <p className="text-sm text-gray-500">Define which days and times you are available for bookings.</p>
                </div>
            </div>

            <div className="space-y-4">
                {dayOrder.map((day) => {
                    const isActive = availability[day]?.opening || availability[day]?.closing;
                    
                    return (
                        <div 
                            key={day}
                            className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all ${
                                isActive ? 'border-primary-100 bg-primary-50/20' : 'border-gray-50 bg-gray-50/30 grayscale'
                            }`}
                        >
                            <div className="flex items-center gap-4 mb-4 md:mb-0 min-w-[150px]">
                                <button
                                    type="button"
                                    onClick={() => toggleDay(day)}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${
                                        isActive ? 'bg-primary-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                                        isActive ? 'left-7' : 'left-1'
                                    }`} />
                                </button>
                                <span className="font-bold text-gray-900 capitalize">{day}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Opens</span>
                                    <input
                                        type="time"
                                        value={availability[day]?.opening || ""}
                                        onChange={(e) => handleTimeChange(day, 'opening', e.target.value)}
                                        disabled={!isActive}
                                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50"
                                    />
                                </div>
                                <div className="mt-4 text-gray-300">
                                    <Icon icon="material-symbols:arrow-right-alt-rounded" width="20" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Closes</span>
                                    <input
                                        type="time"
                                        value={availability[day]?.closing || ""}
                                        onChange={(e) => handleTimeChange(day, 'closing', e.target.value)}
                                        disabled={!isActive}
                                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
