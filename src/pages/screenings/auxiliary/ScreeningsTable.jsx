import Table from "@/components/Table";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import { getMaxByKey } from "@/lib/utils";
import { getBookingStatusBadge, getRiskLevelBadge } from "@/lib/utilsJsx";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TestInfoModal from "./TestInfoModal";

export default function ScreeningsTable({ screenings = [], hideViewBtn = false }) {

    const navigate = useNavigate()

    const handleViewDetails = (item) => {
        // navigate('/individual/dashboard/screenings/case-report', { state: { patient_id: item?.user_profile?.id } })
    };

    const [pageListIndex, setPageListIndex] = useState(0)
    const [currentPage, setCurrentPage] = useState(0);
    const [testInfoModal, setTestInfoModal] = useState({ show: false, data: null })

    const { pageItems, pageList, totalPageListIndex } = usePagination({
        arr: screenings,
        maxShow: 4,
        index: currentPage,
        maxPage: 5,
        pageListIndex
    });

    const openTestInfoModal = ({ data }) => setTestInfoModal({ show: true, data })

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

    if (!Array.isArray(screenings)) return <></>

    // Table Columns
    const columns = [
        {
            key: "Submission Date",
            label: "date",
            render: row => (
                <span className="capitalize">
                    {new Date(row?.test_date).toDateString()}
                </span>
            )
        },
        {
            key: "mother",
            label: "Mother",
            render: row => (
                <span className="capitalize">
                    {row?.user_profile?.name}
                </span>
            )
        },
        {
            key: "score",
            label: "Score",
        },
        {
            key: "risk_level",
            label: "Score Risk Level",
            render: row => (
                <div className="text-center py-2">
                    {getRiskLevelBadge(row?.risk_level?.toLowerCase())}
                </div>
            )
        },
        {
            key: "max_risk",
            label: "Answer Max Risk %",
            render: row => {

                const answer = row?.answer

                const max_risk_percent = getMaxByKey({ arr: answer?.filter(ans => ans.alert_level == 'high' || ans?.alert_level == 'severe'), key: 'risk_level' })

                return (
                    <div className="text-center py-2">
                        {max_risk_percent?.risk_percent}%
                    </div>
                )
            }
        },
        {
            key: "action",
            label: "Actions",
            render: row => (
                <div className="flex gap-2">
                    {
                        !hideViewBtn
                        &&
                        <Button
                            variant={'outline'}
                            size="sm"
                            onClick={() =>
                                // console.log(row?.user_profile)
                                navigate("/screenings/single-screening", { state: { user: row?.user_profile } })
                            }
                        >
                            View
                        </Button>
                    }
                    <Button
                        size="sm"
                        className={"bg-[#7b3fe4]"}
                        onClick={() =>
                            // console.log(row?.user_profile)
                            openTestInfoModal({ data: row })
                        }
                    >
                        Results
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
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
                    emptyTitleText: "No screening found",
                    emptySubText: "Mental-Health-Screenings-Test for Moms that book at least 1 service with you will appear here",
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

            <TestInfoModal
                show={testInfoModal.show}
                data={testInfoModal.data}
                onClose={() => setTestInfoModal({ show: false, data: null })}
            />
        </>
    )
}