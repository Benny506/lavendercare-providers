import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Icon } from "@iconify/react"
import { Dot } from "lucide-react"
import { toast } from "react-toastify"
import supabase from "@/database/dbInit"
import BookingSummary from "../mothers/auxiliary/BookingSummary"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { getUserDetailsState } from "@/redux/slices/userDetailsSlice"
import {
    clockTimer,
    formatNumberWithCommas,
    formatTo12Hour,
    isoToDateTime,
    secondsToLabel
} from "@/lib/utils"
import { bookingsMap } from "@/lib/utilsJsx"

/* ------------------ Animations ------------------ */

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 }
    }
}

/* ------------------ Component ------------------ */

const BookingDetails = () => {
    const navigate = useNavigate()
    const { state } = useLocation()
    const booking_id = state?.booking_id

    const { bookings, services, profile } = useSelector(getUserDetailsState)
    const [booking, setBooking] = useState(null)
    const [service, setService] = useState(null)
    const [timerStr, setTimerStr] = useState("")
    const [showSummary, setShowSummary] = useState(false)
    const [isStartingChat, setIsStartingChat] = useState(false)

    /* ------------------ Fetch Booking ------------------ */

    useEffect(() => {
        if (!booking_id) {
            navigate("/bookings")
            return
        }

        const foundBooking = bookings?.find(b => b.id === booking_id)
        if (!foundBooking) {
            toast.info("Unable to locate booking")
            navigate("/bookings")
            return
        }

        const foundService = services?.find(s => s.id === foundBooking.service_id)

        setBooking(foundBooking)
        setService(foundService)
    }, [booking_id, bookings, services])

    /* ------------------ Countdown ------------------ */

    useEffect(() => {
        if (!booking) return

        const interval = setInterval(() => {
            const { str, isZero } = clockTimer({ start_time: booking.start_time })
            setTimerStr(str)
            if (isZero) clearInterval(interval)
        }, 1000)

        return () => clearInterval(interval)
    }, [booking])

    const handleBeginChat = async () => {
        if (isStartingChat) return
        
        try {
            setIsStartingChat(true)
            const { data, error } = await supabase.rpc('get_or_create_conversation', {
                p_my_id: profile.id,
                p_peer_id: booking.user_profile.id
            })

            if (error) throw error

            const conv = data && data.length > 0 ? data[0] : null
            if (!conv) throw new Error("Could not initialize conversation")

            navigate('/mothers/single-mother/booking-chat', { 
                state: { 
                    conversation_id: conv.conversation_id, 
                    user: booking.user_profile 
                } 
            })
        } catch (error) {
            console.error(error)
            toast.error(error.message || "Error starting chat session")
        } finally {
            setIsStartingChat(false)
        }
    }

    if (!booking || !service) return null

    const { service_name, service_category } = service
    const { status } = booking

    /* ------------------ Render ------------------ */

    return (
        <div className="min-h-screen space-y-6">

            {/* ---------- Hero Header ---------- */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-3xl p-6 overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #7B3FE4 0%, #9F6AFF 100%)"
                }}
            >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                    <div>
                        <button
                            onClick={() => navigate("/bookings")}
                            className="flex items-center gap-2 text-white/80 hover:text-white mb-3"
                        >
                            <Icon icon="ph:arrow-left" className="text-xl" />
                            <span className="font-medium">Back to bookings</span>
                        </button>

                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            {service_name}
                        </h1>

                        <Badge className="mt-3 bg-white/20 text-white border-none capitalize">
                            {service_category?.replaceAll("_", " ")}
                        </Badge>
                    </div>

                    <div className="text-white text-right">
                        <p className="text-sm opacity-80">Appointment in</p>
                        <p className="text-2xl font-bold">{timerStr}</p>
                    </div>
                </div>
            </motion.div>

            {/* ---------- Status ---------- */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl bg-white p-5 shadow-sm border-l-4"
                style={{ borderColor: "#7B3FE4" }}
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold capitalize">{status}</p>
                        <p className="text-sm text-gray-500">
                            {bookingsMap[status]?.feedBack}
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        {booking.is_paid && (
                            <Button 
                                onClick={handleBeginChat} 
                                size="sm"
                                disabled={isStartingChat}
                            >
                                {isStartingChat ? 'Connecting...' : 'Chat'}
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ---------- Session Summary ---------- */}
            <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Icon icon="ph:notebook-bold" className="text-xl text-primary-600" />
                        <h3 className="text-lg font-bold">Session Summary</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSummary(true)}
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    >
                        {booking.summary_note ? 'Edit Summary' : 'Add Summary'}
                    </Button>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                    {booking.summary_note ? (
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {booking.summary_note}
                        </p>
                    ) : (
                        <div className="flex flex-col items-center py-4 text-gray-400">
                            <Icon icon="ph:note-blank" className="text-3xl mb-2 opacity-20" />
                            <p className="text-sm">No clinical summary has been added for this session yet.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ---------- Order Details ---------- */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-sm border p-6">
                <h3 className="text-lg font-bold mb-4">Order Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { label: "Order ID", value: booking.id },
                        { label: "Placed On", value: isoToDateTime({ isoString: booking.created_at }) },
                        { label: "Appointment", value: new Date(booking.day).toDateString() },
                        { label: "Time", value: formatTo12Hour({ time: booking.start_time }) },
                        { label: "Duration", value: secondsToLabel({ seconds: booking.duration }) }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02 }}
                            className="rounded-xl bg-[#F3ECFF] p-4"
                        >
                            <p className="text-sm text-gray-500">{item.label}</p>
                            <p className="font-semibold text-gray-800">{item.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                    {[service.location, service.city, service.state, service.country].map(
                        (loc, i, arr) => (
                            <div key={i} className="flex items-center gap-1 text-sm">
                                <span className="font-medium capitalize">
                                    {loc?.replaceAll("_", " ")}
                                </span>
                                {i !== arr.length - 1 && <Dot size={18} />}
                            </div>
                        )
                    )}
                </div>
            </motion.div>

            {/* ---------- Customer + Summary ---------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Customer */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible"
                    className="rounded-2xl bg-white p-6 shadow-sm border">
                    <h3 className="text-lg font-bold mb-4">Customer</h3>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#E6D9FF] flex items-center justify-center font-bold text-[#7B3FE4]">
                            {booking.user_profile?.name?.[0]}
                        </div>

                        <div>
                            <p className="font-semibold">
                                {booking.user_profile?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                {booking.user_profile?.is_pregnant === true ? "Pregnant" : booking.user_profile?.is_pregnant === false ? "Post-partum" : "TTC"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Button
                            onClick={() => {
                                navigate('/mothers/single-mother', { state: { user_id: booking.user_profile?.id } })
                            }}
                            variant={"outline"}
                            className={"mt-5"}
                        >
                            More info
                        </Button>
                    </div>
                </motion.div>

                {/* Summary */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible"
                    className="rounded-2xl bg-white p-6 shadow-sm border">
                    <h3 className="text-lg font-bold mb-4">Summary</h3>

                    <div className="flex justify-between items-center">
                        <p className="text-gray-500">Cost</p>
                        <p className="text-xl font-bold text-[#7B3FE4]">
                            {booking.currency} {formatNumberWithCommas(booking.price)}
                        </p>
                    </div>
                </motion.div>
            </div>
            <BookingSummary
                isOpen={showSummary}
                onClose={() => setShowSummary(false)}
                bookingInfo={booking}
            />
        </div>
    )
}

export default BookingDetails
