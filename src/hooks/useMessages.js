import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useMessages(matchId, currentProfile) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!matchId) return;

    setLoading(true);
    try {
      const { data, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    if (!matchId || !currentProfile) return;

    fetchMessages();

    // Subscribe to real-time messages for this match
    const channel = supabase
      .channel(`chat-messages-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, currentProfile, fetchMessages]);

  const sendMessage = useCallback(async (content) => {
    if (!matchId || !currentProfile || !content.trim()) return;

    try {
      const tempId = crypto.randomUUID();
      const newMessage = {
        id: tempId,
        match_id: matchId,
        sender_id: currentProfile.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      // Optimistically append message to local state
      setMessages(prev => [...prev, newMessage]);

      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: currentProfile.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (sendError) throw sendError;

      // Replace optimistic message with actual DB record to get proper timestamp
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? data : m))
      );
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove the optimistic message if it failed
      fetchMessages();
      throw err;
    }
  }, [matchId, currentProfile, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
}
