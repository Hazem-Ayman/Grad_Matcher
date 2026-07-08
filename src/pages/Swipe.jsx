import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfiles } from '../hooks/useProfiles';
import { handleRightSwipe } from '../utils/swipeLogic';
import { supabase } from '../supabaseClient';
import { CardStack } from '../components/cards/CardStack';
import SwipeButtons from '../components/swipe/SwipeButtons';
import SwipeEmpty from '../components/swipe/SwipeEmpty';
import MatchModal from '../components/matches/MatchModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function Swipe() {
  const { profile: currentProfile } = useAuth();
  const { profiles, loading, popProfile, refresh, hasMore } = useProfiles(currentProfile);

  // Celebration Modal
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [matchId, setMatchId] = useState(null);

  const activeProfile = profiles[0];

  const handleSwipeLeft = async () => {
    if (!activeProfile || !currentProfile) return;

    const targetProfile = activeProfile;
    // Optimistic pop from deck
    popProfile();

    try {
      await supabase.from('swipes').insert({
        swiper_id: currentProfile.id,
        swiped_id: targetProfile.id,
        direction: 'left',
      });
    } catch (err) {
      console.error("Error logging left swipe:", err);
    }
  };

  const handleSwipeRight = async () => {
    if (!activeProfile || !currentProfile) return;

    const targetProfile = activeProfile;
    // Optimistic pop from deck
    popProfile();

    try {
      const result = await handleRightSwipe(supabase, currentProfile, targetProfile);

      if (result.type === 'match') {
        // Show celebration match modal
        setMatchedProfile(targetProfile);
        setMatchId(result.match?.id || null);
        setIsMatchOpen(true);
        toast.success("It's a Match! 🎉", { duration: 2000 });
      } else {
        toast.success(`Liked ${targetProfile.name}!`);
      }
    } catch (err) {
      console.error("Error logging right swipe:", err);
      toast.error("Swipe operation failed.");
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Preloading profiles..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between items-center py-4 md:py-6">
      {profiles.length > 0 ? (
        <div className="w-full flex flex-col items-center justify-center space-y-6">
          {/* Card Stack */}
          <CardStack
            profiles={profiles}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />

          {/* Action buttons */}
          <SwipeButtons
            onPass={handleSwipeLeft}
            onLike={handleSwipeRight}
          />
        </div>
      ) : (
        <SwipeEmpty onRefresh={refresh} isRefreshing={loading} />
      )}

      {/* Mutual Match Celebration Modal */}
      <MatchModal
        isOpen={isMatchOpen}
        onClose={() => setIsMatchOpen(false)}
        currentProfile={currentProfile}
        matchedProfile={matchedProfile}
        matchId={matchId}
      />
    </div>
  );
}
