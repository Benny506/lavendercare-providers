import React from "react";
import { Users, Info } from "lucide-react";
import Card from "@/components/ui/Card";

const CapacitySection = ({ value, setFieldValue }) => {
    return (
        <Card
            title="Service Capacity & Teams"
            subtitle="How many mothers can you handle at the same time?"
            icon={Users}
        >
            <div className="space-y-6">
                <div className="max-w-xs">
                    <label className="text-sm font-bold text-gray-700 block mb-2">
                        Concurrent Bookings
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min="1"
                            value={value}
                            onChange={(e) => setFieldValue("concurrent_capacity", Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-sm font-bold text-lg"
                        />
                        <span className="text-gray-500 font-medium">Slots/Teams</span>
                    </div>
                </div>

                {/* Helper Tip */}
                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex gap-3">
                    <Info className="text-purple-500 shrink-0" size={20} />
                    <div className="text-sm text-purple-900 leading-relaxed">
                        <p className="font-bold">Team Guidance:</p>
                        <p className="mt-1">
                            If you are a solo provider, leave this as <strong>1</strong>. 
                            If you have multiple staff members or teams who can work simultaneously, enter that number here. 
                            This allows more than one mother to book you for the same time!
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CapacitySection;
