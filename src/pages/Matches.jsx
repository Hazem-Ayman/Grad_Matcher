import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMatches } from '../hooks/useMatches';
import MatchCard from '../components/matches/MatchCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, PhoneCall, Camera, Briefcase, Send, Compass } from 'lucide-react';

export default function Matches() {
  const { profile: currentProfile } = useAuth();
  const { matches, loading, error } = useMatches(currentProfile);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenContact = (profile) => {
    setSelectedProfile(profile);
    setIsContactOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="md" message="Loading matches..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-4xl mx-auto w-full py-2">
      {/* Header Info */}
      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">Your Matches</h1>
        <p className="text-xs text-gray-400">Teammates who swiped right on your profile. Connect with them below!</p>
      </div>

      {matches.length > 0 ? (
        /* Matches Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onViewContact={handleOpenContact}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-10">
          <EmptyState
            title="No matches yet"
            description="Keep swiping to find project teammates! Make sure your profile details are updated and appealing."
            icon="💞"
          >
            <button
              onClick={() => navigate('/swipe')}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-650/15 active:scale-95 cursor-pointer mt-2"
            >
              <Compass className="w-4 h-4" />
              <span>Start Swiping</span>
            </button>
          </EmptyState>
        </div>
      )}

      {/* Details Contact Modal */}
      {isContactOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
            onClick={() => setIsContactOpen(false)}
          />
          <div className="relative bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-5 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-gray-800 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-3xl">📞</div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{selectedProfile.name}</h3>
              <p className="text-xs text-gray-400">Reach out to start planning your graduation project!</p>
            </div>

            <div className="bg-gray-950/60 border border-gray-805 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center gap-1.5 border-b border-gray-800 pb-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Contact details</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 text-sm text-gray-300">
                {selectedProfile.phone && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><PhoneCall className="w-3.5 h-3.5" /> Phone:</span>
                    <span className="font-semibold text-white select-all">{selectedProfile.phone}</span>
                  </div>
                )}
                {selectedProfile.instagram && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Camera className="w-3.5 h-3.5" /> Instagram:</span>
                    <span className="font-semibold text-white select-all">{selectedProfile.instagram}</span>
                  </div>
                )}
                {selectedProfile.telegram && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Send className="w-3.5 h-3.5" /> Telegram:</span>
                    <span className="font-semibold text-white select-all">{selectedProfile.telegram}</span>
                  </div>
                )}
                {selectedProfile.linkedin && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Briefcase className="w-3.5 h-3.5" /> LinkedIn:</span>
                    <a
                      href={selectedProfile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-400 hover:underline truncate max-w-[150px]"
                    >
                      Open Link
                    </a>
                  </div>
                )}
                {!selectedProfile.phone && !selectedProfile.instagram && !selectedProfile.telegram && !selectedProfile.linkedin && (
                  <p className="text-xs text-gray-500 italic text-center py-2">No contact handles specified.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsContactOpen(false)}
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold tracking-wide shadow-md active:scale-95 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
