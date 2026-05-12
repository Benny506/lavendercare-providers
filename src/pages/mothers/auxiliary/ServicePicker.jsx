import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';

export default function ServicePicker({ isOpen, onClose, services, onSelect }) {
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredServices = (services || []).filter(s =>
        s.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.service_category?.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(s => s.status === 'approved');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2rem] w-full max-w-xl h-full max-h-[650px] overflow-hidden shadow-2xl flex flex-col border border-gray-100"
                >
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between bg-primary-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Reference Service</h2>
                            <p className="text-xs text-gray-500 mt-1">Select a service to share in chat</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4 bg-white border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search your services..."
                                className="pl-10 h-11 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
                        <div className="p-6 space-y-4">
                            {filteredServices.length > 0 ? (
                                filteredServices.map((service) => (
                                    <motion.div
                                        key={service.id}
                                        whileHover={{ y: -4, scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onSelect(service)}
                                        className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/10 transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start gap-4 relative z-10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors text-lg">
                                                        {service.service_name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 rounded-full border border-green-100">
                                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                        <span className="text-[10px] font-bold text-green-600 uppercase">Approved</span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-primary-50 text-primary-600 border-none font-bold px-3 py-1 mb-4">
                                                    {service.service_category?.replaceAll("_", " ")}
                                                </Badge>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {(service.service_types || []).slice(0, 3).map((type, idx) => (
                                                        <div key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                                                            <span className="text-primary-600 font-bold">{type.currency}{type.price}</span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span>{Math.round(type.duration / 60)} mins</span>
                                                        </div>
                                                    ))}
                                                    {(service.service_types || []).length > 3 && (
                                                        <div className="text-[11px] font-bold text-primary-400 px-2 py-1.5">
                                                            +{(service.service_types || []).length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="bg-primary-500 p-3 rounded-2xl text-white shadow-lg shadow-primary-500/30 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                                                <Icon icon="mdi:send" className="text-xl" />
                                            </div>
                                        </div>
                                        
                                        {/* Subtle Decorative Gradient */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Icon icon="mdi:magnify-close" className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">No services found</h3>
                                    <p className="text-sm text-gray-500 max-w-[200px]">Try searching for a different category or name</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white border-t flex justify-end">
                        <Button variant="ghost" onClick={onClose} className="text-gray-500">
                            Cancel
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
