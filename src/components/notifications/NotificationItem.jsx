import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../ui/Avatar';
import { Heart, UserCheck, Flame, Zap } from 'lucide-react';

export default function NotificationItem({ notification, onClick }) {
  const { type, read, created_at, from_user } = notification;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(created_at), { addSuffix: true });
    } catch (e) {
      return '';
    }
  })();

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
    contact_revealed: {
      icon: Zap,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20',
      text: (
        <span>
          <strong className="text-white font-semibold">{from_user?.name || 'Someone'}</strong> viewed your contact info ⚡
        </span>
      ),
    },
  };

  const currentConfig = config[type] || {
    icon: Zap,
    iconColor: 'text-gray-400 bg-gray-800',
    text: <span>Notification received</span>,
  };

  const IconComponent = currentConfig.icon;

  return (
    <div
      onClick={() => onClick(notification)}
      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
        read
          ? 'bg-gray-900/40 border-gray-850 hover:bg-gray-900/60'
          : 'bg-indigo-950/10 border-indigo-500/20 hover:bg-indigo-950/15 shadow-sm shadow-indigo-950/5'
      }`}
    >
      {/* Icon Badge */}
      <div className="relative">
        <Avatar src={from_user?.avatar_url} name={from_user?.name || '?'} size="md" className="border border-gray-800" />
        <span className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-1 shadow-md ${currentConfig.iconColor}`}>
          <IconComponent className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Info details */}
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-sm text-gray-300 leading-relaxed break-words">
          {currentConfig.text}
        </p>
        <span className="text-[10px] text-gray-500 font-semibold block uppercase tracking-wider">
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
