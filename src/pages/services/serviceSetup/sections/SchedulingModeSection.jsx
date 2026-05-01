import React from "react";
import { ErrorMessage } from "formik";
import { Zap, Clock, Truck, Calendar, Info } from "lucide-react";
import Card from "@/components/ui/Card";
import ErrorMsg1 from "@/components/ErrorMsg1";

const SchedulingModeSection = ({ scheduling_mode, setFieldValue, isEditing, setServiceTypes, setLocations }) => {
    const modes = [
        { 
            id: "instant", 
            name: "Instant Session", 
            icon: Zap, 
            desc: "On-demand virtual consultations. Perfect for urgent therapy or quick check-ins.",
            tip: "Instant sessions are always virtual. No travel needed!"
        },
        { 
            id: "block", 
            name: "Shift / Block", 
            icon: Clock, 
            desc: "Hourly or daily shifts. Perfect for Nannies, Nurses, or Security Guards.",
            tip: "Great for services where you stay with the mother for a set number of hours."
        },
        { 
            id: "logistics", 
            name: "Logistics", 
            icon: Truck, 
            desc: "Pickup and delivery services. Perfect for Laundry or Pharmacy delivery.",
            tip: "Mothers will see your shop address as the service location."
        },
        { 
            id: "program", 
            name: "Program", 
            icon: Calendar, 
            desc: "Structured multi-day packages. Perfect for 3-day or 7-day postpartum care.",
            tip: "Programs must last at least 2 days."
        },
    ];

    const handleModeChange = (newMode) => {
        if (isEditing || newMode === scheduling_mode) return;
        setFieldValue("scheduling_mode", newMode);
        setServiceTypes([]);
        setLocations([]);
    };

    return (
        <Card
            title="Scheduling Mode"
            subtitle="How do you want mothers to book this service?"
            icon={Zap}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {modes.map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = scheduling_mode === mode.id;
                        return (
                            <div
                                key={mode.id}
                                onClick={() => !isEditing && handleModeChange(mode.id)}
                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                    isSelected 
                                    ? "border-primary-500 bg-primary-50/50" 
                                    : "border-gray-100 hover:border-gray-200"
                                } ${isEditing ? "cursor-not-allowed grayscale-[0.8] opacity-70" : "cursor-pointer"}`}
                            >
                                <div className={`p-2 rounded-lg w-fit mb-3 ${isSelected ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                                    <Icon size={20} />
                                </div>
                                <h3 className="font-bold text-sm text-gray-900">{mode.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{mode.desc}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Dynamic Help Tip */}
                {scheduling_mode && (
                    <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl flex gap-3">
                        <Info className="text-primary-500 shrink-0" size={20} />
                        <div className="text-sm text-primary-900">
                            <p className="font-bold">Mode Insight:</p>
                            <p className="mt-1">{modes.find(m => m.id === scheduling_mode)?.tip}</p>
                        </div>
                    </div>
                )}
            </div>
            <ErrorMessage name="scheduling_mode">
                {errorMsg => <ErrorMsg1 className="mt-4" errorMsg={errorMsg} />}
            </ErrorMessage>
        </Card>
    );
};

export default SchedulingModeSection;
