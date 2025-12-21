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

                        return (
                            <motion.div
                                key={id}
                                variants={cardAnim}
                                whileHover={{ y: -6 }}
                                className="relative bg-white rounded-3xl border shadow-sm hover:shadow-md transition overflow-hidden"
                            >
                                {/* Gradient Accent */}
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7B3FE4] to-[#9F6AFF]" />

                                <div className="p-5 space-y-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">
                                                {service_name}
                                            </h3>
                                            <Badge className="mt-2 bg-[#F3ECFF] text-[#7B3FE4] border-none">
                                                {service_category?.replaceAll("_", " ")}
                                            </Badge>
                                        </div>

                                        {getServiceStatusBadge({ status })}
                                    </div>

                                    {/* Types */}
                                    {types?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-1">
                                                Session Types
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {types.map((t, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                                                    >
                                                        {t.type_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Location */}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">
                                            Location
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                                            {[country, state, city, location].map((s, i) => (
                                                <span key={i} className="flex items-center gap-1">
                                                    <Dot size={16} />
                                                    {s?.replaceAll("_", " ")}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <p className="text-xs text-gray-500 max-w-[70%]">
                                            {servicesMap?.[status]?.feedBack}
                                        </p>

                                        <button
                                            onClick={() =>
                                                navigate("/services/service", {
                                                    state: { service_id: id }
                                                })
                                            }
                                            className="flex items-center gap-2 text-primary-600 font-bold hover:gap-3 transition-all"
                                        >
                                            View
                                            <Icon icon="mdi:arrow-right" className="text-lg" />
                                        </button>
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
