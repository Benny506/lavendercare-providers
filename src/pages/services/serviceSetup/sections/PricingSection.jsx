import React from "react";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatNumberWithCommas, secondsToLabel } from "@/lib/utils";

const PricingSection = ({ serviceTypes, openServiceTypeModal, setServiceTypes, scheduling_mode }) => {

    const formatDuration = (totalSeconds) => {
        if (!totalSeconds) return "0s";

        const days = Math.floor(totalSeconds / 86400);
        const remainingSecondsAfterDays = totalSeconds % 86400;
        const hours = Math.floor(remainingSecondsAfterDays / 3600);
        const minutes = Math.floor((remainingSecondsAfterDays % 3600) / 60);

        const parts = [];
        if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
        if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
        if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);

        return parts.join(' ') || "0s";
    };

    const getModeLabel = (type) => {
        const durationStr = formatDuration(type.duration);
        switch (scheduling_mode) {
            case 'logistics':
                return `Delivers within ${durationStr}`;
            case 'block':
                return `${durationStr} shift`;
            case 'project':
                return `Approx. ${durationStr} timeline`;
            case 'instant':
            default:
                return `${durationStr} session`;
        }
    };
    return (
        <Card
            title="Duration & Fees"
            subtitle="Set service pricing and duration"
            icon={DollarSign}
        >
            <div className="space-y-4">
                {serviceTypes.length === 0 && (
                    <p className="text-sm text-gray-500">Not set</p>
                )}

                {serviceTypes.map((type, index) => (
                    <div
                        key={index}
                        className="flex justify-between flex-wrap gap-3 items-center border border-gray-200 rounded-lg p-3"
                    >
                        <div>
                            <p className="font-bold text-sm text-gray-900">{type.type_name}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                <span className="font-medium text-primary-700">{type.currency} {formatNumberWithCommas(type.price)}</span>
                                <span className="mx-2 text-gray-300">|</span>
                                <span>{getModeLabel(type)}</span>
                                <span className="mx-2 text-gray-300">|</span>
                                <span>{type.is_virtual ? "Virtual Rendering" : "Physical Rendering"}</span>
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setServiceTypes(serviceTypes.filter((_, i) => i !== index))}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {/* Add button */}
                <button
                    type="button"
                    onClick={openServiceTypeModal}
                    className="w-full border border-dashed border-primary-400 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
                >
                    {serviceTypes?.length === 0 ? 'Click to Set' : 'Click to add more'}
                </button>
            </div>
        </Card>
    );
};

export default PricingSection;
