import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Paperclip, Send, Smile, Mic, ClockFading, MessageCircleWarning, Check, CheckCheck, RotateCw, Delete, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetailsState } from "@/redux/slices/userDetailsSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDirectChat } from "@/hooks/chatHooks/useDirectChat";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate1, isoToAMPM, isToday, isYesterday } from "@/lib/utils";
import supabase from "@/database/dbInit";
import { sendNotifications } from '@/lib/notifications'
import { appLoadStart, appLoadStop } from "@/redux/slices/appLoadingSlice";
import { ScrollArea } from "@/components/ui/scroll-area";
import AudioPlayer from "./auxiliary/AudioPlayer";
import ProfileImg from "@/components/ProfileImg";
import { getPublicImageUrl, uploadAsset } from "@/lib/requestApi";
import MediaDisplay from "./auxiliary/MediaDisplay";
import FailedMsgModal from "./auxiliary/FailedMsgModal";
import ConfirmModal from "@/components/ConfirmModal";
import { useAudioRecorder } from "@/hooks/chatHooks/useAudioRecorder";
import { dmTopic } from "@/hooks/chatHooks/dm";
import { EMAIL_NOTIFY_MOTHER } from "@/constants/emailTemplates";
import ServicePicker from "./auxiliary/ServicePicker";
import ServiceCard from "./auxiliary/ServiceCard";
import useApiReqs from "@/hooks/useApiReqs";



export default function UserChat() {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    const { state } = useLocation()
    const user = state?.user
    const conversation_id = state?.conversation_id

    const profile = useSelector(state => getUserDetailsState(state).profile)
    const services = useSelector(state => getUserDetailsState(state).services)
    const { getServices } = useApiReqs()

    const topRef = useRef()
    const bottomRef = useRef(null)
    const fileRef = useRef(null)

    const meId = profile?.id
    const peerId = user?.id

    const [input, setInput] = useState("");
    const [failedMsgModal, setFailedMsgModal] = useState({ visible: false, hide: null })
    const [confirmDelete, setConfirmDelete] = useState({ visible: false, hide: null })
    const [showServicePicker, setShowServicePicker] = useState(false);

    const [recordingDuration, setRecordingDuration] = useState(0); // seconds

    const {
        status, messages, onlineUsers,
        canLoadMoreMsgs, loadMessages, bulkMsgsRead, refreshConnection,
        sendTempMedia, updateTempMedia, retrySend, deleteMessage,
        cancelRetrySend, sendMessage
    } = useDirectChat({ 
        topic: dmTopic(meId, peerId), 
        meId, 
        peerId,
        dbChannelId: conversation_id 
    });

    const peerOnline = onlineUsers.includes(peerId)

    useEffect(() => {
        if (!conversation_id) {
            toast.info("Unable to locate chat session")
            navigate(-1)
            return;

        } else {
            refreshConnection()
            getServices({})
        }
    }, [])

    useEffect(() => {
        if (messages?.length > 0) {
            bottomRef?.current?.scrollIntoView({ behaviour: 'smooth' })

            handleReadUnreadMsgs()
        }
    }, [messages]);

    if (!conversation_id) {
        return <></>
    }

    const openFailedMsgModal = ({ msg }) => setFailedMsgModal({ visible: true, hide: hideFailedMsgModal, msg })
    const hideFailedMsgModal = () => setFailedMsgModal({ visible: false, hide: null })

    const openConfirmDelete = ({ msg }) => setConfirmDelete({ visible: true, hide: hideConfirmDelete, msg })
    const hideConfirmDelete = () => setConfirmDelete({ visible: false, hide: null })


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


    const sendNow = () => {
        const myMessagesCount = (messages || []).filter(msg => msg.from_user == meId).length

        // if(myMessagesCount > 1 && !isAwaitingCompletion.current){
        //     // On first msg, update the booking status to awaiting_completion
        //     updateStatusToAwaitingCompletion()
        // }

        if (!input.trim()) return;
        sendMessage({ text: input, toUser: peerId, user_profile: user });
        setInput('');
    };

    const handleServiceSelect = (service) => {
        setShowServicePicker(false);
        const serviceData = JSON.stringify(service);
        sendMessage({ 
            text: serviceData, 
            fileType: 'service', 
            toUser: peerId, 
            user_profile: user 
        });
    };

    const retry = ({ msg }) => {
        const { file_type, message, id } = msg

        if (file_type === 'text' || (file_type !== 'text' && typeof message !== 'object')) {
            sendMessage({ text: message, fileType: file_type, toUser: peerId, oldMsgId: id, user_profile: user });

        } else {
            retrySend({ msgId: msg?.id })

            uploadAsset({
                file: [message],
                id: peerId,
                bucket_name: 'chat_media',
                ext: message?.name.split(".").pop()?.toLowerCase() || "",
            })
                .then(({ filePath }) => {
                    if (!filePath) {
                        cancelRetrySend({ msgId: msg?.id })
                        return toast.error('Upload error')
                    }

                    sendMessage({
                        text: filePath,
                        fileType: file_type,
                        toUser: peerId,
                        oldMsgId: id,
                        user_profile: user
                    });
                })
                .catch(error => {
                    console.log(error)
                    cancelRetrySend({ msgId: msg?.id })
                    toast.error('Upload error')
                })
        }
    }

    const notifyMother = async () => {
        try {
            dispatch(appLoadStart())

            const { data: customerEmail, error: customerEmailError } = await supabase.rpc('get_user_email', { p_user_id: user?.id });

            if (customerEmailError) throw customerEmailError;

            if (!customerEmail) throw new Error("User Not Found!");

            const logoUrl = `https://tzsbbbxpdlupybfrgdbs.supabase.co/storage/v1/object/public/public_assets/logo.svg`;
            const htmlContent = EMAIL_NOTIFY_MOTHER
                .replace("{{name}}", user?.name || "Mother")
                .replace("{{logoUrl}}", logoUrl);

            await supabase.functions.invoke('send-patient-email', {
                body: {
                    toEmail: customerEmail,
                    patientName: user?.name || "Mother",
                    subject: "Chat Request from LavenderCare",
                    htmlContent: htmlContent
                }
            });

            toast.success("Mother notified via and email!")

        } catch (error) {
            console.log(error)
            toast.error("Error notifying mother. Messages have been sent though, she can view them on her app")
        } finally {
            dispatch(appLoadStop())
        }
    }

    const handleVoiceNoteStop = async (blobUrl, blob) => {
        let audioBlob = blob;
        if (!audioBlob && blobUrl) {
            try {
                const res = await fetch(blobUrl);
                audioBlob = await res.blob();
            } catch (e) {
                console.error("Failed to fetch blob from url", e);
                return;
            }
        }
        if (!audioBlob) return;

        // Check if recording was cancelled
        if (isRecordingCancelled.current) {
            isRecordingCancelled.current = false;
            return;
        }

        // Get Duration
        const getDuration = (blob) => {
            return new Promise((resolve) => {
                const audio = document.createElement("audio");
                const objectUrl = URL.createObjectURL(blob);
                audio.src = objectUrl;
                audio.onloadedmetadata = () => {
                    const duration = audio.duration;
                    URL.revokeObjectURL(objectUrl);
                    resolve(duration); // in seconds
                };
                audio.onerror = () => {
                    resolve(null);
                }
            });
        };

        const duration = await getDuration(audioBlob) || recordingDurationRef.current;

        const type = 'audio'

        // Determine correct extension based on blob type
        const extension = 'wav';
        const mimeType = 'audio/wav';

        // Use the correct mime type for the File constructor
        const file = new File([audioBlob], `voice_note_${Date.now()}.${extension}`, { type: mimeType });

        const msg = sendTempMedia({
            file_type: type,
            text: file,
            duration: duration,
            toUser: peerId
        })

        uploadAsset({
            file: [file],
            id: peerId,
            bucket_name: 'voice_notes',
            ext: extension
        })
            .then(data => {
                const { error, filePaths } = data

                const uploadedFile = filePaths?.[0]

                updateTempMedia({
                    msgId: msg?.id,
                    failed: !uploadedFile ? true : false,
                    msgObj: {
                        ...msg,
                        message: uploadedFile
                    },
                    user_profile: user
                })
            })
            .catch(err => {
                console.log(err)
                toast.error("Failed to upload voice note");
                updateTempMedia({
                    msgId: msg?.id,
                    failed: true,
                    msgObj: {
                        ...msg,
                        message: null
                    },
                    user_profile: user
                })
            })
    }

    const { status: recordingStatus, startRecording, stopRecording, mediaBlobUrl, error: recorderError } = useAudioRecorder({ onStop: handleVoiceNoteStop });

    useEffect(() => {
        if (recorderError) {
            toast.error(recorderError);
        }
    }, [recorderError]);

    useEffect(() => {
        let interval;
        if (recordingStatus === "recording") {
            setRecordingDuration(0);
            recordingDurationRef.current = 0;
            interval = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
                recordingDurationRef.current += 1;
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [recordingStatus]);

    const isRecordingCancelled = useRef(false);
    const recordingDurationRef = useRef(0);

    const handleFileChange = (e) => {
        const MAX_SIZE = 15 * 1024 * 1024; // 15MB

        const file = e.target.files?.[0];
        if (!file) return;

        // Size check
        if (file.size > MAX_SIZE) {
            toast.info("File must be less than 15MB");
            return;
        }

        const mime = file.type;

        let type = ''
        let previewUrl = ''

        // Determine type
        if (mime.startsWith("image/")) {
            type = "image"

        } else if (mime.startsWith("video/")) {
            type = "video"

        } else if (
            mime === "application/pdf" ||
            mime === "application/msword"
            ||
            mime ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            toast.info("Only images, videos, are allowed")
            return;

        } else {
            toast.info("Only images, videos, are allowrd")
            return;
        }

        // Store file

        // Create preview URL for media

        const msg = sendTempMedia({
            file_type: type,
            text: file,
            toUser: peerId
        })

        uploadAsset({
            file: [file],
            id: peerId,
            bucket_name: 'chat_media',
            ext: file?.name.split(".").pop()?.toLowerCase() || ""
        })
            .then(data => {
                const { error, filePaths } = data

                const uploadedFile = filePaths?.[0]

                updateTempMedia({
                    msgId: msg?.id,
                    failed: !uploadedFile ? true : false,
                    msgObj: {
                        ...msg,
                        message: uploadedFile
                    },
                    user_profile: user
                })
            })
            .catch(err => {
                console.log(err)
                updateTempMedia({
                    msgId: msg?.id,
                    failed: true,
                    msgObj: {
                        ...msg,
                        message: uploadedFile
                    },
                    user_profile: user
                })
            })
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div>
            <div className="flex h-[80vh] bg-gray-50 rounded-2xl">
                {/* Left Panel - Message List */}

                {/* Middle Panel - Chat Area */}
                <div className="flex-1 bg-white flex flex-col">
                    {
                        peerId
                            ?
                            <>
                                {/* Chat Header */}
                                <div className="p-4 flex-wrap gap-2 border-b border-gray-200 flex justify-between items-center bg-white">
                                    <div className="flex items-center gap-3">
                                        <ProfileImg
                                            profile_img={getPublicImageUrl({ path: user?.profile_img, bucket_name: 'user_profiles' })}
                                            name={user?.name}
                                        />
                                        <div>
                                            <h2 className="font-semibold text-gray-900">{user?.name}</h2>
                                            <p className="font-semibold text-[10px] text-primary-600 uppercase tracking-wider">
                                                {status === 'connecting' ? 'connecting...' : peerOnline ? 'online' : onlineUsers.length > 0 ? 'offline' : ''}
                                            </p>
                                        </div>
                                    </div>


                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={refreshConnection}
                                            className="text-sm bg-purple-600 hover:bg-purple-700 text-white cursor-pointer rounded-lg px-3 py-1 flex items-center gap-2"
                                        >
                                            <RotateCw size={14} />
                                            Refresh Chat
                                        </button>
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
                                            onClick={() => navigate("/bookings")}
                                        >
                                            Booking History
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
                                                                {
                                                                    file_type === 'audio'
                                                                        ?
                                                                        (
                                                                            <div style={{ minWidth: '240px', minHeight: '20px' }}>
                                                                                <AudioPlayer
                                                                                    channelId={peerId}
                                                                                    filePath={message}
                                                                                    durationMillis={duration * 1000}
                                                                                    iAmSender={iAmSender}
                                                                                />
                                                                            </div>
                                                                        )
                                                                        :
                                                                        file_type === 'image' || file_type === 'video'
                                                                            ?
                                                                            (
                                                                                <div>
                                                                                    <MediaDisplay
                                                                                        url={
                                                                                            typeof message === 'object'
                                                                                                ?
                                                                                                URL.createObjectURL(message)
                                                                                                :
                                                                                                getPublicImageUrl({ path: message, bucket_name: 'chat_media' })
                                                                                        }
                                                                                        type={file_type}
                                                                                        align={iAmSender ? 'right' : 'left'}
                                                                                    />
                                                                                </div>
                                                                            )
                                                                            :
                                                                        file_type === 'service'
                                                                            ?
                                                                            (
                                                                                <ServiceCard 
                                                                                    service={message} 
                                                                                    iAmSender={iAmSender} 
                                                                                />
                                                                            )
                                                                            :
                                                                            (
                                                                                <div style={{ minWidth: '240px', minHeight: '20px' }}>
                                                                                    {
                                                                                        message
                                                                                            ?
                                                                                            <p className="text-sm mb-3">{message}</p>
                                                                                            :
                                                                                            <p style={{ fontStyle: 'italic' }} className="text-sm mb-3">Message deleted</p>
                                                                                    }
                                                                                </div>
                                                                            )
                                                                }

                                                                <div className="flex flex-col items-end justify-end gap-">
                                                                    <div
                                                                        style={{
                                                                            height: '0.2px',
                                                                            backgroundColor: iAmSender ? 'white' : 'gray',
                                                                            width: '100%'
                                                                        }}
                                                                        className="mb-2 mt-4"
                                                                    />
                                                                    <p
                                                                        style={{
                                                                            color: iAmSender ? '#FFF' : "_000"
                                                                        }}
                                                                        className="text-xs m-0 p-0"
                                                                    >
                                                                        {isoToAMPM({ isoString: created_at })}
                                                                    </p>
                                                                    <p
                                                                        style={{
                                                                            color: iAmSender ? '#FFF' : "_000"
                                                                        }}
                                                                        className="text-xs m-0 p-0"
                                                                    >
                                                                        {isToday(created_at) ? 'Today' : isYesterday(created_at) ? 'Yesteday' : formatDate1({ dateISO: created_at })}
                                                                    </p>
                                                                </div>
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
                                                                            ?
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <MessageCircleWarning onClick={() => openFailedMsgModal({ msg })} color="#c41a2b" size={15} />
                                                                                </TooltipTrigger>
                                                                                <TooltipContent side="top" sideOffset={5}>
                                                                                    Error sending message
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                            :
                                                                            (message && iAmSender)
                                                                            &&
                                                                            <div style={{}} className="flex items-center justify-end mt-3">
                                                                                <div onClick={() => openConfirmDelete({ msg })} style={{ borderRadius: '5px' }} className="p-1 bg-white">
                                                                                    <Trash color="#6F3DCB" />
                                                                                </div>
                                                                            </div>
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
                                    (status == 'subscribed')
                                        ?
                                        <div className="p-4 border-t border-gray-200 bg-white">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    ref={fileRef}
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    style={{ display: "none" }}
                                                    onChange={(e) => {
                                                        handleFileChange(e)
                                                        e.target.value = null
                                                    }}
                                                />

                                                {
                                                    recordingStatus === 'recording'
                                                        ?
                                                        <div className="flex items-center gap-3 w-full">
                                                            <div className="flex-1 flex items-center justify-between bg-gray-100 rounded-md px-4 py-2 text-red-500 animate-pulse">
                                                                <div className="flex items-center gap-2">
                                                                    <Mic className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">Recording...</span>
                                                                </div>
                                                                <span className="text-sm font-mono">{formatDuration(recordingDuration)}</span>
                                                            </div>
                                                            <Button variant="ghost" onClick={() => { isRecordingCancelled.current = true; stopRecording(); }}>
                                                                <Trash className="w-5 h-5 text-gray-500 hover:text-red-500" />
                                                            </Button>
                                                            <Button onClick={stopRecording} size="sm" className="h-10 w-10 p-0 rounded-full bg-purple-600 hover:bg-purple-700 text-white">
                                                                <Send className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        :
                                                        <>
                                                            <div className="flex-1 relative">
                                                                <textarea
                                                                    value={input}
                                                                    onChange={(e) => setInput(e.target.value)}
                                                                    placeholder="Type a message..."
                                                                    className="w-full px-3 py-1 rounded-md bg-gray-50 border-gray-200 whitespace-pre-wrap"
                                                                />
                                                            </div>
                                                                <Button
                                                                    onClick={() => setShowServicePicker(true)}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
                                                                    title="Reference Service"
                                                                >
                                                                    <LayoutGrid className="w-4 h-4 text-gray-500" />
                                                                </Button>
                                                                <Button
                                                                    onClick={() => fileRef?.current?.click?.()}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
                                                                >
                                                                    <Paperclip className="w-4 h-4 text-gray-500" />
                                                                </Button>
                                                            {
                                                                input.trim().length > 0
                                                                    ?
                                                                    <Button
                                                                        onClick={sendNow}
                                                                        size="sm"
                                                                        className="h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                                                                    >
                                                                        Send
                                                                    </Button>
                                                                    :
                                                                    <Button
                                                                        onClick={startRecording}
                                                                        size="sm"
                                                                        className="h-10 w-10 p-0 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                                                                    >
                                                                        <Mic className="w-4 h-4" />
                                                                    </Button>
                                                            }
                                                        </>
                                                }
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

            </div>

            <FailedMsgModal
                isOpen={failedMsgModal.visible}
                onClose={failedMsgModal.hide}
                onDelete={() => deleteMessage({ msgId: failedMsgModal?.msg?.id, msg: failedMsgModal?.msg })}
                onResend={() => retry({ msg: failedMsgModal?.msg })}
            />

            <ConfirmModal
                modalProps={{
                    ...confirmDelete,
                    data: {
                        yesFunc: () => {
                            deleteMessage({ msgId: confirmDelete?.msg?.id, msg: confirmDelete?.msg })
                        },
                        title: 'Delete this message',
                        msg: 'This action cannot be undone!'
                    }
                }}
            />

            <ServicePicker 
                isOpen={showServicePicker}
                onClose={() => setShowServicePicker(false)}
                services={services}
                onSelect={handleServiceSelect}
            />

        </div>
    );
}       