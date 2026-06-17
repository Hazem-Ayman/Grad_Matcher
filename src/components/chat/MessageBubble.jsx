import React from 'react';

export default function MessageBubble({ message, isOwn }) {
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={`flex flex-col max-w-[75%] ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}>
      {/* Bubble */}
      <div
        className={`px-4 py-2.5 rounded-2xl text-sm font-medium tracking-wide shadow-sm break-words w-full ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-800 text-gray-250 rounded-bl-none border border-gray-700/40'
        }`}
      >
        {message.content}
      </div>

      {/* Timestamp */}
      <span className="text-[10px] text-gray-500 font-medium mt-1 px-1">
        {formatTime(message.created_at)}
      </span>
    </div>
  );
}
