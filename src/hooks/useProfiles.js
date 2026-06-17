import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useProfiles(currentProfile) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchMoreProfiles = useCallback(async (existingProfiles = []) => {
    if (!currentProfile) return;
    if (loading) return;

    setLoading(true);
    try {
      // 1. Fetch already swiped profiles to exclude them
      const { data: swipes, error: swipesError } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', currentProfile.id);

      if (swipesError) throw swipesError;

      const swipedIds = swipes.map(s => s.swiped_id);
      // Also exclude currently loaded profiles in state to avoid duplicate fetches
      const excludedIds = [...swipedIds, currentProfile.id, ...existingProfiles.map(p => p.id)];

      // 2. Fetch profiles
      let query = supabase
        .from('profiles')
        .select('id, name, bio, year, university, role, skills, github_url, project_idea, looking_for, avatar_url, contact_mode')
        .eq('is_active', true)
        .eq('onboarding_complete', true)
        .neq('looking_for', 'browsing');

      // Filter out excluded IDs
      if (excludedIds.length > 0) {
        query = query.not('id', 'in', `(${excludedIds.join(',')})`);
      }

      const { data: fetchedProfiles, error: fetchError } = await query
        .limit(10);

      if (fetchError) throw fetchError;

      if (fetchedProfiles.length < 10) {
        setHasMore(false);
      }

      setProfiles(prev => {
        // Double check uniqueness
        const existingIds = new Set(prev.map(p => p.id));
        const combined = [...prev];
        fetchedProfiles.forEach(p => {
          if (!existingIds.has(p.id)) {
            combined.push(p);
          }
        });
        return combined;
      });
    } catch (err) {
      console.error("Error fetching profiles feed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentProfile]);

  // Initial fetch
  useEffect(() => {
    if (currentProfile) {
      setProfiles([]);
      setHasMore(true);
      fetchMoreProfiles([]);
    }
  }, [currentProfile, fetchMoreProfiles]);

  const popProfile = useCallback(() => {
    setProfiles(prev => {
      const nextList = prev.slice(1);
      // Trigger preload when 2 or fewer cards left
      if (nextList.length <= 2 && hasMore && !loading) {
        fetchMoreProfiles(nextList);
      }
      return nextList;
    });
  }, [fetchMoreProfiles, hasMore, loading]);

  const refresh = useCallback(() => {
    if (currentProfile) {
      setProfiles([]);
      setHasMore(true);
      return fetchMoreProfiles([]);
    }
  }, [currentProfile, fetchMoreProfiles]);

  return {
    profiles,
    loading,
    error,
    popProfile,
    refresh,
    hasMore,
  };
}
