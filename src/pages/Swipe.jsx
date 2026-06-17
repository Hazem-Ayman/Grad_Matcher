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
import { PhoneCall, ShieldCheck, X, Camera, Briefcase, Send } from 'lucide-react';

export default function Swipe() {
  const { profile: currentProfile } = useAuth();
  const { profiles, loading, popProfile, refresh, hasMore } = useProfiles(currentProfile);

  // Celebration Modal
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [matchId, setMatchId] = useState(null);

  // Direct Contact Revealed Modal
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [revealedProfile, setRevealedProfile] = useState(null);

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

      if (result.type === 'open') {
        // Show contact info immediately
        setRevealedProfile(targetProfile);
        setIsContactOpen(true);
        toast.success(`${targetProfile.name} is open to direct contact! ⚡`);
      } else if (result.type === 'match') {
        // Show celebration match modal
        setMatchedProfile(targetProfile);
        setMatchId(result.match.id);
        setIsMatchOpen(true);
        toast.success("It's a Match! 🎉", { duration: 4000 });
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

      {/* Direct Contact Modal (contact_mode = 'open') */}
      {isContactOpen && revealedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
            onClick={() => setIsContactOpen(false)}
          />
          <div className="relative bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-5 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-gray-800 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-3xl">⚡</div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Direct Contact Available!</h3>
              <p className="text-xs text-gray-400">
                {revealedProfile.name} has shared their contact details openly. Feel free to connect directly.
              </p>
            </div>

            <div className="bg-gray-950/60 border border-gray-805 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center gap-1.5 border-b border-gray-800 pb-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Contact details</span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-350">
                {revealedProfile.phone && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><PhoneCall className="w-3.5 h-3.5" /> Phone:</span>
                    <span className="font-semibold text-white select-all">{revealedProfile.phone}</span>
                  </div>
                )}
                {revealedProfile.instagram && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Camera className="w-3.5 h-3.5" /> Instagram:</span>
                    <span className="font-semibold text-white select-all">{revealedProfile.instagram}</span>
                  </div>
                )}
                {revealedProfile.telegram && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Send className="w-3.5 h-3.5" /> Telegram:</span>
                    <span className="font-semibold text-white select-all">{revealedProfile.telegram}</span>
                  </div>
                )}
                {revealedProfile.linkedin && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Briefcase className="w-3.5 h-3.5" /> LinkedIn:</span>
                    <span className="font-semibold text-white select-all truncate max-w-[150px]">{revealedProfile.linkedin}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsContactOpen(false)}
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold tracking-wide shadow-md active:scale-95 cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
