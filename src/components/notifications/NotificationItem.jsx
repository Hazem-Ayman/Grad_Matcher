import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../ui/Avatar';
import { Heart, UserCheck, Flame } from 'lucide-react';

export default function NotificationItem({ notification, onClick, onAcceptInvite, onDeclineInvite }) {
  const { type, read, created_at, from_user, team_invite } = notification;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(created_at), { addSuffix: true });
    } catch (e) {
      return '';
    }
  })();

  const inviteStatus = team_invite?.status || 'pending';

  const config = {
    liked_you: {
      icon: Heart,
      iconColor: 'text-red-500 bg-red-500/10 border border-red-500/20',
      text: (
        <span>
          <strong className="text-white font-semibold">{from_user?.name || 'Someone'}</strong> is interested in your profile
        </span>
      ),
    },
    new_match: {
      icon: Flame,
      iconColor: 'text-orange-500 bg-orange-500/10 border border-orange-500/20',
      text: (
        <span>
          You matched with <strong className="text-white font-semibold">{from_user?.name || 'Someone'}</strong>! 🎉
        </span>
      ),
    },
    team_invite: {
      icon: UserCheck,
      iconColor: 'text-blue-500 bg-blue-500/10 border border-blue-500/20',
      text: (
        <span>
          <strong className="text-white font-semibold">{from_user?.name || 'Someone'}</strong> invited you to join their project team
        </span>
      ),
    },
  };


  const currentConfig = config[type] || {
    icon: Flame,
    iconColor: 'text-gray-400 bg-gray-800',
    text: <span>Notification received</span>,
  };

  const IconComponent = currentConfig.icon;

  const handleItemClick = () => {
    // For pending team invites, clicking the card shouldn't trigger default navigation
    if (type === 'team_invite' && inviteStatus === 'pending') {
      return;
    }
    onClick(notification);
  };

  return (
    <div
      onClick={handleItemClick}
      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
        type === 'team_invite' && inviteStatus === 'pending'
          ? 'cursor-default'
          : 'cursor-pointer'
      } ${
        read
          ? 'bg-gray-900/40 border-gray-850 hover:bg-gray-900/60'
          : 'bg-indigo-950/10 border-indigo-500/20 hover:bg-indigo-950/15 shadow-sm shadow-indigo-950/5'
      }`}
    >
      {/* Icon Badge */}
      <div className="relative flex-shrink-0">
        <Avatar src={from_user?.avatar_url} name={from_user?.name || '?'} size="md" className="border border-gray-800" />
        <span className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-1 shadow-md ${currentConfig.iconColor}`}>
          <IconComponent className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Info details */}
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-sm text-gray-300 leading-relaxed break-words text-left">
          {currentConfig.text}
        </p>

        {/* Render team invite actions if pending */}
        {type === 'team_invite' && inviteStatus === 'pending' && (
          <div className="flex items-center gap-2 pt-1.5 pb-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onAcceptInvite && onAcceptInvite(notification)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow border border-indigo-500/20"
            >
              Accept
            </button>
            <button
              onClick={() => onDeclineInvite && onDeclineInvite(notification)}
              className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-gray-700"
            >
              Decline
            </button>
          </div>
        )}

        {type === 'team_invite' && inviteStatus === 'accepted' && (
          <div className="pt-0.5">
            <span className="inline-block text-[10px] text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-lg mt-0.5">
              ✓ Accepted
            </span>
          </div>
        )}

        {type === 'team_invite' && inviteStatus === 'declined' && (
          <div className="pt-0.5">
            <span className="inline-block text-[10px] text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-lg mt-0.5">
              Declined
            </span>
          </div>
        )}

        <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider text-left">
          {timeAgo}
        </span>
      </div>

      {/* Unread dot indicator */}
      {!read && (
        <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-indigo-500 self-center"></span>
      )}
    </div>
  );
}
