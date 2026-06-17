import React from 'react';

export default function LoadingSpinner({ size = 'md', message = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className="relative">
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full blur bg-indigo-500/30 animate-pulse ${selectedSizeClass}`}></div>
        {/* Spinner ring */}
        <div className={`relative rounded-full border-t-indigo-600 border-r-indigo-600 border-b-gray-800 border-l-gray-800 animate-spin ${selectedSizeClass}`}></div>
      </div>
      {message && (
        <p className="text-sm font-medium text-gray-400 animate-pulse">{message}</p>
      )}
    </div>
  );
}
