import React, { useState } from 'react'
import { walletTransactions } from '@/constants/constant'
import { Icon } from '@iconify/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import Table from '@/components/Table'
import Pagination from '@/components/Pagination'
import WithdrawModal from './WithdrawModal'
import ConfirmWithdrawalModal from './ConfirmWithdrawalModal'
import WithdrawalSuccessModal from './WithdrawalSuccessModal'
import TransactionDetailsModal from './TransactionDetailsModal'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { getUserDetailsState, setUserDetails } from '@/redux/slices/userDetailsSlice'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { usePagination } from '@/hooks/usePagination'
import { isoToDateTime } from '@/lib/utils'
import { appLoadStart, appLoadStop } from '@/redux/slices/appLoadingSlice'
import { onRequestApi } from '@/lib/requestApi'

const PERCENTAGE_FOR_PROVIDER = 90

const Wallet = () => {
    const dispatch = useDispatch()

    const bookings = useSelector(state => getUserDetailsState(state).bookings)
    const bank = useSelector(state => getUserDetailsState(state).bank)

    const completedBookings = (bookings || []).filter(b => b?.status === 'completed')

    const [apiReqs, setApiReqs] = useState({ isLoading: false, errorMsg: null, data: null })
    const [pageListIndex, setPageListIndex] = useState(0)
    const [tab, setTab] = useState("pending")
    const [currentPage, setCurrentPage] = useState(1)
    const [amountInfo, setAmountInfo] = useState({
        pendingBalance: 0, withdrawnBalance: 0
    })

    useEffect(() => {
        const completedBookings = (bookings || []).filter(b => b?.status === 'completed')

        if (completedBookings) {
            let pending = 0; let withdrawn = 0;

            for (let i = 0; i < completedBookings?.length; i++) {
                const { price, has_withdrawn } = completedBookings[i]

                const price_figure = (PERCENTAGE_FOR_PROVIDER / 100) * price

                if (has_withdrawn) {
                    withdrawn += price_figure

                } else {
                    pending += price_figure
                }
            }

            setAmountInfo({ pendingBalance: pending, withdrawnBalance: withdrawn })

        } else {
            toast.info("Can't seem to retrieve wallet information at the moment")
        }
    }, [bookings])

    useEffect(() => {
        const { isLoading, data } = apiReqs

        if (isLoading) dispatch(appLoadStart());
        else dispatch(appLoadStop());

        if (isLoading && data) {
            const { type, requestInfo } = data

            if (type === 'withdraw') {
                onRequestApi({
                    requestInfo,
                    successCallBack: withdrawSuccess,
                    failureCallback: withdrawFailure
                })
            }
        }
    }, [apiReqs])

    const withdrawSuccess = async ({ result, requestInfo }) => {
        try {
            
            toast.success("Withdrawal successful")

            const id = requestInfo?.data?.booking_id

            const updatedBookings = (bookings || []).map(b => {
                if(b?.id === id){
                    return {
                        ...b,
                        has_withdrawn: true
                    }
                }

                return b
            })

            dispatch(setUserDetails({
                bookings: updatedBookings
            }))
            
            setApiReqs({ isLoading: false, errorMsg: null, data: null })

        } catch (error) {
            console.log(error)
            return withdrawFailure({ errorMsg: 'Error updating your local state.' })
        }
    }
    const withdrawFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return
    }

    const filteredTransactions = completedBookings.filter(b => {

        const { has_withdrawn } = b

        const byTab = tab === 'pending' ? !has_withdrawn : has_withdrawn

        return byTab
    })

    const { pageItems, pageList, totalPageListIndex } = usePagination({
        arr: filteredTransactions,
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

    const walletInfo = [
        { tab: 'pending', title: "Pending Balance", value: amountInfo?.pendingBalance, icon: "ic:outline-account-balance-wallet" },
        { tab: 'withdrawn', title: "Withdrawn", value: amountInfo?.withdrawnBalance, icon: "ic:outline-account-balance-wallet" },
    ];

    const columns = [
        tab !== 'pending' && {
            key: "withdrawal_date",
            label: "Withdrawal date",
            render: (row) => (
                <span>{row?.withdrawal_date ? isoToDateTime({ isoString: new Date(row?.withdrawal_date) }) : 'Not withdrawn'}</span>
            )
        },
        { key: "id", label: "Reference ID" },
        // { key: "receivingBankAccount", label: "Receiving Bank Account" },
        {
            key: "amount",
            label: "Amount",
            render: (row) => {

                const priceForProvider = Math.floor((PERCENTAGE_FOR_PROVIDER / 100) * Number(row.price))

                return (
                    <span>{row.currency} {priceForProvider.toLocaleString()}</span>
                )
            }
        },
        // {
        //     key: "status",
        //     label: "Status",
        //     render: (row) => (
        //         <span className={`px-3 py-1 text-xs rounded-full font-medium
        //             ${row.status === "Success" && "bg-success-50 text-success-600"}
        //             ${row.status === "Processing" && "bg-warning-50 text-warning-700"}
        //             ${row.status === "Failed" && "bg-error-50 text-error-700"}`}
        //         >
        //             {row.status}
        //         </span>
        //     ),
        // },
        {
            key: "action",
            label: "Action",
            render: (row) => {
                const priceForProvider = 50 || Math.floor((PERCENTAGE_FOR_PROVIDER / 100) * Number(row.price))

                return (
                    <button
                        onClick={() => {
                            if (tab === 'pending') {
                                setApiReqs({
                                    isLoading: true,
                                    errorMsg: null,
                                    data: {
                                        type: 'withdraw',
                                        requestInfo: {
                                            url: 'https://tzsbbbxpdlupybfrgdbs.supabase.co/functions/v1/transfer-to-provider',
                                            method: 'POST',
                                            data: {
                                                bank_code: bank?.code,
                                                country_code: 'NG',
                                                account_number: bank?.account_number,
                                                account_name: `${bank?.first_name} ${bank?.last_name}`,
                                                account_type: bank?.account_type,
                                                amount: priceForProvider * 100, //Naira to kobo
                                                currency: bank?.currency,
                                                booking_id: row?.id
                                            }
                                        }
                                    }
                                })
                            }
                        }}
                        className="text-primary-500 text-sm font-extrabold cursor-pointer"
                    >
                        {
                            tab === 'pending'
                                ?
                                'Withdraw'
                                :
                                'View Receipt'
                        }
                    </button>
                )
            }
        },
    ];

    return (
        <div className="py-4 md:p-4 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
                {walletInfo.map((info, index) => {

                    const isActive = info?.tab == tab ? true : false

                    const bgColor = isActive ? 'bg-white' : 'bg-primary-50'
                    const textColor = isActive ? 'text-success-500' : 'text-grey-700'

                    const handleTabClick = () => {
                        setTab(info?.tab)
                    }

                    return (
                        <div
                            key={index}
                            onClick={handleTabClick}
                            className={`p-6 cursor-pointer rounded-lg flex items-center justify-between ${bgColor}`}
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2 items-center">
                                    {info.icon && (
                                        <Icon icon={info.icon} className={`text-xl ${textColor}`} />
                                    )}
                                    <p className="text-sm text-grey-600">{info.title}</p>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {typeof info.value === 'number'
                                        ? info.value.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })
                                        : info.value
                                    }
                                </h2>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Withdrawal History Header */}
            <div className="bg-white rounded-2xl border">
                <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 p-3 md:p-6 border-b-1">
                    <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                        <div className="flex flex-col gap-1">
                            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                Withdrawal History
                            </h2>
                            <p className="text-md text-gray-400">View your withdrawals below</p>
                        </div>

                        {/* <div>
                            <Select>
                                <SelectTrigger className="flex items-center border border-gray-200 rounded-md md:px-4 py-3 bg-white text-gray-700 text-sm font-medium">
                                    <Icon icon="uil:calender" className="md:mr-2 text-lg text-gray-400" />
                                    <SelectValue placeholder="January 01, 2023 - July 20, 2023" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="jan-jul-2023">January 01, 2023 - July 20, 2023</SelectItem>
                                    <SelectItem value="jul-dec-2023">July 21, 2023 - December 31, 2023</SelectItem>
                                    <SelectItem value="jan-jun-2024">January 01, 2024 - June 30, 2024</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div> */}
                    </div>
                    {/* <div className="flex items-center gap-4">
                        <Button className="bg-primary-500 text-white px-5 py-2 rounded-4xl font-bold text-sm min-w-[160px]">
                            Withdraw to Bank
                        </Button>
                    </div> */}
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={pageItems}
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
                    styles={{
                        wrapper: "md:p-3 overflow-x-auto max-w-2xs md:max-w-full",
                        table: "w-full border-collapse",
                        headerRow: "bg-grey-50 text-left text-gray-700 text-sm border-b border-grey-100",
                        headerCell: "p-4 font-semibold",
                        row: "border-b hover:bg-gray-50",
                        cell: "p-4 text-sm font-semibold",
                        emptyWrapper: "flex flex-col items-center justify-center py-20 text-center",
                        icon: "w-20 h-20 mb-6 text-primary-500",
                        emptyTitleText: "No data to display",
                        emptySubText: ".",
                        emptyIcon: "material-symbols:account-balance-outline"
                    }}
                />
            </div>

            {/* Modals (uncomment to activate) */}
            {/* <WithdrawModal /> */}
            {/* <ConfirmWithdrawalModal /> */}
            {/* <WithdrawalSuccessModal /> */}
            {/* <TransactionDetailsModal /> */}
        </div>
    )
}

export default Wallet