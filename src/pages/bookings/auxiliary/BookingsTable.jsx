import Table from "@/components/Table";
import { usePagination } from "@/hooks/usePagination";
import { getBookingStatusBadge } from "@/lib/utilsJsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BookingsTable({ bookings = [] }) {

    const navigate = useNavigate()

    const [pageListIndex, setPageListIndex] = useState(0)
    const [currentPage, setCurrentPage] = useState(0);

    const { pageItems, pageList, totalPageListIndex } = usePagination({
        arr: bookings,
        maxShow: 4,
        index: currentPage,
        maxPage: 5,
        pageListIndex
    });

    const incrementPageListIndex = () => {
        if (pageListIndex === totalPageListIndex) {
            setPageListIndex(0)

        } else {
            setPageListIndex(prev => prev + 1)
        }

        return
    }

    const decrementPageListIndex = () => {
        if (pageListIndex == 0) {
            setPageListIndex(totalPageListIndex)

        } else {
            setPageListIndex(prev => prev - 1)
        }

        return
    }

    if (!Array.isArray(bookings)) return <></>

    // Table Columns
    const columns = [
        { key: "id", label: "Booking Number" },
        { key: "day", label: "Booking Date" },
        {
            key: "service_name",
            label: "Service Booked",
            render: (row) => (
                <span>
                    {row?.serviceInfo?.service_name}
                </span>
            ),
        },
        {
            key: "username",
            label: "Mother",
            render: (row) => (
                <span>
                    {row?.user_profile?.username}
                </span>
            ),
        },
        { key: "location", label: "Location" },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                getBookingStatusBadge({ status: row?.status })
            ),
        },
        {
            key: "is_virtual",
            label: "Type",
            render: (row) => (
                <span>
                    {row?.is_virtual ? 'Virtual' : 'Physical'}
                </span>
            ),
        },
        {
            key: "action",
            label: "Action",
            render: (row) => (
                <button
                    onClick={() => navigate('/bookings/booking', { state: { booking_id: row?.id } })}
                    className="cursor-pointer px-4 py-1 text-sm bg-primary-500 text-grey-50 rounded-4xl"
                >
                    View
                </button>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            data={pageItems}
            styles={{
                wrapper: "md:p-3 overflow-x-auto max-w-xs md:max-w-full",
                table: "w-full border-collapse -mt-3",
                headerRow: "bg-grey-50 text-left text-gray-700 text-sm border-b border-grey-100",
                headerCell: "p-4 font-semibold",
                row: "border-b hover:bg-gray-50",
                cell: "p-4 text-sm",
                emptyWrapper: "flex flex-col items-center justify-center py-20 text-center",
                icon: "w-20 h-20 mb-6 text-primary-500",
                emptyTitleText: "No bookings available",
                emptySubText: "Your bookings will appear here once added",
                emptyIcon: "uil:schedule"
            }}
            pagination={
                <>
                    {
                        pageItems.length > 0
                        &&
                        <div className="mt-6 flex items-center justify-center">
                            {/* <button
                                        disabled={pageListIndex > 0 ? false : true}
                                        onClick={decrementPageListIndex}
                                        style={{
                                            opacity: pageListIndex > 0 ? 1 : 0.5
                                        }}
                                        className="cursor-not-allowed flex items-center text-gray-600 hover:text-gray-800 font-bold"
                                    >
                                        <Icon icon="mdi:arrow-left" className="mr-2" />
                                        <span className="hidden md:inline">Previous</span>
                                    </button> */}

                            <div className="flex flex-wrap justify-center gap-2">
                                {pageList?.map((p, i) => {

                                    const isActivePAge = p - 1 === currentPage

                                    const handlePClick = () => {
                                        if (p === '...') {

                                            if (i == 0) {
                                                decrementPageListIndex()

                                            } else {
                                                incrementPageListIndex()
                                            }

                                            return;
                                        }

                                        setCurrentPage(p - 1)

                                        return;
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={handlePClick}
                                            className={`w-8 h-8 cursor-pointer rounded-full ${isActivePAge ? "bg-primary-100 text-primary-600" : "text-gray-600"} flex items-center justify-center`}
                                        >
                                            {p}
                                        </button>
                                    )
                                }
                                )}
                            </div>
                            {/* <button
                                        disabled={pageListIndex < totalPageListIndex ? false : true}
                                        onClick={incrementPageListIndex}
                                        style={{
                                            opacity: pageListIndex < totalPageListIndex ? 1 : 0.5
                                        }}
                                        className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800 font-bold"
                                    >
                                        <span className="hidden md:inline">Next</span> <Icon icon="mdi:arrow-right" className="ml-2" />
                                    </button> */}
                        </div>
                    }
                </>
                // <Pagination
                //     currentPage={currentPage}
                //     totalPages={totalPages}
                //     onPageChange={handlePageChange}
                // />
            }
        />
    )
}