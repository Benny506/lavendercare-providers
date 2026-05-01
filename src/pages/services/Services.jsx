import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { serviceStatuses } from "@/constants/constant";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetailsState } from "@/redux/slices/userDetailsSlice";
import { getServiceStatusBadge, servicesMap } from "@/lib/utilsJsx";
import { useNavigate } from "react-router-dom";
import { Dot } from "lucide-react";
import useApiReqs from "@/hooks/useApiReqs";
import ServiceBadge from "./auxiliary/ServiceBadge";

/* ---------------- Animations ---------------- */

const container = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const cardAnim = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: "easeOut" }
    }
};

/* ---------------- Component ---------------- */

export default function Services() {
    const navigate = useNavigate();
    const { getServices } = useApiReqs();

    const services = useSelector(
        state => getUserDetailsState(state).services
    );

    const [filter, setFilter] = useState("all");
    const [searchFilter, setSearchFilter] = useState("");

    useEffect(() => {
        getServices({ callBack: () => { } });
    }, []);

    const filteredServices = (services || []).filter(service => {
        const name = service.service_name?.toLowerCase();
        const category = service.service_category
            ?.replaceAll("_", " ")
            ?.toLowerCase();

        const search = searchFilter.toLowerCase();

        const matchesSearch =
            !search
                ?
                true
                :
                name?.includes(search) ||
                category?.includes(search);

        const matchesFilter =
            filter === "all" ? true : service.status === filter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col gap-6">

            {/* ---------------- Header ---------------- */}
            <div className="bg-white rounded-2xl border p-5 flex flex-col lg:flex-row gap-4 justify-between">
                <div>
                    <h2 className="font-bold text-2xl text-gray-900">Your Services</h2>
                    <p className="text-sm text-gray-400">
                        Manage, review and update your services
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Input
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        placeholder="Search services"
                        className="py-5"
                    />

                    <Select onValueChange={setFilter}>
                        <SelectTrigger className="py-5">
                            <SelectValue placeholder="Filter by: All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {serviceStatuses.map((status, i) => (
                                <SelectItem key={i} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={() => navigate("/service/setup")}
                        className="bg-primary-600 hover:bg-primary-700 rounded-full px-6 py-5 font-bold"
                    >
                        + Add Service
                    </Button>
                </div>
            </div>

            {/* ---------------- Cards ---------------- */}
            {filteredServices.length > 0 ? (
                <motion.div
                    key={filter}
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                    {filteredServices.map(service => {
                        const {
                            id,
                            service_name,
                            service_category,
                            status,
                            country,
                            state,
                            city,
                            location,
                            types
                        } = service;

                        const isPending = status === 'pending';
                        const isHidden = status === 'hidden';

                        return (
                            <motion.div
                                key={id}
                                variants={cardAnim}
                                whileHover={!isPending ? { y: -6 } : {}}
                                className={`relative bg-white rounded-3xl border shadow-sm transition overflow-hidden ${isHidden ? 'opacity-70 grayscale-[0.5]' : ''} ${isPending ? 'bg-gray-50/50 border-dashed' : 'hover:shadow-md'}`}
                            >
                                {/* Mode-based Gradient Accent */}
                                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
                                    isPending ? 'from-gray-200 to-gray-300' :
                                    service.scheduling_mode === 'instant' ? 'from-green-400 to-emerald-500' :
                                    service.scheduling_mode === 'logistics' ? 'from-blue-400 to-indigo-500' :
                                    service.scheduling_mode === 'program' ? 'from-purple-400 to-pink-500' :
                                    'from-amber-400 to-orange-500'
                                }`} />

                                <div className="p-6 space-y-5">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-bold text-lg leading-tight ${isPending ? 'text-gray-400' : 'text-gray-900'}`}>
                                                    {service_name}
                                                </h3>
                                                {isHidden && (
                                                    <Badge variant="outline" className="text-xs text-gray-400 border-gray-200 uppercase tracking-tighter">Hidden</Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge className="bg-[#F3ECFF] text-[#7B3FE4] border-none text-[10px] uppercase tracking-wider font-bold">
                                                    {service_category?.replaceAll("_", " ")}
                                                </Badge>
                                                <Badge className={`border-none text-[10px] uppercase tracking-wider font-bold ${
                                                    isPending ? 'bg-gray-100 text-gray-500' :
                                                    service.scheduling_mode === 'instant' ? 'bg-green-100 text-green-700' :
                                                    service.scheduling_mode === 'logistics' ? 'bg-blue-100 text-blue-700' :
                                                    service.scheduling_mode === 'program' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {service.scheduling_mode}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            {getServiceStatusBadge({ status })}
                                            <ServiceBadge service_type={service?.service_type} />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 py-2">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                                                Locations
                                            </p>
                                            <div className="flex items-center gap-1.5 text-gray-700">
                                                <Icon icon="mdi:map-marker-radius-outline" className="text-gray-400" />
                                                <span className="text-sm font-semibold">
                                                    {service?.service_location_links?.length > 0
                                                        ? `${service?.service_location_links?.length} linked`
                                                        : service.scheduling_mode === 'instant' ? 'Virtual' : 'None set'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                                                Pricing Tiers
                                            </p>
                                            <div className="flex items-center gap-1.5 text-gray-700">
                                                <Icon icon="mdi:tag-outline" className="text-gray-400" />
                                                <span className="text-sm font-semibold">
                                                    {service?.service_types?.length || 0} options
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <p className="text-xs text-gray-400 italic font-medium">
                                            Capacity: {service.concurrent_capacity || 1} { (service.concurrent_capacity || 1) > 1 ? 'Teams' : 'Slot' }
                                        </p>

                                        {isPending ? (
                                            <div className="flex items-center gap-1 text-gray-400 text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-full">
                                                <Icon icon="mdi:lock-outline" />
                                                Under Review
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    navigate("/service/setup", {
                                                        state: { service_id: id }
                                                    })
                                                }
                                                className="group flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-all text-sm"
                                            >
                                                Manage Service
                                                <Icon icon="mdi:chevron-right" className="text-xl group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                >
                    <Icon
                        icon="material-symbols:work-outline"
                        className="w-16 h-16 mb-4 text-primary-600"
                    />
                    <h3 className="text-lg font-semibold text-gray-600">
                        No services yet
                    </h3>
                    <p className="text-sm text-gray-500">
                        Create your first service to get started
                    </p>
                </motion.div>
            )}
        </div>
    );
}
