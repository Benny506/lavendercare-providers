import supabase from '../../database/dbInit';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { appLoadStart, appLoadStop } from '../../redux/slices/appLoadingSlice';
import { getMessages, setChannelIds } from '../../redux/slices/messagesSlice';
import { subtleLoadStart, subtleLoadStop } from '../../redux/slices/subtleLoaderSlice';
import { toast } from 'react-toastify';
import { sendNotifications } from '@/lib/notifications';
import { getUserDetailsState } from '@/redux/slices/userDetailsSlice';

const notifyMother = async ({ msg, mother, provider }) => {
  try {

    let token = mother?.notification_token
    const mother_id = mother?.id

    if (!token && mother_id) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('notification_token')
        .eq('id', mother_id)
        .single()

      if (error) {
        console.log(error)
        return
      }

      if (data) {
        token = data?.notification_token
      }
    }

    if (!token) {
      return;
    }

    return await sendNotifications({
      tokens: [token],
      // sound: null,
      title: `${provider?.username || "Provider"}`,
      body: msg,
      data: {
        notification_type: "care-coordinator-chat"
      }
    });


  } catch (error) {
    console.log(error)
    // toast.error("Error notifying mother. Messages have been sent though, she can view them on her lavendercare app")
  }
}

// utility to check if messages are the same by ID + read/delivered/read_at
function areMessagesEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    const msgA = a[i];
    const msgB = b[i];

    if (
      msgA.read_at !== msgB.read_at ||
      msgA.delivered_at !== msgB.delivered_at ||
      msgA.pending !== msgB.pending ||
      msgA.failed !== msgB.failed
    ) {
      return false;
    }
  }
  return true;
}

export function useDirectChat({ topic, meId, peerId, dbChannelId }) {

  const dispatch = useDispatch()

  const channelRef = useRef(null);
  const msgsRef = useRef(null)

  const savedMsgs = useSelector(state => getMessages(state).channelIds[topic])
  const profile = useSelector(state => getUserDetailsState(state).profile)

  const [status, setStatus] = useState('connecting');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [canLoadMoreMsgs, setCanLoadMoreMsgs] = useState(true)

  const tableName = "bookings_chats"
  const rpcName = "fetch_and_mark_user_chat_messages"

  const sendTempMedia = useCallback(({ file_type, text, duration, toUser }) => {
    try {
      const msg = text
      if (!msg || !file_type) return;

      const tempId = uuidv4();
      const optimisticMessage = {
        id: tempId,
        from_user: meId,
        to_user: toUser || peerId,
        message: msg,
        created_at: new Date().toISOString(),
        delivered_at: null,
        read_at: null,
        pending: true,
        failed: false,
        file_type,
        duration: duration ?? null
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      return optimisticMessage
    } catch (error) {
      console.log(error)
      toast.error("Sending error")
    }
  }, [meId, peerId, topic])

  const updateTempMedia = useCallback(async ({ msgId, failed, msgObj, user_profile }) => {
    try {
      if (!msgObj) return;

      if (failed) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === msgId ? { ...msg, pending: false, failed: true } : msg
          )
        );
      } else {
        const msgObjClone = { ...msgObj }

        setMessages(prev => prev?.map(msg => {
          if (msg?.id === msgId) {
            return msgObjClone
          }
          return msg
        }))

        const realMessage = { ...msgObjClone }
        delete realMessage.pending
        delete realMessage.failed

        let inserted = false
        const { error } = await supabase.from(tableName).insert(realMessage);
        if (!error) inserted = true;
        else {
          console.log(error)
        }

        if (!inserted) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === msgId ? { ...msg, pending: false, failed: true } : msg
            )
          );
        } else {
          channelRef.current?.send({
            type: 'broadcast',
            event: 'sendMsg',
            payload: user_profile ? { ...realMessage, user_profile } : realMessage
          })

          notifyMother({
            msg: 'Sent a media file',
            mother: user_profile,
            provider: profile
          })
        }
      }
    } catch (error) {
      console.log(error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, pending: false, failed: true } : msg
        )
      );
      toast.error("Sending error")
    }
  }, [meId, topic])

  const deleteMessage = async ({ msgId, msg }) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", msgId)

      if (error) {
        console.log(error)
        throw new Error()
      }

      const deletedMsg = {
        id: msgId, from_user: msg?.from_user, created_at: msg?.created_at
      }

      setMessages(prev => prev?.map(msg => msg?.id === msgId ? deletedMsg : msg))

      channelRef.current?.send({
        type: 'broadcast',
        event: 'updateMsg',
        payload: deletedMsg
      })
    } catch (error) {
      console.log(error)
      toast.error('Cant seem to delete messages at this time')
    }
  }

  const retrySend = useCallback(({ msgId }) => {
    setMessages(prev => prev?.map(msg => {
      if (msg?.id === msgId) {
        return { ...msg, pending: true, failed: false }
      }
      return msg
    }))
  }, [meId, topic])

  const cancelRetrySend = useCallback(({ msgId }) => {
    setMessages(prev => prev?.map(msg => {
      if (msg?.id === msgId) {
        return { ...msg, pending: false, failed: true }
      }
      return msg
    }))
  }, [meId, topic])

  const sendMessage = useCallback(
    async ({ text, toUser, user_profile, fileType, duration, oldMsgId }) => {
      try {
        if (!text) return;
        if (typeof text === 'string' && !text.trim()) return;

        const tempId = uuidv4();
        const optimisticMessage = {
          id: tempId,
          from_user: meId,
          to_user: toUser || peerId,
          message: text,
          created_at: new Date().toISOString(),
          delivered_at: null,
          read_at: null,
          pending: true,
          failed: false,
          file_type: fileType || 'text',
          duration: duration || null
        };

        const realMessage = { 
          ...optimisticMessage, 
          chat_type: 'direct',
          conversation_id: dbChannelId
        }
        delete realMessage.pending
        delete realMessage.failed

        setMessages((prev) => [...prev, optimisticMessage]);

        let attempts = 0;
        const maxAttempts = 2;
        let inserted = false;

        while (attempts < maxAttempts && !inserted) {
          attempts++;
          const { error } = await supabase.from(tableName).insert(realMessage);
          if (!error) inserted = true;
          else {
            console.log("ERROR ON COUNT", attempts, error)
          }
        }

        if (!inserted) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? { ...msg, pending: false, failed: true } : msg
            )
          );
        } else {
          channelRef.current?.send({
            type: 'broadcast',
            event: 'sendMsg',
            payload: user_profile ? { ...realMessage, user_profile } : realMessage
          })

          notifyMother({
            msg: fileType === 'service' ? 'Shared a service with you' : text,
            mother: user_profile,
            provider: profile
          })

          if (oldMsgId) deleteMessage({ msgId: oldMsgId })
        }
      } catch (error) {
        console.log(error)
        toast.error('Error sending chat message')
      }
    },
    [meId, peerId, topic]
  );

  const messageDelivered = async (messageId, read_at) => {
    const { data, error } = await supabase
      .from(tableName)
      .update({ delivered_at: new Date().toISOString() })
      .eq("id", messageId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("msgDelivered error:", error);
      return null;
    }

    if (!data) return null;

    const payload = { ...data }
    if (read_at) payload.read_at = read_at

    channelRef.current?.send({
      type: 'broadcast',
      event: 'messageDelivered',
      payload
    })
    return payload;
  }

  const messageRead = async (messageId) => {
    const { data, error } = await supabase
      .from(tableName)
      .update({ read_at: new Date().toISOString() })
      .eq("id", messageId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("msgRead error:", error);
      return null;
    }

    if (!data) return null;

    channelRef.current?.send({
      type: 'broadcast',
      event: 'messageRead',
      payload: data
    })
    return data;
  }

  const bulkMsgsRead = async (msgsIds) => {
    const read_at = new Date().toISOString()
    const { data, error } = await supabase
      .from(tableName)
      .update({ read_at })
      .in("id", msgsIds)
      .select("id")

    if (error) {
      console.error("bulkMsgsRead error:", error);
      return null;
    }

    channelRef.current?.send({
      type: 'broadcast',
      event: 'bulkMsgsRead',
      payload: { msgsIds, read_at }
    })
    return data;
  }

  const onMsgReceived = useCallback((msg) => {
    if (msg?.to_user === meId) {
      const msgId = msg?.id
      // Use ref to avoid stale state in subscription callbacks
      const msgDelivered = msgsRef.current?.find(m => (m?.id == msgId) && m?.delivered_at)
      if (!msgDelivered) {
        messageDelivered(msgId, msg?.read_at)
      }
    }
  }, [meId])

  const onMsgRead = useCallback((msg) => {
    if (msg?.to_user === meId) {
      const msgId = msg?.id
      // Use ref to avoid stale state in subscription callbacks
      const msgRead = msgsRef.current?.find(m => (m?.id == msgId) && m?.read_at)
      if (!msgRead) {
        messageRead(msgId)
      }
    }
  }, [meId])

  const onMsgsLoaded = useCallback((by_id, timestamp) => {
    if (by_id == meId) return;

    setMessages(prev => {
      const updatedMsgs = [...prev].reverse();
      for (let i = 0; i < updatedMsgs.length; i++) {
        const msg = updatedMsgs[i];
        if (msg.to_user === by_id && (!msg.delivered_at || !msg.read_at)) {
          updatedMsgs[i] = {
            ...msg,
            delivered_at: msg.delivered_at || timestamp,
            read_at: msg.read_at || timestamp
          };
        }
      }
      return dedupeMessages([...updatedMsgs].reverse());
    });
  }, [meId])

  const dedupeMessages = (msgs) => {
    const seen = new Set();
    return msgs.filter((msg) => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  };

  const replaceOptimisticMessages = (msgs, newMsg) => {
    const idx = msgs.findIndex((msg) => msg.id === newMsg.id);
    if (idx !== -1) {
      const updated = [...msgs];
      updated[idx] = { ...newMsg, pending: false, failed: false };
      return updated;
    }
    return dedupeMessages([...msgs, { ...newMsg, pending: false, failed: false }]);
  }

  const loadMessages = useCallback(async ({ msgLoadedTimeStamp, last_loaded_at, isOlder, isRefreshing = false }) => {
    if (!isRefreshing && savedMsgs && savedMsgs?.length > 0 && !last_loaded_at) {
      setMessages(dedupeMessages(savedMsgs));
      return;
    }

    const { data, error } = await supabase
      .rpc(rpcName, {
        p_conversation_id: dbChannelId,
        p_my_id: meId,
        p_timestamp: msgLoadedTimeStamp,
        last_loaded_at,
        _limit: 100
      });

    if (!error && data) {
      if (data.length === 0) setCanLoadMoreMsgs(false)
      const normalized = [...data].reverse();
      setMessages(prev => {
        if (isRefreshing) return normalized;
        return dedupeMessages(isOlder ? [...normalized, ...prev] : [...prev, ...normalized]);
      });
    }
  }, [meId, peerId, rpcName, savedMsgs]);

  const setup = useCallback(({ topic, meId, peerId }) => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase.channel(topic, {
      config: { broadcast: { self: true, ack: true }, presence: { key: meId } },
    });

    channelRef.current = channel;

    channel.on('broadcast', { event: 'sendMsg' }, (payload) => {
      const msg = payload.payload
      setMessages((prev) => replaceOptimisticMessages(prev || [], msg));
      onMsgReceived(msg)
    })

    channel.on('broadcast', { event: 'updateMsg' }, (payload) => {
      const msg = payload.payload
      setMessages((prev) => replaceOptimisticMessages(prev || [], msg));
    })

    channel.on('broadcast', { event: 'messageRead' }, (payload) => {
      const msg = payload.payload
      setMessages((prev) => replaceOptimisticMessages(prev || [], msg));
    })

    channel.on('broadcast', { event: 'bulkMsgsRead' }, (payload) => {
      const msgsIds = payload.payload?.msgsIds
      const read_at = payload.payload?.read_at
      setMessages((prev) => {
        const idSet = new Set(msgsIds);
        return prev.map(m => idSet.has(m.id) ? { ...m, read_at } : m);
      });
    })

    channel.on('broadcast', { event: 'messageDelivered' }, (payload) => {
      const msg = payload.payload
      setMessages((prev) => replaceOptimisticMessages(prev || [], msg));
      onMsgRead(msg)
    })

    channel.on('broadcast', { event: 'messagesLoaded' }, (payload) => {
      const { by_id, timestamp } = payload.payload
      onMsgsLoaded(by_id, timestamp)
    })

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      setOnlineUsers(Object.keys(presenceState));
    });

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings_chats',
        filter: `conversation_id=eq.${dbChannelId}`,
      },
      (payload) => {
        if (payload.new && payload.new.conversation_id === dbChannelId) {
          setMessages((prev) => replaceOptimisticMessages(prev || [], payload.new));
          onMsgReceived(payload.new);
        }
      }
    );

    channel.subscribe(async (subStatus) => {
      if (subStatus === 'SUBSCRIBED') {
        setStatus('subscribed');
        channel.send({
          type: 'broadcast',
          event: 'messagesLoaded',
          payload: { by_id: meId, timestamp: new Date().toISOString() }
        })
        await channel.track({ online_at: new Date().toISOString() });
      }
    });
  }, [onMsgReceived, onMsgRead, onMsgsLoaded]);

  useEffect(() => {
    if (!meId || !topic) return;

    const msgLoadedTimeStamp = new Date().toISOString()
    loadMessages({ msgLoadedTimeStamp });
    setup({ topic, meId, peerId });

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [meId, topic, peerId]);

  useEffect(() => {
    msgsRef.current = messages
    if (savedMsgs && areMessagesEqual(messages, savedMsgs)) return;
    dispatch(setChannelIds({ channelId: topic, messages }))
  }, [messages, topic, dispatch, savedMsgs])

  const refreshConnection = async () => {
    try {
      dispatch(subtleLoadStart('Refreshing chat...'))
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      setStatus('connecting');
      const msgLoadedTimeStamp = new Date().toISOString()
      setup({ topic, meId, peerId });
      await loadMessages({ msgLoadedTimeStamp, isRefreshing: true });

    } catch (error) {
      console.log(error)
    } finally {
      dispatch(subtleLoadStop())
    }
  }

  return {
    status, messages, sendMessage, onlineUsers,
    canLoadMoreMsgs, loadMessages, bulkMsgsRead, refreshConnection,
    sendTempMedia, updateTempMedia, retrySend, deleteMessage,
    cancelRetrySend
  };
}