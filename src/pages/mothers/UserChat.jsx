import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Smile, Mic, ClockFading, MessageCircleWarning, Check, CheckCheck, RotateCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetailsState } from "@/redux/slices/userDetailsSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDirectChat } from "@/hooks/chatHooks/useDirectChat";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate1, isoToAMPM } from "@/lib/utils";
import supabase from "@/database/dbInit";
import { sendNotifications } from '@/lib/notifications'
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCountdown } from "@/hooks/useCountdown";
import AudioPlayer from "./auxiliary/AudioPlayer";



export default function UserChat() {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const { state } = useLocation()
    const user = state?.user

    const profile = useSelector(state => getUserDetailsState(state).profile)
    const bookings = useSelector(state => getUserDetailsState(state).bookings)

    const latestBooking = bookings?.[0]

    const topRef = useRef()
    const bottomRef = useRef(null)
    const isAwaitingCompletion = useRef(false)

    const selectedChat = latestBooking
    const meId = profile?.id
    const peerId = user?.id

    const [input, setInput] = useState("");
    const [showPatientInfo, setShowPatientInfo] = useState(false);
    const [showSummaryNotesModal, setShowSummaryNotesModal] = useState(false);
    const [showSessionEndedModal, setShowSessionEndedModal] = useState(false);
    const [summaryNote, setSummaryNote] = useState('')

    const {
        status, messages, sendMessage, onlineUsers, insertSubStatus, updateSubStatus,
        canLoadMoreMsgs, loadMessages, bulkMsgsRead, refreshConnection
    } = useDirectChat({ topic: selectedChat?.id, meId, peerId });

    const {
        remaining, formatted, isInRange, status: countdownStatus
    } = useCountdown({ startTime: selectedChat?.start_time, durationInSeconds: selectedChat?.duration })

    const peerOnline = onlineUsers.includes(peerId)

    useEffect(() => {
        if (!selectedChat?.id) {
            toast.info("Unable to locate booking chat")
            navigate(-1)

            return;

        }

        // const booking_id = localStorage.getItem('booking_id')

        // if(booking_id == selectedChat?.id){
        //     const summary_note = localStorage.getItem('summary_note')

        //     setSummaryNote(summary_note)
        // }               
    }, [])

    useEffect(() => {
        if (messages?.length > 0) {
            bottomRef?.current?.scrollIntoView({ behaviour: 'smooth' })

            handleReadUnreadMsgs()
        }
    }, [messages]);

    if (!selectedChat?.id) {
        return <></>
    }

    const {
        day
    } = selectedChat

    const handleReadUnreadMsgs = () => {
        const unReadMsgsIds = (messages || [])?.filter(msg => (!msg?.read_at && msg?.to_user === meId)).map(msg => msg?.id)

        if (unReadMsgsIds?.length > 0) {
            bulkMsgsRead(unReadMsgsIds)
        }
    }

    const loadMoreMessages = async () => {
        try {
            dispatch(appLoadStart())

            const lastMsg = messages[0]
            const last_loaded_at = lastMsg?.created_at

            await loadMessages({ msgLoadedTimeStamp: new Date().toISOString(), last_loaded_at, isOlder: true })

            const scrollToTopDelay = setTimeout(() => {
                // console.log("RUNNING")
                topRef?.current?.scrollIntoView({ behaviour: 'smooth' })
                clearTimeout(scrollToTopDelay)
            }, 0)

        } catch (error) {
            console.warn(error)
            toast.error('Error retrieving messages')

        } finally {
            dispatch(appLoadStop())
        }
    }

    const updateStatusToAwaitingCompletion = async () => {
        try {

            const { data: statusData, error } = await supabase
                .from('all_bookings')
                .select('*')
                .single()
                .eq("id", selectedChat?.id)

            if (statusData) {
                if (statusData?.status === 'awaiting_completion') {
                    isAwaitingCompletion.current = true
                    return;
                }
            }

            await supabase
                .from('all_bookings')
                .update({
                    status: 'awaiting_completion'
                })
                .eq("id", selectedChat?.id)

        } catch (error) {
            console.log(error)
            toast.error("Error updating appointment status. Contact support after this session")
        }
    }

    const sendNow = () => {
        const myMessagesCount = (messages || []).filter(msg => msg.from_user == meId).length

        // if(myMessagesCount > 1 && !isAwaitingCompletion.current){
        //     // On first msg, update the booking status to awaiting_completion
        //     updateStatusToAwaitingCompletion()
        // }

        if (!input.trim()) return;
        sendMessage({ text: input.trim(), toUser: peerId, bookingId: selectedChat?.id });
        setInput('');
    };

    const notifyMother = async () => {
        try {
            dispatch(appLoadStart())

            await sendNotifications({
                tokens: [userInfo?.notification_token],
                // sound: null,
                title: `Incoming message from lavendercare vendor provider`,
                body: `New message detected`,
                data: {}
            });

            toast.success("Mother notified!")

        } catch (error) {
            console.log(error)
            toast.error("Error notifying mother. Messages have been sent though, she can view them on her lavendercare app")

        } finally {
            dispatch(appLoadStop())
        }
    }

    return (
        <div>
            <div className="flex h-[80vh] bg-gray-50 rounded-2xl">
                {/* Left Panel - Message List */}

                {/* Middle Panel - Chat Area */}
                <div className="flex-1 bg-white flex flex-col">
                    {
                        selectedChat
                            ?
                            <>
                                {/* Chat Header */}
                                <div className="p-4 flex-wrap gap-2 border-b border-gray-200 flex justify-between items-center bg-white">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={user?.profile_img || "/default-avatar.png"}
                                            alt={user?.name}
                                            className="w-14 h-14 rounded-full object-cover border"
                                        />
                                        <div>
                                            <h2 className="font-semibold text-gray-900">{user?.name}</h2>
                                            <p className="font-semibold text-xs text-primary-600 text-gray-900">
                                                {peerOnline ? 'online' : onlineUsers.length > 0 ? 'offline' : ''}
                                                <br />
                                                {countdownStatus}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-center txt-13 text-gray-600">
                                            {formatDate1({ dateISO: new Date(day).toISOString() })}
                                        </p>
                                        {/*<p className="text-center txt-15 text-gray-600">
                                        { timeToAMPM_FromHour({ hour }) } - { timeToAMPM_FromHour_Duration({ startHour: hour, durationInSeconds: duration }) }
                                    </p> */}
                                        <p className="text-center txt-16 text-gray-600">
                                            {formatted}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={notifyMother}
                                            className="text-sm bg-purple-600 hover:bg-purple-700 text-white cursor-pointer rounded-lg px-3 py-1"
                                        >
                                            Notify mother
                                        </button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="text-white bg-primary-600"
                                            onClick={() => setShowSummaryNotesModal(true)}
                                        >
                                            Notes
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-gray-600"
                                            onClick={() => navigate("/mothers/single-mother", { state: { user_id: user?.id } })}
                                        >
                                            View Info
                                        </Button>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <ScrollArea className="flex-1 overflow-y-auto p-4">
                                    <div className="space-y-4">
                                        {
                                            ['initial', ...messages].map((msg, i) => {

                                                if (msg === 'initial') {
                                                    if (!canLoadMoreMsgs) {
                                                        return <></>
                                                    }

                                                    return (
                                                        <div
                                                            key={msg}
                                                            ref={topRef}
                                                            className="flex items-center justify-center my-2"
                                                        >
                                                            <div onClick={loadMoreMessages} className="cursor-pointer px-2 py-2 rounded-full bg-purple-600">
                                                                <RotateCw size={20} color="#FFF" />
                                                            </div>
                                                        </div>
                                                    )
                                                }

                                                const { duration, message, from_user, pending, failed, created_at, read_at, delivered_at, file_type } = msg

                                                const iAmSender = from_user === meId ? true : false

                                                const seen = read_at ? true : false
                                                const delivered = delivered_at ? true : false

                                                return (
                                                    <div key={msg.id} className={`flex ${iAmSender ? 'justify-end' : 'justify-start'}`}>
                                                        <div>
                                                            <div className={`max-w-md ${iAmSender
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-gray-100 text-gray-900'
                                                                } rounded-2xl px-4 py-3`}>
                                                                {file_type === 'audio' ? (
                                                                    <div>
                                                                        <AudioPlayer
                                                                            channelId={selectedChat?.id}
                                                                            filePath={message}
                                                                            durationMillis={duration * 1000}
                                                                            iAmSender={iAmSender}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <p className="text-sm mb-3">{message}</p>

                                                                        <div className="flex flex-col items-end justify-end gap-">
                                                                            <p
                                                                                style={{
                                                                                    color: iAmSender ? '#FFF' : "_000"
                                                                                }}
                                                                                className="txt-10 m-0 p-0"
                                                                            >
                                                                                {isoToAMPM({ isoString: created_at })}
                                                                            </p>

                                                                            {
                                                                                iAmSender
                                                                                &&
                                                                                (
                                                                                    seen
                                                                                        ?
                                                                                        <CheckCheck size={11} color="#FFF" />
                                                                                        :
                                                                                        delivered
                                                                                        &&
                                                                                        <Check size={11} color="#FFF" />
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-end">
                                                                {
                                                                    pending
                                                                        ?
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <ClockFading color="#6F3DCB" size={15} />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="top" sideOffset={5}>
                                                                                Pending message. Sending...
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                        :
                                                                        failed
                                                                        &&
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <MessageCircleWarning color="#c41a2b" size={15} />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="top" sideOffset={5}>
                                                                                Error sending message
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }

                                        {/* Bottom Ref  */}
                                        <div ref={bottomRef} />
                                    </div>
                                </ScrollArea>

                                {/* Message Input */}
                                {
                                    (isInRange)
                                        ?
                                        (status == 'subscribed' && insertSubStatus == 'subscribed' && updateSubStatus == 'subscribed')
                                            ?
                                            <div className="p-4 border-t border-gray-200 bg-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 relative">
                                                        <textarea
                                                            value={input}
                                                            onChange={(e) => setInput(e.target.value)}
                                                            placeholder="Type a message..."
                                                            className="w-full px-3 py-1 rounded-md bg-gray-50 border-gray-200"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-gray-200"
                                                        >
                                                            <Smile className="w-4 h-4 text-gray-500" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
                                                    >
                                                        <Paperclip className="w-4 h-4 text-gray-500" />
                                                    </Button>
                                                    <Button
                                                        onClick={sendNow}
                                                        size="sm"
                                                        className="h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                                                    >
                                                        Send
                                                    </Button>
                                                </div>
                                            </div>
                                            :
                                            <div className="flex items-center justify-center">
                                                <div
                                                    onClick={refreshConnection}
                                                    className="text-center font-medium bg-purple-600 text-white m-3 py-3 px-7 cursor-pointer rounded-lg"
                                                >
                                                    Want to send a msg?
                                                </div>
                                            </div>
                                        :
                                        <div />
                                }
                            </>
                            :
                            <div className="flex flex-col h-100 items-center justify-center">
                                <h1>
                                    A chat shows here once you have selected it
                                </h1>
                            </div>
                    }
                </div>

                {/* Patient Info Modal */}

                {/* Summary note modal  */}
                {/* <SummaryNotesModal 
                    closeModal={() => setShowSummaryNotesModal(false)}
                    visible={showSummaryNotesModal}
                    booking={selectedChat}
                /> */}

                {/* Session ended modal  */}
                {/* <SessionEndedModal 
                    closeModal={() => setShowSessionEndedModal(false)}
                    booking_id={selectedChat?.id}
                    visible={showSessionEndedModal}
                    summaryNote={summaryNote}
                /> */}
            </div>
        </div>
    );
}       