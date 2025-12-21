import Table from "@/components/Table";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import { getBookingStatusBadge } from "@/lib/utilsJsx";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UsersTable({ users = [] }) {

    const navigate = useNavigate()

    const [pageListIndex, setPageListIndex] = useState(0)
    const [currentPage, setCurrentPage] = useState(0);

    const { pageItems, pageList, totalPageListIndex } = usePagination({
        arr: users,
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

    if (!Array.isArray(users)) return <></>

    // Table Columns
    const columns = [
        {
            key: "mother",
            label: "Mother",
            render: row => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Icon icon="mdi:mother-heart" className="text-primary-600 w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-semibold">{row.username}</p>
                    </div>
                </div>
            )
        },
        {
            key: "location",
            label: "Location",
            render: row => (
                <span className="capitalize">
                    {row.country} {row.state}, {row.city}
                </span>
            )
        },
        {
            key: "type",
            label: "Type",
            render: row =>
                row.is_pregnant === true ? "Pregnant" : row.is_pregnant === false ? "Post-Partum" : "TTC"
        },
        {
            key: "action",
            label: "Actions",
            render: row => (
                <div className="flex gap-2">
                    <Button
                        variant={'outline'}
                        size="sm"
                        onClick={() =>
                            navigate("/mothers/single-mother", { state: { user_id: row?.id } })
                        }
                    >
                        View
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary-600"
                        onClick={() =>
                            navigate("/mothers/single-mother/booking-chat", { state: { user: row } })
                        }
                    >
                        Chat
                    </Button>
                </div>
            )
        }
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
                emptyTitleText: "No mothers available",
                emptySubText: "Moms that book at least 1 service with you will appear here once added",
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