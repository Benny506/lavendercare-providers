import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getUserDetailsState } from '@/redux/slices/userDetailsSlice';
import supabase from '@/database/dbInit';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const profile = useSelector(state => getUserDetailsState(state).profile);
    const meId = profile?.id;

    const [unreadCount, setUnreadCount] = useState(0);
    const [activeChats, setActiveChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchChatSummaries = useCallback(async (isManual = false) => {
        if (!meId) return;
        if (isManual) setRefreshing(true);

        try {
            // 1. Fetch peer-to-peer chat list
            const { data: latestMsgs, error: msgsError } = await supabase
                .rpc('get_provider_chat_list', { p_provider_id: meId });

            if (!msgsError && latestMsgs) {
                setActiveChats(latestMsgs);
                const totalUnread = latestMsgs.reduce((acc, chat) => acc + (chat.unread_count || 0), 0);
                setUnreadCount(totalUnread);
            } else if (msgsError) {
                console.error("msgsError", msgsError);
            }
        } catch (error) {
            console.error("Error fetching chat summaries:", error);

        } finally {
            setLoading(false);
            if (isManual) setRefreshing(false);
        }
    }, [meId]);

    useEffect(() => {
        if (!meId) return;

        fetchChatSummaries();

        // Subscribe to changes in bookings_chats involving me
        // Using dual listeners for better efficiency (to_user and from_user)
        const channel = supabase.channel('global-chat-observer');

        channel
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'provider_user_conversations',
                    filter: `provider_id=eq.${meId}`
                },
                () => {
                    fetchChatSummaries();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [meId, fetchChatSummaries]);

    return (
        <ChatContext.Provider value={{ unreadCount, activeChats, loading, refreshing, refreshChats: fetchChatSummaries }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
