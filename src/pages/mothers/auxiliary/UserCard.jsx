import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function UserCard({ user }) {
    const navigate = useNavigate();

    if (!user) return null;

    const {
        id,
        name,
        username,
        city,
        state,
        country,
        is_pregnant,
        is_first_child,
        registered_antenatal,
        num_kids,
        profile_img,
    } = user;

    const pregnancyStatus =
        is_pregnant === null
            ? "TTC"
            : is_pregnant
                ? "Pregnant"
                : "Post-partum";

    return (
        <div className="bg-white border rounded-2xl p-4 flex flex-col gap-4 hover:shadow-md transition-shadow">

            {/* Top */}
            <div className="flex items-center gap-4">
                <img
                    src={profile_img || "/default-avatar.png"}
                    alt={name}
                    className="w-14 h-14 rounded-full object-cover border"
                />

                <div className="flex-1">
                    <p className="font-semibold text-gray-900 leading-tight">
                        {name || username}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                        {city}, {state}, {country}
                    </p>
                </div>

                <Badge
                    className={`capitalize ${is_pregnant
                            ? "bg-purple-100 text-purple-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                >
                    {pregnancyStatus}
                </Badge>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-grey-50 rounded-lg p-2">
                    <p className="font-semibold">{num_kids ?? 0}</p>
                    <p className="text-gray-500">Kids</p>
                </div>

                <div className="bg-grey-50 rounded-lg p-2">
                    <p className="font-semibold">
                        {is_first_child ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-500">First-time</p>
                </div>

                <div className="bg-grey-50 rounded-lg p-2">
                    <p className="font-semibold">
                        {registered_antenatal ? "Yes" : "No"}
                    </p>
                    <p className="text-gray-500">Antenatal</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
                <Button
                    variant={"outline"}
                    className="flex-1 rounded-full"
                    onClick={() =>
                        navigate("/mothers/single-mother", {
                            state: { user_id: id },
                        })
                    }
                >
                    View Profile
                </Button>

                <Button
                    variant="ghost"
                    className="rounded-full text-primary-600"
                    onClick={() => navigate(`/mothers/single-mother/booking-chat`, { state: { user } })}
                >
                    <Icon icon="ph:chat-circle-dots" className="text-xl" />
                </Button>
            </div>
        </div>
    );
}
