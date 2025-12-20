import Modal from "@/components/Modal";
import Table from "@/components/Table";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/hooks/usePagination";
import { isoToDateTime } from "@/lib/utils";
import { getTicketPriorityBadge, getTicketStatusBadge } from "@/lib/utilsJsx";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react"
import CreateTicket from "./modals/CreateTicket";
import { useDispatch, useSelector } from "react-redux";
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import { toast } from "react-toastify";
import supabase from "@/database/dbInit";
import { getUserDetailsState } from "@/redux/slices/userDetailsSlice";
import TicketInfoModal from "./modals/TicketInfo";

export default function Support(){
    const dispatch = useDispatch()

    const profile = useSelector(state => getUserDetailsState(state).profile)

    const [tab, setTab] = useState('All')
    const [tickets, setTickets] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [pageListIndex, setPageListIndex] = useState(0) 
    const [createModalOpen, setCreateModalOpen] = useState(false)  
    const [activeTicket, setActiveTicket] = useState(null)
    const [apiReqs, setApiReqs] = useState({ isLoading: false, errorMsg: null, data: null }) 

    useEffect(() => {
        setApiReqs({
            isLoading: true,
            errorMsg: null,
            data: {
                type: 'fetchTickets'
            }
        })
    }, [])

    useEffect(() => {
        const { isLoading, data } = apiReqs

        if(isLoading) dispatch(appLoadStart());
        else dispatch(appLoadStop());

        if(isLoading && data){
            const { type, requestInfo } = data

            if(type === 'fetchTickets'){
                fetchTickets()
            }

            if(type === 'createTicket'){
                createTicket({ requestInfo })
            }
        }
    }, [apiReqs])

    const createTicket = async ({ requestInfo }) => {
        try {

            const { data, error } = await supabase
                .from("support_tickets")
                .insert(requestInfo)
                .select()
                .single()

            if(error){
                console.error(error)
                throw new Error()
            }

            const updatedTickets = [...tickets, data]
            setTickets(updatedTickets)

            setApiReqs({ isLoading: false, errorMsg: null, data: null })
            toast.success("Ticket created and submitted")

            return;
            
        } catch (error) {
            console.log(error)
            return createTicketFailure({ errorMsg: 'Something went wrong! Try again.' })
        }
    }
    const createTicketFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, data: null, errorMsg })
        toast.error(errorMsg)

        return;
    }

    const fetchTickets = async () => {
        try {

            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq("user_id", profile?.id)
                .order('created_at', { ascending: false })

            if(error){
                console.error(error)
                throw new Error()
            }

            setTickets(data)

            setApiReqs({ isLoading: false, errorMsg: null, data: null })
            
        } catch (error) {
            console.error(error)
            return fetchTicketsFailure({ errorMsg: 'Something went wrong! Try again.' })
        }
    }
    const fetchTicketsFailure = ({ errorMsg }) => {
        setApiReqs({ isLoading: false, errorMsg, data: null })
        toast.error(errorMsg)

        return;
    }

    const handleCreateTicket = ({ requestInfo }) => {
        setApiReqs({
            isLoading: true,
            errorMsg: null,
            data: {
                type: 'createTicket',
                requestInfo
            }
        })
    }

    // ✅ Filter & Search
    const filteredData = tickets.filter(
        (item) => {

            const { id, subject } = item

            const matchSearch = 
                (searchTerm.toLowerCase().includes(subject?.toLowerCase())
                ||
                subject.toLowerCase().includes(searchTerm?.toLowerCase()))

                ||

                (searchTerm.toLowerCase().includes(id?.toLowerCase())
                ||
                id.toLowerCase().includes(searchTerm?.toLowerCase()))

            const matchesFilter = (tab?.toLowerCase() === "all" || item.status === tab?.toLowerCase())

            return matchesFilter && matchSearch
        }
    ); 

    const { pageItems, pageList, totalPageListIndex } = usePagination({
        arr: filteredData,
        maxShow: 4,
        index: currentPage,
        maxPage: 5,
        pageListIndex
    });  

    const incrementPageListIndex = () => {
        if(pageListIndex === totalPageListIndex){
            setPageListIndex(0)
         
        } else{
            setPageListIndex(prev => prev+1)
        }

        return
    }

    const decrementPageListIndex = () => {
        if(pageListIndex == 0){
            setPageListIndex(totalPageListIndex)
        
        } else{
            setPageListIndex(prev => prev-1)
        }

        return
    }      

    const columns = [
        { key: "id", label: "Ticket ID" },
        { key: "subject", label: "Subject" },
        { 
            key: "created_at", 
            label: "Created On",
            render: (row) => (
                <span>
                    { isoToDateTime({ isoString: row?.created_at }) }
                </span>
            ),            
        },
        {
            key: "priority",
            label: "Priority",
            render: (row) => (
                getTicketPriorityBadge({ status: row?.priority })
            ),
        },
        {
            key: "field",
            label: "Field",
            // render: (row) => (
            //     getTicketPriorityBadge({ status: row?.priority })
            // ),
        },        
        {
            key: "status",
            label: "Status",
            render: (row) => (
                getTicketStatusBadge({ status: row?.status })
            ),
        },        
        {
            key: "action",
            label: "Action",
            render: (row) => (
                <button 
                    onClick={() => setActiveTicket(row)}
                    className="cursor-pointer px-4 py-1 text-sm bg-primary-500 text-grey-50 rounded-4xl"
                >
                    View
                </button>
            ),
        },
    ]; 

    return(
        <div className="py-6">
            <div className="flex flex-wrap items-center gap-5 mb-6 justify-between">
                <div className="flex items-center gap-7">
                    {
                        ['All', 'Open', 'Closed']
                        .map((t, i) => {

                            const isActive = tab === t ? true : false

                            return (
                                <p
                                    key={i}
                                    onClick={() => setTab(t)}
                                    className={`m-0 p-0 pb-1 font-bold cursor-pointer ${isActive ? 'border-b-4 px-4 border-primary-600 text-primary-600' : 'text-gray-600'}`}
                                >
                                    { t }
                                </p>
                            )
                        })
                    }
                </div>

                <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center gap-2 py-2 px-3 rounded-2xl cursor-pointer bg-primary-500 text-grey-50"
                >
                    <span className="w-6 h-6 flex items-center justify-center">
                        <Icon
                            icon="material-symbols-light:support-agent-outline-rounded"
                            width="24"
                            height="24"
                            className={({ isActive }) =>
                            activeNav === 'support' ? "text-grey-50" : "text-primary-900"
                            }
                        />
                    </span>
                    <span className="font-medium text-md">Create ticket</span>
                </button>
            </div>

            {/* ✅ Table Section */}
            <div className="bg-white rounded-2xl border">
                <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 pb-1 border-b-1">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-bold text-xl text-gray-900">Support tickets</h2>
                    </div>

                    {/* ✅ Search & Filter Controls */}
                    <div className="flex flex-col md:flex-row lg:w-auto w-full items-start md:items-center justify-between mb-4 gap-3">
                        {/* Search Input */}
                        <Input
                            placeholder="Search by ticket ID or subject"
                            className="w-full md:min-w-sm py-5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={filteredData}
                    styles={{
                        wrapper: "md:p-3 overflow-x-auto max-w-xs md:max-w-full",
                        table: "w-full border-collapse -mt-3",
                        headerRow: "bg-grey-50 text-left text-gray-700 text-sm border-b border-grey-100",
                        headerCell: "p-4 font-semibold",
                        row: "border-b hover:bg-gray-50",
                        cell: "p-4 text-sm",
                        emptyWrapper: "flex flex-col items-center justify-center py-20 text-center",
                        icon: "w-20 h-20 mb-6 text-primary-500",
                        emptyTitleText: "No tickets created",
                        emptySubText: "Support tickets will appear here",
                        emptyIcon: "uil:schedule"
                    }}
                    pagination={
                        <>
                            {
                                pageItems.length > 0
                                &&
                                    <div className="mt-6 w-full flex-1 flex items-center justify-center">
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
                                        </button>                         */}

                                        <div className="flex flex-wrap justify-center gap-2">
                                            {pageList?.map((p, i) => {

                                                const isActivePAge = p-1 === currentPage

                                                const handlePClick = () => {
                                                    if (p === '...'){
                                                        
                                                        if(i == 0){
                                                            decrementPageListIndex()
                                                        
                                                        } else{
                                                            incrementPageListIndex()
                                                        }

                                                        return;
                                                    }

                                                    setCurrentPage(p-1)

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
                                                )}
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
                                        </button>                         */}
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
            </div>   

            
            {
                createModalOpen
                &&
                    <CreateTicket 
                        hide={() => setCreateModalOpen(false)}
                        handleCreateTicket={handleCreateTicket}
                    />
            }

            <TicketInfoModal 
                ticket={activeTicket}
                hide={() => setActiveTicket(null)}
            />
        </div>
    )
}