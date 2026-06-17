import React from 'react';

export default function EmptyState({ title, description, icon = '✨', children }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto my-8 space-y-4 glass-panel rounded-2xl border border-gray-800">
      <div className="w-16 h-16 rounded-full bg-gray-800/60 border border-gray-700/50 flex items-center justify-center text-3xl shadow-inner animate-bounce">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
