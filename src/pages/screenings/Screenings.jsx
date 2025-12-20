import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Download, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getMaxByKey } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { getRiskLevelBadge } from "@/lib/utilsJsx";
import { useReactToPrint } from "react-to-print";
import { usePagination } from "@/hooks/usePagination";
import useApiReqs from "@/hooks/useApiReqs";
import ScreeningsTable from "./auxiliary/ScreeningsTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectLabel, SelectValue } from "@/components/ui/select";


const MENTAL_HEALTH_TEST_TYPES = [
    "EPDS"
]


const weekFilters = [
    { title: 'All', keyword: null },

    //Weeks
    { title: 'This week', keyword: "this_week" },
    { title: 'Last week', keyword: "last_week" },
    { title: 'Next week', keyword: "next_week" },

    //Months
    { title: 'This month', keyword: 'this_month' },
    { title: 'Next month', keyword: 'next_month' },
    { title: 'Last month', keyword: "last_month" },
]

function isDateInRange({ dateToCheck, range }) {
    if (!dateToCheck || typeof dateToCheck !== "string") {
        return false; // Prevent invalid input crash
    }

    const checkDate = DateTime.fromISO(dateToCheck).startOf("day");
    if (!checkDate.isValid) return false;

    const today = DateTime.now().startOf("day");
    let startDate, endDate;

    if (range === "this_week") {
        startDate = today.startOf("week");
        endDate = today; // or .endOf("week") if you want whole week
    }
    else if (range === "last_week") {
        startDate = today.startOf("week").minus({ weeks: 1 });
        endDate = startDate.endOf("week");
    }
    else if (range === "next_week") {
        startDate = today.startOf("week").plus({ weeks: 1 });
        endDate = startDate.endOf("week");
    }
    else if (range === "this_month") {
        startDate = today.startOf("month");
        endDate = today.endOf('month');
    }
    else if (range === "last_month") {
        startDate = today.startOf("month").minus({ months: 1 });
        endDate = startDate.endOf("month");
    }
    else if (range === "next_month") {
        startDate = today.startOf("month").plus({ months: 1 });
        endDate = startDate.endOf("month");
    }
    else if (/^last_\d+_days$/.test(range)) {
        const days = parseInt(range.match(/\d+/)[0], 10);
        startDate = today.minus({ days });
        endDate = today;
    }
    else {
        throw new Error("Invalid range type");
    }

    return checkDate >= startDate && checkDate <= endDate;
}



const Screenings = () => {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const { getScreenings } = useApiReqs()

    const [screenings, setScreenings] = useState([])

    const screeningsContainerRef = useRef(null)

    const [searchTerm, setSearchTerm] = useState("");
    const [showWeekFilter, setShowWeekFilter] = useState(false)
    const [selectedType, setSelectedType] = useState("All");
    const [selectedWeekFilter, setSelectedWeekFilter] = useState(weekFilters[0])

    useEffect(() => {
        getScreenings({
            callBack: ({ screenings }) => {
                setScreenings(screenings)
            }
        })
    }, [])

    const exportElementToPdf = useReactToPrint({
        contentRef: screeningsContainerRef
    });

    const filteredData = screenings.filter(item => {

        const { user_profile, test_type, test_date } = item

        const checkDateISO = new Date(test_date).toISOString()

        const matchesSearch = user_profile?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = selectedType === "All" || test_type === selectedType;
        const datesFilter = selectedWeekFilter.title === 'All' || isDateInRange({ dateToCheck: checkDateISO, range: selectedWeekFilter.keyword })

        return matchesSearch && matchesFilter && datesFilter;
    });

    const handleExportBtnClick = async () => {
        try {
            exportElementToPdf({ ref: screeningsContainerRef.current })

        } catch (error) {
            console.log(error)
            toast.error("Error exporting screenings data")

        }
    }

    return (
        <div>
            <div className=" min-h-screen">
                {/* Top section with time filter and export */}
                <div className="flex justify-between items-center mb-6">
                    <div className="relative">
                        <button
                            onClick={() => setShowWeekFilter(prev => !prev)}
                            className="flex cursor-pointer items-center gap-2 bg-white px-4 py-2 rounded-lg border"
                        >
                            <span className="text-gray-700 font-medium">{selectedWeekFilter.title}</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>

                        {showWeekFilter && (
                            <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg p-4 z-50">
                                <h4 className="font-semibold mb-2">Filter</h4>

                                {/* Screening Type Pills */}
                                <label className="block text-sm text-gray-600 mb-2">Past days</label>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {weekFilters.map((filter) => (
                                        <button
                                            key={filter.title}
                                            onClick={() => {
                                                setSelectedWeekFilter(filter)
                                                setShowWeekFilter(false)
                                            }}
                                            className={`px-3 py-1 rounded-full border text-sm ${selectedWeekFilter.title === filter.title
                                                ? "bg-purple-600 text-white border-purple-600"
                                                : "border-gray-400 text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            {filter.title}
                                        </button>
                                    ))}
                                </div>

                                {/* <Button
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
                                    onClick={() => setShowFilter(false)}
                                >
                                    Apply
                                </Button> */}
                            </div>
                        )}
                    </div>

                    <Button onClick={handleExportBtnClick} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-black rounded-md hover:bg-gray-50">
                        <Icon icon="material-symbols:download" className="w-4 h-4" />
                        <span className="text-sm font-medium">Export</span>
                    </Button>
                </div>

                {/* Main content card */}
                <div ref={screeningsContainerRef} className="rounded-lg bg-white p-6 shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
                        <div>
                            <h2 className="text-2xl font-bold">All Screening</h2>
                            <p className="text-gray-500">Screenings for Moms that have booked at least 1 service with you</p>
                        </div>
                        {/* ✅ Search & Filter Controls */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                            {/* Search Input */}
                            <Input
                                placeholder="Search by username"
                                className="w-full md:min-w-sm py-5"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Filter Dropdown */}
                            <Select onValueChange={setSelectedType} defaultValue="All">
                                <SelectTrigger className="py-5">
                                    <SelectValue placeholder="Filter by: All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All</SelectItem>
                                    {
                                        MENTAL_HEALTH_TEST_TYPES.map(type => {
                                            return (
                                                <SelectItem value={type} className={'capitalize'}> {type} </SelectItem>
                                            )
                                        })
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <ScreeningsTable
                        screenings={filteredData}
                    />
                </div>
            </div>
        </div>
    );
};

export default Screenings;