import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Flame, Heart, Bell, User, LogOut, Users } from 'lucide-react';

export default function TopNav({ unreadNotificationsCount, onSignOut }) {
  return (
    <header className="hidden md:block sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/swipe" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
            G
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            GradMatch
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          <NavLink
            to="/swipe"
            className={({ isActive }) =>
              `flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`
            }
          >
            <Flame className="w-4 h-4" />
            <span>Swipe</span>
          </NavLink>

          <NavLink
            to="/matches"
            className={({ isActive }) =>
              `flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`
            }
          >
            <Heart className="w-4 h-4" />
            <span>Matches</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `relative flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`
            }
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-2 flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            )}
          </NavLink>

          <NavLink
            to="/team"
            className={({ isActive }) =>
              `flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`
            }
          >
            <Users className="w-4 h-4" />
            <span>Team</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
              }`
            }
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </NavLink>
        </nav>

        {/* Logout Button */}
        <button
          onClick={onSignOut}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
}
