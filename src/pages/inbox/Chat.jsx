import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@iconify/react";
import { Check, CheckCheck, ClockFading, Menu, MessageCircleWarning, RotateCw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDirectChat } from "@/hooks/chatHooks/useDirectChat";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetailsState } from "@/redux/slices/userDetailsSlice";
import { isoToAMPM } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import { sendNotifications } from "@/lib/notifications";

export default function Chat({
    userInfo = {},
    selectedChat = {},
    setSidebar = () => { },
}) {

    const dispatch = useDispatch()

    const profile = useSelector(state => getUserDetailsState(state).profile)

    const bottomRef = useRef(null)
    const topRef = useRef(null)

    const [input, setInput] = useState("");

    const meId = profile?.id
    const peerId = userInfo?.id
    const topic = selectedChat?.id

    const {
        sendMessage, messages, status, insertSubStatus, updateSubStatus, onlineUsers, bulkMsgsRead,
        loadMessages, canLoadMoreMsgs, refreshConnection
    } = useDirectChat({
        topic,
        meId,
        peerId,
    })

    const peerOnline = onlineUsers.includes(peerId)

    useEffect(() => {
        if (messages?.length > 0) {
            bottomRef?.current?.scrollIntoView({ behaviour: 'smooth' })

            handleReadUnreadMsgs()
        }
    }, [messages]);

    const handleReadUnreadMsgs = () => {
        const unReadMsgsIds = (messages || [])?.filter(msg => (!msg?.read_at && msg?.to_user === meId)).map(msg => msg?.id)

        if(unReadMsgsIds?.length > 0){
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

    const sendNow = () => {
        const myMessagesCount = (messages || []).filter(msg => msg.from_user == meId).length

        if (myMessagesCount === 1) {
            // On first msg, update the booking status to awaiting_completion
            // updateStatusToAwaitingCompletion()
        }

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
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-primary-50 flex items-center justify-between p-4 border-b border-grey-200">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebar(true)}
                        className="lg:hidden cursor-pointer"
                    >
                        <Menu size={24} />
                    </button>
                    {
                        userInfo?.name
                            ?
                            <>
                                <img
                                    className="border-primary-400 rounded-full h-12 w-12"
                                    src={userInfo?.profile_img || "https://res.cloudinary.com/dqcmfizfd/image/upload/v1756168978/testing/mother-family-mom-svgrepo-com_uz0o5c.png"}
                                    alt={userInfo?.profile_img ? "Profile image" : "Dummy profile"}
                                />
                                <div>
                                    <p className="text-grey-800 text-xl font-bold">{userInfo?.name}</p>
                                    <p className="font-semibold text-xs text-primary-600 text-gray-900">
                                        {peerOnline ? 'online' : onlineUsers.length > 0 ? 'offline' : ''}
                                    </p>
                                    {/* <span className="text-primary-500 italic">Typing...</span> */}
                                </div>
                            </>
                            :
                            <>

                            </>
                    }
                </div>

                <button
                    onClick={notifyMother}
                    className="text-sm bg-purple-600 hover:bg-purple-700 text-white cursor-pointer rounded-lg px-3 py-1"
                >
                    Notify mother
                </button>

                {/* 3-dot menu */}
                {/* <div className="relative">
                    <Icon
                        icon="qlementine-icons:menu-dots-16"
                        width="20"
                        height="20"
                        className="cursor-pointer"
                        onClick={() => setShowMenu((prev) => !prev)}
                    />
                    {showMenu && (
                        <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border border-grey-200 w-40 z-50">
                            <ul className="flex flex-col">
                                <li className="px-4 py-2 hover:bg-grey-100 cursor-pointer">
                                    View info
                                </li>
                                <li className="px-4 py-2 hover:bg-grey-100 cursor-pointer">
                                    Mute Notification
                                </li>
                                <li className="px-4 py-2 hover:bg-grey-100 cursor-pointer">
                                    Pin Chat
                                </li>
                                <li className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer">
                                    Delete chat
                                </li>
                            </ul>
                        </div>
                    )}
                </div> */}
            </div>

            {/* Chat body */}
            <div className="max-h-[60vh] flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-grey-400">
                        <Icon
                            icon="mdi:message-text-outline"
                            width="48"
                            height="48"
                            className="text-primary-700"
                        />
                        <p className="mt-2 text-lg font-bold text-grey-600">
                            No messages to display
                        </p>
                        <p className="text-sm text-grey-500 text-center">
                            Messages from your clients will appear here. Select a chat from the menu
                        </p>
                    </div>
                ) : (
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

                        const { message, from_user, pending, failed, created_at, read_at, delivered_at } = msg

                        const iAmSender = from_user === meId ? true : false

                        const seen = read_at ? true : false
                        const delivered = delivered_at ? true : false

                        return (
                            <div key={i} className={`flex ${iAmSender ? 'justify-end' : 'justify-start'}`}>
                                <div>
                                    <div className={`max-w-xs ${iAmSender
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                        } rounded-2xl px-4 py-3`}>
                                        {msg.isVoice ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                                    <Mic className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 h-2 bg-white bg-opacity-20 rounded-full">
                                                    <div className="w-1/3 h-full bg-white rounded-full"></div>
                                                </div>
                                                <span className="text-xs opacity-75">0:15</span>
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
                                                // <Tooltip>
                                                //     <TooltipTrigger asChild>
                                                <ClockFading color="#6F3DCB" size={15} />
                                                // </TooltipTrigger>
                                                //     <TooltipContent side="top" sideOffset={5}>
                                                //         Pending message. Sending...
                                                //     </TooltipContent>
                                                // </Tooltip>                                                                    
                                                :
                                                failed
                                                &&
                                                // <Tooltip>
                                                //     <TooltipTrigger asChild>
                                                <MessageCircleWarning color="#c41a2b" size={15} />
                                            // </TooltipTrigger>
                                            //     <TooltipContent side="top" sideOffset={5}>
                                            //         Error sending message
                                            //     </TooltipContent>
                                            // </Tooltip>                                                                
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}

                <div ref={bottomRef} />
            </div>


            {/* Input bar */}
            {
                (
                    (status == 'subscribed' && insertSubStatus == 'subscribed' && updateSubStatus == 'subscribed')
                )
                ?
                    <div className="flex items-center gap-2 p-3 border-t border-grey-200">
                        <div className="relative flex-1">
                            <Input
                                value={input}
                                onChange={e => setInput(e?.target?.value)}
                                className="bg-grey-50 rounded pl-10 pr-20 py-6"
                                placeholder="Type a message"
                            />
                            <Icon
                                icon="fluent:emoji-16-regular"
                                width="22"
                                height="22"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-500 cursor-pointer"
                            />
                            <Icon
                                icon="mdi:paperclip"
                                width="22"
                                height="22"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-500 cursor-pointer"
                            />
                        </div>
                        {/* <div className="bg-primary-500 rounded-full text-grey-50 p-2 cursor-pointer w-10 h-10 flex items-center justify-center">
                                <Icon icon="material-symbols:mic-outline" width="22" height="22" />
                            </div> */}
                        <Button
                            onClick={sendNow}
                            size="sm"
                            className="h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                        >
                            Send
                        </Button>
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
            }
        </div>
    )
}