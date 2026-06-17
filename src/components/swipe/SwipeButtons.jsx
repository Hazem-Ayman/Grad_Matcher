import React from 'react';
import { X, Heart } from 'lucide-react';

export default function SwipeButtons({ onPass, onLike, disabled = false }) {
  return (
    <div className="flex items-center justify-center space-x-6 py-4">
      {/* Pass Button */}
      <button
        onClick={onPass}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        title="Pass (Left Arrow)"
      >
        <X className="w-8 h-8 transition-transform group-hover:rotate-12" />
      </button>

      {/* Like Button */}
      <button
        onClick={onLike}
        disabled={disabled}
        className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 text-green-500 hover:bg-green-500/10 hover:border-green-500/50 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        title="Interested (Right Arrow)"
      >
        <Heart className="w-8 h-8 transition-transform group-hover:scale-110 fill-transparent hover:fill-green-500/10" />
      </button>
    </div>
  );
}
