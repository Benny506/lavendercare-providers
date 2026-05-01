import React from "react";
import { Truck, MapPin } from "lucide-react";
import Card from "@/components/ui/Card";
import { Info } from "lucide-react";

const RenderingPreferenceSection = ({ 
    travel_to_client, 
    client_travel_to_provider, 
    setFieldValue,
    scheduling_mode
}) => {
    // Hidden for instant (always virtual)
    if (scheduling_mode === 'instant') return null;

    return (
        <Card
            title="Rendering Preferences"
            subtitle="How do you deliver this service?"
            icon={Truck}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* We come to you */}
                    <div 
                        onClick={() => setFieldValue("travel_to_client", !travel_to_client)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${travel_to_client ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className={`p-2 rounded-lg ${travel_to_client ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Truck size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-900">We come to you</p>
                            <p className="text-xs text-gray-500 mt-1">You will travel to the mother's home or a custom location.</p>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={travel_to_client} 
                            readOnly 
                            className="ml-auto accent-primary-600"
                        />
                    </div>

                    {/* You come to us */}
                    <div 
                        onClick={() => setFieldValue("client_travel_to_provider", !client_travel_to_provider)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${client_travel_to_provider ? 'border-primary-500 bg-primary-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className={`p-2 rounded-lg ${client_travel_to_provider ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-900">You come to us</p>
                            <p className="text-xs text-gray-500 mt-1">The mother will visit your shop, center, or clinic.</p>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={client_travel_to_provider} 
                            readOnly 
                            className="ml-auto accent-primary-600"
                        />
                    </div>
                </div>

                {/* Helper Tip */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                    <Info className="text-blue-500 shrink-0" size={20} />
                    <p className="text-sm text-blue-700 leading-relaxed">
                        <strong>Pro Tip:</strong> Most mothers prefer providers who can travel to them, especially for <strong>Programs</strong> and <strong>Blocks</strong>. If you have a physical center, selecting "You come to us" will prompt you to link your locations below.
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default RenderingPreferenceSection;
