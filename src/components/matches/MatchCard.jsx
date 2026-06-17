import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import RoleBadge from '../ui/RoleBadge';
import SkillChip from '../ui/SkillChip';
import { MessageSquare, PhoneCall } from 'lucide-react';

export default function MatchCard({ match, onViewContact }) {
  const { id: matchId, profile } = match;
  const navigate = useNavigate();

  if (!profile) return null;

  const { name, university, role, skills, avatar_url } = profile;

  return (
    <div className="glass-panel border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <Avatar src={avatar_url} name={name} size="lg" className="border border-gray-800" />

        {/* Profile Info */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-white text-base truncate tracking-wide">{name}</h3>
          </div>
          <p className="text-xs text-indigo-400 font-medium truncate">{university}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <RoleBadge role={role} />
          </div>
        </div>
      </div>

      {/* Skills (first 3 chips) */}
      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skills.slice(0, 3).map((skill) => (
            <SkillChip key={skill} skill={skill} />
          ))}
          {skills.length > 3 && (
            <span className="text-[10px] text-gray-500 font-semibold px-2 py-1 bg-gray-800/40 rounded border border-transparent">
              +{skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/60">
        <button
          onClick={() => onViewContact(profile)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:text-white text-gray-300 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Contact</span>
        </button>

        <button
          onClick={() => navigate(`/chat/${matchId}`)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Message</span>
        </button>
      </div>
    </div>
  );
}
