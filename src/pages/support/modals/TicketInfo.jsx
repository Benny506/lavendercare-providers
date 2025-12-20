import Modal from "@/components/Modal"
import { isoToDateTime } from "@/lib/utils"
import { getTicketPriorityBadge, getTicketStatusBadge } from "@/lib/utilsJsx"

export default function TicketInfoModal({ ticket, hide=()=>{} }) {

    if(!ticket) return <></>

    return (
        <Modal
            title={ticket?.subject}
            // primaryButton="Create"
            onClose={hide}
            // primaryButtonFunc={handleSubmit}
            styles={{
                wrapper: "max-w-md relative",
                content: "relative",
                title: "text-lg font-bold text-left text-black relative",
                closeIconWrapper: "absolute top-6 right-5 z-10",
                closeButton: "text-grey-500 hover:text-grey-700 p-1 cursor-pointer",
                closeIcon: "w-6 h-6",
                footer: "flex justify-end mt-4",
                primaryButton:
                    "bg-primary-500 text-white flex items-center gap-2 rounded-4xl !px-9 !py-3 !h-auto",
            }}
        >
            <div>
                {
                    [
                        { title: 'ID', value: ticket?.id }, 
                        { title: 'Field', value: ticket?.field }, 
                        { title: 'Details', value: ticket?.ticket_details }, 
                        { title: 'Created on', value: isoToDateTime({ isoString: ticket?.created_at }) }, 
                        { title: 'Priority', value: getTicketPriorityBadge({ status: ticket?.priority }) }, 
                        { title: 'Status', value: getTicketStatusBadge({ status: ticket?.status }) }, 
                    ]
                    .map((s, i) => {

                        const { title, value } = s

                        return (
                            <>
                                <div>
                                    <h2>
                                        { title }
                                    </h2>
                                    <p>
                                        { value }
                                    </p>
                                </div>     

                                <div className="my-7" />

                                <hr />

                                <div className="my-7" />                                                       
                            </>
                        )
                    })
                }
            </div>         
        </Modal>
    )
}