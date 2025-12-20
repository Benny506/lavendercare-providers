import { getUserDetailsState } from "@/redux/slices/userDetailsSlice"
import AppointmentsPage from "./auxiliary/AppointmentsPage"
import { useSelector } from "react-redux"

export default function Bookings(){

    const bookings = useSelector(state => getUserDetailsState(state).bookings)

    return (
        <AppointmentsPage 
            appointments={bookings}
        />
    )
}