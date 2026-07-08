import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useNotifications(currentProfile) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!currentProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          read,
          created_at,
          from_user:from_user_id (*),
          team_invite:team_invite_id (
            id,
            status,
            team:team_id (
              id
            )
          )
        `)
        .eq('user_id', currentProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [currentProfile]);

  useEffect(() => {
    if (!currentProfile?.id) return;

    fetchNotifications();

    // Subscribe to real-time notifications changes
    const channel = supabase
      .channel(`notifications-channel-${currentProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentProfile.id}`,
        },
        async (payload) => {
          // If insert, fetch the from_user details to display
          if (payload.eventType === 'INSERT') {
            const { data: fromUser } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.from_user_id)
              .single();

            let teamInvite = null;
            if (payload.new.team_invite_id) {
              const { data: invite } = await supabase
                .from('team_invites')
                .select(`
                  id,
                  status,
                  team:team_id (
                    id
                  )
                `)
                .eq('id', payload.new.team_invite_id)
                .maybeSingle();
              teamInvite = invite;
            }

            const fullNotif = {
              ...payload.new,
              from_user: fromUser,
              team_invite: teamInvite
            };

            setNotifications(prev => [fullNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(n => (n.id === payload.new.id ? { ...n, ...payload.new } : n))
            );
            // Recalculate unread count
            setUnreadCount(prev => {
              if (payload.new.read && !payload.old.read) return Math.max(0, prev - 1);
              if (!payload.new.read && payload.old.read) return prev + 1;
              return prev;
            });
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
            if (!payload.old.read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProfile, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!currentProfile?.id) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', currentProfile.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, [currentProfile]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
