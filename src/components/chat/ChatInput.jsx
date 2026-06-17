import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, placeholder = 'Type a message...' }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-2 flex items-center gap-2 shadow-inner"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-sm text-white px-3 py-2 placeholder-gray-500"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 text-white disabled:text-gray-650 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
