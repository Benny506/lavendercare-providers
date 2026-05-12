import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";
import { getPublicImageUrl } from "@/lib/requestApi";
import { formatDate1, isoToAMPM, isToday, isYesterday } from "@/lib/utils";
import ProfileImg from "@/components/ProfileImg";
import { Button } from "@/components/ui/button";
import { MessageSquare, ChevronRight, RotateCw, Mic, Image as ImageIcon, Video, LayoutGrid } from "lucide-react";

const Inbox = () => {
    const navigate = useNavigate();
    const { activeChats, loading, refreshChats, refreshing } = useChat();

    const sortedChats = useMemo(() => {
        return [...activeChats].sort((a, b) => {
            // 1. Unread count priority
            const aUnread = parseInt(a.unread_count || 0);
            const bUnread = parseInt(b.unread_count || 0);
            
            if (aUnread > 0 && bUnread === 0) return -1;
            if (aUnread === 0 && bUnread > 0) return 1;
            
            // 2. Timing priority (latest first)
            return new Date(b.last_message_at) - new Date(a.last_message_at);
        });
    }, [activeChats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const renderLastMessageSnippet = (type, message) => {
        switch (type) {
            case 'audio':
                return <div className="flex items-center gap-1"><Mic size={14} /> Voice note</div>;
            case 'image':
                return <div className="flex items-center gap-1"><ImageIcon size={14} /> Image</div>;
            case 'video':
                return <div className="flex items-center gap-1"><Video size={14} /> Video</div>;
            case 'service':
                return <div className="flex items-center gap-1"><LayoutGrid size={14} /> Shared a service</div>;
            default:
                return message;
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-500 mt-2">Manage your conversations with mothers on the platform.</p>
                </div>
                <Button 
                    onClick={() => refreshChats(true)}
                    disabled={refreshing}
                    variant="outline" 
                    className="rounded-full border-primary-200 text-primary-600 hover:bg-primary-50 gap-2 w-max"
                >
                    <RotateCw size={16} className={refreshing ? "animate-spin" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            {sortedChats.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
                        <MessageSquare size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No messages yet</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        Your conversations will appear here. 
                        Once a mother reaches out, you can start chatting instantly.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sortedChats.map((chat) => {
                        const {
                            last_message,
                            last_message_at,
                            last_message_type,
                            unread_count,
                            peer_id,
                            peer_name,
                            peer_img,
                            conversation_id
                        } = chat;

                        const timeDisplay = isToday(last_message_at) 
                            ? isoToAMPM({ isoString: last_message_at })
                            : isYesterday(last_message_at)
                                ? "Yesterday"
                                : formatDate1({ dateISO: last_message_at });

                        const handleOpenChat = () => {
                            navigate("/mothers/single-mother/booking-chat", {
                                state: {
                                    conversation_id,
                                    user: { id: peer_id, name: peer_name, profile_img: peer_img }
                                }
                            });
                        };

                        return (
                            <div 
                                key={peer_id}
                                onClick={handleOpenChat}
                                className="group bg-white hover:bg-primary-50/30 border border-gray-100 hover:border-primary-200 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-6 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                                {/* User Avatar */}
                                <div className="relative">
                                    <ProfileImg
                                        profile_img={getPublicImageUrl({ path: peer_img, bucket_name: 'user_profiles' })}
                                        name={peer_name}
                                        className="w-16 h-16 rounded-2xl shadow-sm"
                                    />
                                    {unread_count > 0 && (
                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                            {unread_count > 9 ? '9+' : unread_count}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-primary-700 transition-colors">
                                            {peer_name}
                                        </h3>
                                        <span className="text-xs font-medium text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg">
                                            {timeDisplay}
                                        </span>
                                    </div>

                                    <div className={`text-sm truncate mt-2 ${unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                        {renderLastMessageSnippet(last_message_type, last_message)}
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="hidden md:block">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center transition-all text-gray-400">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Inbox;
