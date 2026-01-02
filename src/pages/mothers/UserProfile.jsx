import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import useApiReqs from "@/hooks/useApiReqs";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookingStatuses } from "@/constants/constant";
import BookingsTable from "../bookings/auxiliary/BookingsTable";
import ScreeningsTable from "../screenings/auxiliary/ScreeningsTable";
import { useSelector } from "react-redux";
import { getUserDetailsState } from "@/redux/slices/userDetailsSlice";
import ProfileImg from "@/components/ProfileImg";
import { getPublicImageUrl } from "@/lib/requestApi";

export default function UserProfile() {
    const navigate = useNavigate();

    const stateData = useLocation().state
    const user_id = stateData?.user_id

    const { getUserInfo } = useApiReqs()

    const assignedMothers = useSelector(state => getUserDetailsState(state).assignedMothers)

    const [user, setUser] = useState({})
    const [userBookings, setUserBookings] = useState([])
    const [userScreenings, setUserScreenings] = useState([])
    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (user_id) {
            if (assignedMothers?.map(m => m?.mother_id)?.includes(user_id)) {
                getUserInfo({
                    callBack: ({ user, userBookings, userScreenings }) => {
                        setUser(user)
                        setUserBookings(userBookings?.map(b => {
                            return {
                                ...b,
                                user_profile: user
                            }
                        }))
                        setUserScreenings(userScreenings?.map(s => {
                            return {
                                ...s,
                                user_profile: user
                            }
                        }))
                    },
                    user_id
                })

            } else {
                navigate(-1)
                toast.info("Mother not assigned to you")
            }
        } else {
            navigate(-1)
            toast.info("Mother information not found")
        }
    }, [stateData])

    if (!user_id) return <></>

    const {
        name,
        username,
        email,
        city,
        state,
        country,
        num_kids,
        height,
        weight,
        is_home_mum,
        is_pregnant,
        is_first_child,
        is_first_pregnancy,
        youngest_child_age,
        last_birth_regular,
        failed_deliveries_count,
        registered_antenatal,
        profile_img,
    } = user;

    const filteredData = userBookings.filter(
        (item) => {

            const { id, serviceInfo } = item

            const { service_name } = serviceInfo

            const matchSearch =
                (searchTerm.toLowerCase().includes(service_name?.toLowerCase())
                    ||
                    service_name.toLowerCase().includes(searchTerm?.toLowerCase()))

                ||

                (searchTerm.toLowerCase().includes(id?.toLowerCase())
                    ||
                    id.toLowerCase().includes(searchTerm?.toLowerCase()))

            const matchesFilter = (filter?.toLowerCase() === "all" || item.status === filter)

            return matchesFilter && matchSearch
        }
    );


    return (
        <div className="min-h-screen bg-grey-50 p-6 md:p-12 space-y-8 rounded-lg">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-primary-600 font-semibold"
                >
                    <Icon icon="ph:arrow-left" className="text-xl" />
                    Back
                </button>
                <h1 className="text-2xl font-bold text-grey-900">{name}</h1>
            </div>

            {/* Top Card: Basic Info */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6">
                <ProfileImg 
                    profile_img={getPublicImageUrl({ path: profile_img, bucket_name: 'user_profiles' })}
                    name={name}
                    size="24"
                />
                <div className="flex-1 space-y-2">
                    <p className="text-lg font-semibold">{name}</p>
                    <p className="text-grey-600">{is_pregnant === null ? 'TTC' : is_pregnant ? 'Pregnant' : 'Post-partum'}</p>
                    <p className="text-grey-600 capitalize">{city}, {state}, {country}</p>
                </div>
                <Button
                    onClick={() => {
                        navigate(`/mothers/single-mother/booking-chat`, { state: { user } })
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-full px-6 py-3 font-semibold"
                >
                    Chat
                </Button>
            </div>

            {/* Health & Pregnancy Info */}
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold text-grey-900">Health & Pregnancy</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">Height</p>
                        <p>{height} ft</p>
                    </div>
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">Weight</p>
                        <p>{weight} kg</p>
                    </div>
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">Number of Kids</p>
                        <p>{num_kids}</p>
                    </div>
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">Home Mum</p>
                        <p>{is_home_mum ? "Yes" : "No"}</p>
                    </div>
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">Pregnant</p>
                        <p>{is_pregnant ? "Yes" : "No"}</p>
                    </div>
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">First Child</p>
                        <p>{is_first_child ? "Yes" : "No"}</p>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold text-grey-900">Additional Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">First Pregnancy</p>
                        <p>{is_first_pregnancy ? "Yes" : "No"}</p>
                    </div>
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">Youngest Child Age</p>
                        <p>{youngest_child_age?.toFixed(1)} months</p>
                    </div>
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">Last Birth Regular</p>
                        <p>{last_birth_regular ? "Yes" : "No"}</p>
                    </div>
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">Failed Deliveries</p>
                        <p>{failed_deliveries_count}</p>
                    </div>
                    <div className="p-4 bg-grey-50 rounded-xl text-center">
                        <p className="font-semibold text-grey-800">Registered Antenatal</p>
                        <p>{registered_antenatal ? "Yes" : "No"}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border">
                <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 pb-1 border-b-1">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-bold text-xl text-gray-900">Bookings History</h2>
                        <p className="text-xs text-gray-400">See bookings made by this mother below</p>
                    </div>

                    {/* ✅ Search & Filter Controls */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                        {/* Search Input */}
                        <Input
                            placeholder="Search by booking number or name"
                            className="w-full md:min-w-sm py-5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select onValueChange={setFilter} defaultValue="All">
                            <SelectTrigger className="py-5">
                                <SelectValue placeholder="Filter by: All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                {
                                    bookingStatuses.map(s => (
                                        <SelectItem value={s} className={'capitalize'}> {s} </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <BookingsTable
                    bookings={filteredData}
                />
            </div>

            <div className="bg-white rounded-2xl border">
                <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 pb-1 border-b-1">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-bold text-xl text-gray-900">Screenings History</h2>
                        <p className="text-xs text-gray-400">See mental-health-screening taken by this mother below</p>
                    </div>
                </div>

                {/* Table */}
                <ScreeningsTable
                    screenings={userScreenings}
                />
            </div>
        </div>
    );
}
