import React from 'react';
import { NavLink } from 'react-router-dom';
import { Flame, Heart, Bell, User, Users } from 'lucide-react';

export default function BottomNav({ unreadNotificationsCount }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/90 border-t border-gray-800 backdrop-blur-lg px-4 py-2 flex items-center justify-around pb-safe-bottom">
      <NavLink
        to="/swipe"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
            isActive ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-200'
          }`
        }
      >
        <Flame className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Swipe</span>
      </NavLink>

      <NavLink
        to="/matches"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
            isActive ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-200'
          }`
        }
      >
        <Heart className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Matches</span>
      </NavLink>

      <NavLink
        to="/team"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
            isActive ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-200'
          }`
        }
      >
        <Users className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Team</span>
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
            isActive ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-200'
          }`
        }
      >
        <Bell className="w-6 h-6" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-gray-900 animate-pulse">
            {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
          </span>
        )}
        <span className="text-[10px] mt-1 font-medium">Notifs</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
            isActive ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-200'
          }`
        }
      >
        <User className="w-6 h-6" />
        <span className="text-[10px] mt-1 font-medium">Profile</span>
      </NavLink>
    </nav>
  );
}
