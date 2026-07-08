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
import { Send } from 'lucide-react';

export default function Swipe() {
  const { profile: currentProfile } = useAuth();
  const { profiles, loading, popProfile, refresh, hasMore } = useProfiles(currentProfile);

  // Celebration Modal
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [matchId, setMatchId] = useState(null);

  // Like Sent Modal
  const [isLikeSentOpen, setIsLikeSentOpen] = useState(false);
  const [likedProfileName, setLikedProfileName] = useState('');

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
        // Show like sent feedback modal
        setLikedProfileName(targetProfile.name);
        setIsLikeSentOpen(true);
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

      {/* Like Sent Feedback Modal Overlay */}
      {isLikeSentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel border border-gray-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden animate-in scale-in duration-300">
            {/* Glow background */}
            <div className="absolute w-32 h-32 rounded-full bg-indigo-650/10 blur-2xl top-[-20%] left-[-20%] pointer-events-none"></div>

            <div className="flex justify-center">
              <span className="p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-indigo-400">
                <Send className="w-6 h-6 animate-pulse" />
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white tracking-wide">Like Sent! 🚀</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                A notification has been sent to <span className="text-indigo-300 font-bold">{likedProfileName}</span>. If they like you back, you will match and unlock contact details. Wait for their response!
              </p>
            </div>

            <button
              onClick={() => setIsLikeSentOpen(false)}
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-650/15 cursor-pointer active:scale-95 transition-all"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
