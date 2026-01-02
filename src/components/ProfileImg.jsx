import { getPublicImageUrl } from "@/lib/requestApi";
import React from "react";

export default function ProfileImg({ profile_img, name, size = "12" }) {
    // fallback initials (first two characters of name)

    const initials = name ? name.substring(0, 2).toUpperCase() : "NA";

    return (
        <div
            className={`flex items-center justify-center ${profile_img ? '' : 'bg-gray-300'} rounded-full overflow-hidden w-${size} h-${size}`}
        >
            {profile_img ? (
                <img
                    src={profile_img}
                    alt={name || "User"}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="text-white font-semibold">
                    {initials}
                </span>
            )}
        </div>
    );
}
