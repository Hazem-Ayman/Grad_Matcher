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
      // Find matches where user is user1 or user2
      const { data: rawMatches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          created_at,
          user1:profiles!user1_id (*),
          user2:profiles!user2_id (*)
        `)
        .or(`user1_id.eq.${currentProfile.id},user2_id.eq.${currentProfile.id}`)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      // Transform matches to easily reference the *other* user's profile
      const transformedMatches = rawMatches.map(m => {
        const otherProfile = m.user1.id === currentProfile.id ? m.user2 : m.user1;
        return {
          id: m.id,
          createdAt: m.created_at,
          profile: otherProfile,
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
    if (currentProfile) {
      fetchMatches();
    }
  }, [currentProfile, fetchMatches]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
  };
}
