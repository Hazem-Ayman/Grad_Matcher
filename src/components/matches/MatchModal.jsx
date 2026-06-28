import { useState } from 'react';
import Avatar from '../ui/Avatar';
import { Flame, PhoneCall, X, ShieldCheck, Camera, Briefcase, Send } from 'lucide-react';

export default function MatchModal({ isOpen, onClose, currentProfile, matchedProfile }) {
  const [showContact, setShowContact] = useState(false);

  if (!isOpen || !matchedProfile || !currentProfile) return null;

  const contactOptions = [
    { key: 'phone', label: 'Phone', icon: PhoneCall, value: matchedProfile.phone },
    { key: 'instagram', label: 'Instagram', icon: Camera, value: matchedProfile.instagram },
    { key: 'linkedin', label: 'LinkedIn', icon: Briefcase, value: matchedProfile.linkedin },
    { key: 'telegram', label: 'Telegram', icon: Send, value: matchedProfile.telegram },
  ].filter(opt => opt.value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-gray-800 p-1.5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="space-y-1 pt-2">
          <div className="text-4xl">🎉</div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-purple-400 tracking-wide animate-pulse">
            It's a Match!
          </h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            You and {matchedProfile.name} liked each other. Get ready to build something awesome!
          </p>
        </div>

        {/* Both Avatars */}
        <div className="flex items-center justify-center space-x-6 relative">
          <div className="relative">
            <Avatar src={currentProfile.avatar_url} name={currentProfile.name} size="xl" className="border-4 border-indigo-500 shadow-xl" />
            <span className="absolute bottom-0 right-0 bg-indigo-500 text-white rounded-full p-1 text-[9px] font-bold">You</span>
          </div>

          <div className="relative z-10 w-10 h-10 rounded-full bg-indigo-650 flex items-center justify-center font-bold text-white shadow-lg border-2 border-gray-900 animate-bounce">
            ⚡
          </div>

          <div className="relative">
            <Avatar src={matchedProfile.avatar_url} name={matchedProfile.name} size="xl" className="border-4 border-indigo-500 shadow-xl" />
            <span className="absolute bottom-0 right-0 bg-indigo-500 text-white rounded-full p-1 text-[9px] font-bold">Them</span>
          </div>
        </div>

        {/* Contact Info revealed section */}
        {showContact ? (
          <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-4 text-left space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 border-b border-gray-800 pb-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Revealed Contact Info</span>
            </div>
            {contactOptions.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 text-sm">
                {contactOptions.map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between text-gray-300 py-1">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <opt.icon className="w-4 h-4" />
                      <span>{opt.label}:</span>
                    </div>
                    <span className="font-semibold text-white select-all">{opt.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No direct contact details provided by user.</p>
            )}
          </div>
        ) : null}

        {/* Actions buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          {!showContact && (
            <button
              onClick={() => setShowContact(true)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold tracking-wide shadow-lg shadow-indigo-600/20 transition-all active:scale-98 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Reveal Contact Info</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-2xl text-sm font-semibold tracking-wide transition-all active:scale-98 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Keep Swiping</span>
          </button>
        </div>
      </div>
    </div>
  );
}
