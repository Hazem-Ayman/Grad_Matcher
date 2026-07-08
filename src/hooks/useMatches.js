import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useMatches(currentProfile) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatches = useCallback(async () => {
    if (!currentProfile) return;

    setLoading(true);
    try {
      // 1. Fetch all swipes where current user swiped right (liked someone)
      const { data: swipesList, error: swipesError } = await supabase
        .from('swipes')
        .select(`
          id,
          created_at,
          profile:profiles!swiped_id (*)
        `)
        .eq('swiper_id', currentProfile.id)
        .eq('direction', 'right')
        .order('created_at', { ascending: false });

      if (swipesError) throw swipesError;

      // 2. Fetch matches list to verify which ones are mutual matches
      const { data: matchesList, error: matchesError } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${currentProfile.id},user2_id.eq.${currentProfile.id}`);

      if (matchesError) throw matchesError;

      // Build a set of mutual matched profile IDs
      const mutualSet = new Set();
      (matchesList || []).forEach(m => {
        if (m.user1_id === currentProfile.id) {
          mutualSet.add(m.user2_id);
        } else {
          mutualSet.add(m.user1_id);
        }
      });

      // Transform swipes to matches list structure with isMutual flag
      const transformedMatches = (swipesList || []).map(s => {
        return {
          id: s.id,
          createdAt: s.created_at,
          profile: s.profile,
          isMutual: mutualSet.has(s.profile?.id),
        };
      });

      // Filter out duplicate profiles to guarantee uniqueness in UI
      const seenProfileIds = new Set();
      const uniqueMatches = [];
      transformedMatches.forEach(m => {
        if (m.profile && !seenProfileIds.has(m.profile.id)) {
          seenProfileIds.add(m.profile.id);
          uniqueMatches.push(m);
        }
      });

      setMatches(uniqueMatches);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentProfile]);

  useEffect(() => {
    if (!currentProfile) return;

    fetchMatches();

    // Poll for new matches every 20 seconds on free tier
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMatches();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [currentProfile, fetchMatches]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
  };
}
