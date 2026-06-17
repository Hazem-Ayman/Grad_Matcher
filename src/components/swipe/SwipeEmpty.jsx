import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';
import { RotateCw, User } from 'lucide-react';

export default function SwipeEmpty({ onRefresh, isRefreshing = false }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <EmptyState
        title="You've seen everyone for now 👀"
        description="Check back later or update your profile to appear to more people."
        icon="👀"
      >
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-650 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer disabled:cursor-wait"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Update Profile</span>
          </button>
        </div>
      </EmptyState>
    </div>
  );
}
