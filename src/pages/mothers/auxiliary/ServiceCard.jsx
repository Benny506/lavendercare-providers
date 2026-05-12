import React from 'react';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumberWithCommas, secondsToLabel } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function ServiceCard({ service, iAmSender }) {

    const navigate = useNavigate()

    if (!service) return null;

    // Handle stringified JSON or object
    const data = typeof service === 'string' ? JSON.parse(service) : service;

    return (
        <div className={`flex flex-col gap-3 p-1 min-w-[260px] max-w-[300px]`}>
            <div className={`rounded-2xl overflow-hidden border ${iAmSender ? 'bg-white/10 border-white/20' : 'bg-white border-gray-100 shadow-sm'}`}>

                <div className="p-4 space-y-3">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-bold text-sm leading-tight ${iAmSender ? 'text-white' : 'text-gray-900'}`}>
                                {data.service_name}
                            </h4>
                        </div>
                        <Badge className={`text-[9px] uppercase tracking-wider font-bold border-none ${iAmSender ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-700'}`}>
                            {data.service_category?.replaceAll("_", " ")}
                        </Badge>
                    </div>

                    {/* Details Snippet */}
                    <p className={`text-[11px] line-clamp-2 leading-relaxed ${iAmSender ? 'text-white/80' : 'text-gray-500'}`}>
                        {data.service_details}
                    </p>

                    {/* Pricing */}
                    <div className="space-y-1.5">
                        <p className={`text-[9px] uppercase tracking-tighter font-bold ${iAmSender ? 'text-white/50' : 'text-gray-400'}`}>
                            Pricing & Options
                        </p>
                        <div className="flex flex-col gap-1">
                            {(data.service_types || []).slice(0, 3).map((type, idx) => (
                                <div key={idx} className={`flex justify-between items-center text-[10px] p-1.5 rounded-lg ${iAmSender ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <span className={iAmSender ? 'text-white/70' : 'text-gray-600'}>
                                        {secondsToLabel({ seconds: type.duration })}
                                    </span>
                                    <span className={`font-bold ${iAmSender ? 'text-white' : 'text-primary-600'}`}>
                                        {type.currency} {formatNumberWithCommas(type.price)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action */}
                    <Button
                        size="sm"
                        className={`w-full h-8 text-[11px] font-bold rounded-xl transition-all ${iAmSender
                            ? 'bg-white text-primary-600 hover:bg-white/90'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                            }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            // This would eventually deep link or open a details view
                            navigate('/service/setup', { state: { service_id: data?.id } })
                        }}
                    >
                        View Details
                    </Button>
                </div>
            </div>

            <div className={`flex items-center gap-1.5 px-1 ${iAmSender ? 'text-white/60' : 'text-gray-400'}`}>
                <Icon icon="mdi:tag-outline" className="text-sm" />
                <span className="text-[10px] font-medium italic">Service Reference</span>
            </div>
        </div>
    );
}
