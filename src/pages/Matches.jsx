import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMatches } from '../hooks/useMatches';
import MatchCard from '../components/matches/MatchCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, PhoneCall, Camera, Briefcase, Send, Compass, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CopyButton from '../components/ui/CopyButton';



export default function Matches() {
  const { profile: currentProfile } = useAuth();
  const { matches, loading, error, refetch } = useMatches(currentProfile);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const handleOpenContact = (profile) => {
    setSelectedProfile(profile);
    setIsContactOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Matches updated!", { id: 'matches-refresh' });
  };

  if (loading && matches.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="md" message="Loading matches..." />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-4xl mx-auto w-full py-2">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-900 pb-4">
        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">Your Matches</h1>
          <p className="text-xs text-gray-400">Teammates who swiped right on your profile. Connect with them below!</p>
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-2.5">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider hidden sm:inline">
            List polls automatically
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 border border-gray-805 hover:border-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {matches.length > 0 ? (
        /* Matches Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              currentProfile={currentProfile}
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
                    <div className="flex items-center min-w-0">
                      <span className="font-semibold text-white select-all truncate max-w-[150px]">{selectedProfile.phone}</span>
                      <CopyButton text={selectedProfile.phone} />
                    </div>
                  </div>
                )}
                {selectedProfile.instagram && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Camera className="w-3.5 h-3.5" /> Instagram:</span>
                    <div className="flex items-center min-w-0">
                      <span className="font-semibold text-white select-all truncate max-w-[150px]">{selectedProfile.instagram}</span>
                      <CopyButton text={selectedProfile.instagram} />
                    </div>
                  </div>
                )}
                {selectedProfile.telegram && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Send className="w-3.5 h-3.5" /> Telegram:</span>
                    <div className="flex items-center min-w-0">
                      <span className="font-semibold text-white select-all truncate max-w-[150px]">{selectedProfile.telegram}</span>
                      <CopyButton text={selectedProfile.telegram} />
                    </div>
                  </div>
                )}
                {selectedProfile.linkedin && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Briefcase className="w-3.5 h-3.5" /> LinkedIn:</span>
                    <div className="flex items-center min-w-0">
                      <span className="font-semibold text-white select-all truncate max-w-[150px]">{selectedProfile.linkedin}</span>
                      <CopyButton text={selectedProfile.linkedin} />
                    </div>
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
