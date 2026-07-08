import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationItem from '../components/notifications/NotificationItem';
import ProfileCard from '../components/cards/ProfileCard';
import MatchModal from '../components/matches/MatchModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { handleRightSwipe } from '../utils/swipeLogic';
import { supabase } from '../supabaseClient';
import { X, CheckCheck, Flame, Heart, Compass } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Notifications() {
  const { profile: currentProfile } = useAuth();
  const { notifications: notificationsCtx = {} } = useOutletContext() || {};
  const { notifications = [], unreadCount = 0, loading = true, markAsRead, markAllAsRead } = notificationsCtx;
  const navigate = useNavigate();

  // Selected profile for liked_you notifications details modal
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Celebration match modal
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [matchId, setMatchId] = useState(null);

  const handleNotificationClick = async (notif) => {
    // Mark as read immediately on click
    if (!notif.read) {
      await markAsRead(notif.id);
    }

    if (notif.type === 'liked_you') {
      setSelectedNotification(notif);
      setSelectedProfile(notif.from_user);
      setIsProfileModalOpen(true);
    } else if (notif.type === 'new_match') {
      navigate('/matches');
    }
  };

  const handleLikeBack = async () => {
    if (!selectedProfile || !currentProfile || !selectedNotification) return;

    const targetProfile = selectedProfile;
    // Dismiss the profile preview modal
    setIsProfileModalOpen(false);

    try {
      const result = await handleRightSwipe(supabase, currentProfile, targetProfile);

      if (result.type === 'match') {
        setMatchedProfile(targetProfile);
        setMatchId(result.match?.id || null);
        setIsMatchOpen(true);
        toast.success(`You matched with ${targetProfile.name}! 🎉`, { duration: 2000 });
      } else {
        toast.success(`Liked ${targetProfile.name}!`);
      }
    } catch (err) {
      console.error("Error liking user back:", err);
      toast.error("Operation failed.");
    }
  };

  const handleAcceptInvite = async (notif) => {
    if (!currentProfile || !notif?.team_invite) return;

    try {
      const { data: teamMembers, error: membersErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('team_id', currentProfile.team_id);

      if (membersErr) throw membersErr;

      if (teamMembers && teamMembers.length > 1) {
        toast.error("You cannot accept this invite because you are currently in a team with other members.");
        return;
      }

      const oldTeamId = currentProfile.team_id;
      const newTeamId = notif.team_invite.team.id;

      const { error: updateProfileErr } = await supabase
        .from('profiles')
        .update({ team_id: newTeamId })
        .eq('id', currentProfile.id);

      if (updateProfileErr) throw updateProfileErr;

      if (oldTeamId) {
        await supabase
          .from('teams')
          .delete()
          .eq('id', oldTeamId);
      }

      await supabase
        .from('team_invites')
        .update({ status: 'accepted' })
        .eq('id', notif.team_invite.id);

      if (!notif.read) {
        await markAsRead(notif.id);
      }

      toast.success("Joined their project team! 🎉");
      window.location.reload();
    } catch (err) {
      console.error("Error accepting team invite in Notifications:", err);
      toast.error("Failed to join team.");
    }
  };

  const handleDeclineInvite = async (notif) => {
    if (!notif?.team_invite) return;

    try {
      await supabase
        .from('team_invites')
        .update({ status: 'declined' })
        .eq('id', notif.team_invite.id);

      if (!notif.read) {
        await markAsRead(notif.id);
      }

      toast.success("Team invitation declined.");
      window.location.reload();
    } catch (err) {
      console.error("Error declining team invite in Notifications:", err);
      toast.error("Failed to decline invitation.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="md" message="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-xl mx-auto w-full py-2">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-900 pb-4">
        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide flex items-center justify-center sm:justify-start gap-2">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-400">Keep track of likes, matches, and teammate activities.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        /* Notifications List */
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onClick={handleNotificationClick}
              onAcceptInvite={handleAcceptInvite}
              onDeclineInvite={handleDeclineInvite}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-10">
          <EmptyState
            title="Inbox clean"
            description="No notifications received yet. Complete your profile setup to rank higher on other students' swipe decks."
            icon="🔔"
          >
            <button
              onClick={() => navigate('/swipe')}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 cursor-pointer mt-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore students</span>
            </button>
          </EmptyState>
        </div>
      )}

      {/* Liked You: Full Profile View Modal */}
      {isProfileModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
            onClick={() => setIsProfileModalOpen(false)}
          />
          <div className="relative w-full max-w-sm overflow-hidden z-10 space-y-4">
            {/* Header close button */}
            <div className="flex items-center justify-between bg-gray-900 border border-gray-800 px-4 py-2.5 rounded-2xl">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Card</span>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-gray-500 hover:text-white bg-gray-950 p-1.5 rounded-full border border-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Card component */}
            <ProfileCard profile={selectedProfile} dragX={0} isTop={false} />

            {/* Match action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="py-3 bg-gray-900 border border-gray-850 hover:border-gray-700 text-gray-400 hover:text-white text-xs font-bold rounded-2xl transition-all cursor-pointer active:scale-95"
              >
                Dismiss
              </button>
              <button
                onClick={handleLikeBack}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15 cursor-pointer active:scale-95"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Like Back</span>
              </button>
            </div>
          </div>
        </div>
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
