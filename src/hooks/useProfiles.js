import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

export function useProfiles(currentProfile) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const swipedIdsRef = useRef(new Set());

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

      const dbSwipedIds = swipes.map(s => s.swiped_id);
      
      // Combine database swiped IDs, currently loaded profiles, and local swipedIdsRef to exclude them
      const excludedSet = new Set([
        ...dbSwipedIds,
        currentProfile.id,
        ...existingProfiles.map(p => p.id)
      ]);
      
      // Sync local popped profiles instantly
      swipedIdsRef.current.forEach(id => excludedSet.add(id));

      const excludedIds = Array.from(excludedSet);

      // 2. Fetch profiles
      let query = supabase
        .from('profiles')
        .select('id, name, bio, year, university, department, role, framework, skills, github_url, project_idea, searching_for, looking_for, avatar_url, contact_mode, phone, instagram, linkedin, telegram, team_id, team:teams!team_id(id, leader_id, is_full, members:profiles!team_id(id, name, avatar_url))')
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
      swipedIdsRef.current.clear();
      setHasMore(true);
      fetchMoreProfiles([]);
    }
  }, [currentProfile, fetchMoreProfiles]);

  const popProfile = useCallback(() => {
    setProfiles(prev => {
      if (prev.length === 0) return prev;
      
      const popped = prev[0];
      // Mark as swiped locally instantly to prevent reappearing during async delay
      swipedIdsRef.current.add(popped.id);

      const nextList = prev.slice(1);
      // Trigger preload when 2 or fewer cards left
      if (nextList.length <= 2 && hasMore && !loading) {
        fetchMoreProfiles(nextList);
      }
      return nextList;
    });
  }, [fetchMoreProfiles, hasMore, loading]);

  const refresh = useCallback(async () => {
    if (currentProfile) {
      setLoading(true);
      try {
        // 1. Fetch matched partner IDs to exclude them from clearing
        const { data: matchesData } = await supabase
          .from('matches')
          .select('user1_id, user2_id')
          .or(`user1_id.eq.${currentProfile.id},user2_id.eq.${currentProfile.id}`);

        const matchedPartnerIds = (matchesData || []).map(m => 
          m.user1_id === currentProfile.id ? m.user2_id : m.user1_id
        );

        // 2. Delete swipes from this user that are not part of a mutual match
        let query = supabase.from('swipes').delete().eq('swiper_id', currentProfile.id);
        if (matchedPartnerIds.length > 0) {
          query = query.not('swiped_id', 'in', `(${matchedPartnerIds.join(',')})`);
        }
        await query;
      } catch (err) {
        console.error("Error clearing swipes during refresh:", err);
      } finally {
        setProfiles([]);
        swipedIdsRef.current.clear();
        setHasMore(true);
        setLoading(false);
      }
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
