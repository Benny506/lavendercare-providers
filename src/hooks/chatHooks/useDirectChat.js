import supabase from '../../database/dbInit';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { appLoadStart, appLoadStop } from '../../redux/slices/appLoadingSlice';
import { getMessages, setChannelIds } from '../../redux/slices/messagesSlice';
import { toast } from 'react-toastify';

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

export function useDirectChat({ topic, meId, peerId }) {

  const dispatch = useDispatch()

  const channelRef = useRef(null);
  const msgsRef = useRef(null)

  const savedMsgs = useSelector(state => getMessages(state).channelIds[topic])

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
        if (!text?.trim()) return;

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

        const realMessage = { ...optimisticMessage }
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

  const onMsgReceived = (msg) => {
    if (msg?.to_user === meId) {
      const msgId = msg?.id
      const msgDelivered = messages.find(m => (m?.id == msgId) && m?.delivered_at)
      if (!msgDelivered) {
        messageDelivered(msg?.id, msg?.read_at)
      }
    }
  }

  const onMsgRead = (msg) => {
    if (msg?.to_user === meId) {
      const msgId = msg?.id
      const msgRead = messages.find(m => (m?.id == msgId) && m?.read_at)
      if (!msgRead) {
        messageRead(msg?.id)
      }
    }
  }

  const onMsgsLoaded = (by_id, timestamp) => {
    if (by_id == meId && msgsRef.current?.length > 0) return;

    const updatedMsgs = [...msgsRef.current].reverse();
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
    setMessages(dedupeMessages(updatedMsgs))
  }

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
    const replacedMsgs = [...msgs, { ...newMsg, pending: false, failed: false }];
    return dedupeMessages(replacedMsgs)
  }

  const loadMessages = useCallback(async ({ msgLoadedTimeStamp, last_loaded_at, isOlder }) => {
    if (savedMsgs && savedMsgs?.length > 0 && !last_loaded_at) {
        return afterMsgsLoaded(savedMsgs, { isOlder })
    }

    const { data, error } = await supabase
      .rpc(rpcName, {
        p_peer_id: peerId,
        p_my_id: meId,
        p_timestamp: msgLoadedTimeStamp,
        last_loaded_at,
        _limit: 100
      });

    if (!error) {
      if (data.length === 0) setCanLoadMoreMsgs(false)
      afterMsgsLoaded(data, { isOlder })
      return
    }
    console.log(error)
  }, [meId, peerId, topic]);

  const afterMsgsLoaded = (_msgs, { isOlder = false } = {}) => {
    const msgs = [..._msgs].reverse(); // normalize to ASC
    setMessages((prev) =>
      dedupeMessages(
        isOlder
          ? [...msgs, ...(prev || [])]
          : [...(prev || []), ...msgs]
      )
    );
  };

  useEffect(() => {
    if (!meId || !topic) return;

    const msgLoadedTimeStamp = new Date().toISOString()
    
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

    // Postgres changes for the current thread
    channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings_chats',
          filter: `from_user=eq.${peerId}`,
        },
        (payload) => {
          if (payload.new && payload.new.to_user === meId) {
            setMessages((prev) => replaceOptimisticMessages(prev || [], payload.new));
          }
        }
    );

    channel.subscribe(async (subStatus) => {
      if (subStatus === 'SUBSCRIBED') {
        setStatus('subscribed');
        channel.send({
          type: 'broadcast',
          event: 'messagesLoaded',
          payload: { by_id: meId, timestamp: msgLoadedTimeStamp }
        })
      }
    });

    loadMessages({ msgLoadedTimeStamp });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [meId, topic, peerId]);

  useEffect(() => {
    msgsRef.current = messages
  }, [messages])

  const refreshConnection = () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    setStatus('connecting');
    // useEffect will re-run if we toggle a state, but here we can just wait for cleanup or trigger manual setup if needed.
    // For simplicity, we can rely on the meId/topic dependency.
  }

  return {
    status, messages, sendMessage, onlineUsers,
    canLoadMoreMsgs, loadMessages, bulkMsgsRead, refreshConnection,
    sendTempMedia, updateTempMedia, retrySend, deleteMessage,
    cancelRetrySend
  };
}