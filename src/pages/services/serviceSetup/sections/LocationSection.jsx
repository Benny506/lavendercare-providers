import React from "react";
import { LocateIcon, Info, Plus } from "lucide-react";
import Card from "@/components/ui/Card";

const LocationSection = ({ 
    locations, 
    pool = [], 
    openServiceLocationModal, 
    setLocations, 
    scheduling_mode,
    client_travel_to_provider
}) => {
    // Hidden for instant
    if (scheduling_mode === 'instant') return null;

    const isLinked = (id) => locations.some(l => l.id === id);

    const isLocationRequired = scheduling_mode === 'logistics' || client_travel_to_provider;

    const toggleLocation = (loc) => {
        if (isLinked(loc.id)) {
            if (isLocationRequired && locations.length === 1) {
                return; // Block unchecking the last one if required
            }
            setLocations(locations.filter(l => l.id !== loc.id));
        } else {
            setLocations([...locations, loc]);
        }
    };

    const isLogistics = scheduling_mode === 'logistics';

    return (
        <Card
            title={isLogistics ? "Service Rendering Location" : "Service Locations"}
            subtitle={isLogistics ? "Where is the laundry/item being processed?" : "Which of your centers offer this service?"}
            icon={LocateIcon}
            action={
                <button
                    type="button"
                    onClick={openServiceLocationModal}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold transition text-sm"
                >
                    <Plus size={18} />
                    <span>Add New</span>
                </button>
            }
        >
            <div className="space-y-6">
                {pool.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-sm text-gray-400">You haven't added any business locations yet.</p>
                        <button 
                            type="button"
                            onClick={openServiceLocationModal}
                            className="mt-2 text-primary-600 font-bold text-sm hover:underline"
                        >
                            Create your first location
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {pool.map((loc, index) => (
                            <div
                                key={loc.id || index}
                                onClick={() => toggleLocation(loc)}
                                className={`flex justify-between items-center border-2 rounded-xl p-4 cursor-pointer transition-all ${isLinked(loc.id) ? 'border-primary-500 bg-primary-50/30' : 'border-gray-50 hover:border-gray-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={isLinked(loc.id)} 
                                        readOnly 
                                        className="accent-primary-600 h-4 w-4"
                                    />
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{loc.address}</p>
                                        <p className="text-xs text-gray-500">{loc.city}, {loc.state}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Helper Tip */}
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                    <Info className="text-amber-500 shrink-0" size={20} />
                    <p className="text-sm text-amber-800 leading-relaxed">
                        {isLogistics 
                            ? "For Logistics, we need to show the mother where her items are being handled. Please select your main processing center."
                            : "Mothers will see these locations as options if they choose to visit you. You can link multiple centers to a single service."
                        }
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default LocationSection;
