import { Icon } from "@iconify/react";
import Table from "@/components/Table";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { bookingsMap, getBookingStatusBadge, getServiceStatusBadge } from "@/lib/utilsJsx";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetailsState, setUserDetails } from "@/redux/slices/userDetailsSlice";
import { usePagination } from "@/hooks/usePagination";
import { useNavigate } from "react-router-dom";
import useApiReqs from "@/hooks/useApiReqs";
import BookingsTable from "./BookingsTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bookingStatuses } from "@/constants/constant";

const LIMIT = 100

const AppointmentsPage = ({ appointments = [] }) => {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const { getBookings } = useApiReqs()

    const services = useSelector(state => getUserDetailsState(state).services)

    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [bookings, setBookings] = useState([])
    const [bookingsCount, setBookingsCount] = useState({
        all: 0, total: 0, ongoing: 0, completed: 0, missed: 0, cancelled: 0, awaiting_completion: 0
    })

    useEffect(() => {
        getBookings({
            callBack: ({ }) => { }
        })
    }, [])

    useEffect(() => {
        const countObj = {
            all: 0, ongoing: 0, completed: 0, missed: 0, cancelled: 0, awaiting_completion: 0
        }

        const _b = (appointments || []).map(b => {

            const { status } = b

            const prevValue = countObj[status] || 0

            countObj[status] = prevValue + 1

            const service = (services || []).filter(s => s?.id == b?.service_id)[0]
            return {
                ...b,
                serviceInfo: service,
            }
        })

        countObj['all'] = _b?.length

        setBookings(_b)

        setBookingsCount(countObj)

    }, appointments, services)

    // ✅ Filter & Search
    const filteredData = bookings.filter(
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
        <div className="mt-4">
            {/* ✅ Summary Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 overscroll-x-none">
                {Object.keys(bookingsCount).map((status, index) => {

                    const iconColor = bookingsMap[status]?.color

                    const count = bookingsCount[status]

                    const isActive = filter.toLowerCase() === status?.toLowerCase()

                    return (
                        <div
                            key={index}
                            onClick={() => setFilter(status)}
                            className={`p-6 cursor-pointer rounded-lg flex items-center justify-between ${isActive ? 'bg-white' : 'bg-primary-50'}`}
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2 items-center">
                                    {
                                        status != 'all'
                                        &&
                                        <Icon icon={'uil:calender'} className={`text-xl ${iconColor}`} />
                                    }
                                    <p className="text-sm text-grey-600 capitalize">{status}</p>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{count}</h2>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl border">
                <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 pb-1 border-b-1">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-bold text-xl text-gray-900">All Bookings</h2>
                        <p className="text-xs text-gray-400">See all your bookings below</p>
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

                        {/* Filter Dropdown */}
                        {/* <Select onValueChange={setFilter} defaultValue="All">
                            <SelectTrigger className="py-5">
                                <SelectValue placeholder="Filter by: All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                {
                                    bookingStatuses.map(s => (
                                        <SelectItem value={s} className={'capitalize'}> { s } </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select> */}
                    </div>
                </div>

                {/* Table */}
                <BookingsTable 
                    bookings={filteredData}
                />
            </div>

            {/* Modals (uncomment to activate) */}
            {/* <CancelAppointment /> */}
            {/* <ConfirmAppointmentSuccess /> */}
            {/* <ConfirmAppointment /> */}
            {/* <CancelAppointmentSuccess /> */}
        </div>
    );
};

export default AppointmentsPage;