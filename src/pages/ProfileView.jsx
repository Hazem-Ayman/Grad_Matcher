import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Avatar from '../components/ui/Avatar';
import RoleBadge from '../components/ui/RoleBadge';
import SkillChip from '../components/ui/SkillChip';
import { ArrowLeft, PhoneCall, Camera, Briefcase, Send, Copy, Check, Code, BookOpen, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors cursor-pointer ml-1.5 flex-shrink-0"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

export default function ProfileView() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, team:teams!team_id(id, leader_id, is_full, members:profiles!team_id(id, name, avatar_url))')
          .eq('id', profileId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile details:", err);
        toast.error("Could not load teammate's profile.");
      } finally {
        setLoading(false);
      }
    }

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="md" message="Loading profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-10">
        <div className="text-4xl">⚠️</div>
        <h3 className="text-xl font-bold text-white">Profile not found</h3>
        <p className="text-xs text-gray-400 max-w-xs">The teammate profile you are trying to view does not exist or is hidden.</p>
        <button
          onClick={() => navigate('/matches')}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Matches</span>
        </button>
      </div>
    );
  }

  const getLookingForText = (val) => {
    switch (val) {
      case 'full_team': return 'Needs Full Team';
      case 'one_member': return 'Needs 1–2 Members';
      case 'browsing': return 'Browsing / Open';
      default: return 'Open for Matches';
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full py-2 space-y-6">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Teammate Profile</span>
        <div className="w-[68px]"></div> {/* spacer */}
      </div>

      {/* Main Profile Header */}
      <div className="glass-panel border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <Avatar src={profile.avatar_url} name={profile.name} size="xl" className="border-4 border-indigo-500/30 shadow-xl" />

        <div className="flex-1 space-y-3 min-w-0">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide truncate">{profile.name}</h1>
            <p className="text-xs font-bold text-indigo-400 tracking-wide uppercase">{profile.university}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <RoleBadge role={profile.role} />
            <span className="text-xs px-2.5 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-full font-semibold">
              🎓 Year: {profile.year}
            </span>
            <span className="text-xs px-2.5 py-1 bg-gray-850/50 border border-indigo-500/20 text-indigo-300 rounded-full font-semibold">
              🎯 {getLookingForText(profile.looking_for)}
            </span>
          </div>
        </div>
      </div>

      {/* Bio & Project Idea */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">About Me</h3>
          </div>
          <p className="text-sm text-gray-350 leading-relaxed italic">
            {profile.bio || "No biography provided."}
          </p>
        </div>

        <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-xs text-gray-200 uppercase tracking-wider">What do you want to achieve with this project?</h3>
          </div>
          <p className="text-sm text-indigo-200 leading-relaxed font-medium bg-indigo-950/20 border border-indigo-950/40 rounded-2xl p-4">
            "{profile.project_idea || "No specific project goals entered yet."}"
          </p>
        </div>

        <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">What are you searching for in your teammates?</h3>
          </div>
          <p className="text-sm text-gray-350 leading-relaxed font-medium bg-gray-950/20 border border-gray-850 rounded-2xl p-4">
            {profile.searching_for || "No teammate preferences entered yet."}
          </p>
        </div>
      </div>

      {/* Skills */}
      <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2.5">
          <Briefcase className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">Technical Skills</h3>
        </div>
        {profile.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {profile.skills.map((skill) => (
              <SkillChip key={skill} skill={skill} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">No skills added yet.</p>
        )}
      </div>

      {/* Team Members */}
      {profile.team?.members && profile.team.members.length > 1 && (
        <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4 text-left">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2.5">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">Project Team Members</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {profile.team.members.map((member) => (
              <div
                key={member.id}
                onClick={() => {
                  if (member.id !== profile.id) {
                    navigate(`/view-profile/${member.id}`);
                  }
                }}
                className={`flex items-center gap-3 p-3 bg-gray-950/60 border border-gray-850 rounded-2xl ${
                  member.id !== profile.id
                    ? 'cursor-pointer hover:border-indigo-500/30 hover:bg-gray-950 transition-all'
                    : 'cursor-default'
                }`}
              >
                <Avatar src={member.avatar_url} name={member.name} size="md" className="border border-gray-800 animate-in fade-in" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate">{member.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {member.id === profile.team.leader_id ? '👑 Leader' : 'Teammate'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Links & Contact Details */}
      <div className="glass-panel border border-gray-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2.5">
          <PhoneCall className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">Contact & Links</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GitHub Link */}
          {profile.github_url && (
            <div className="flex items-center justify-between p-3 bg-gray-950/60 border border-gray-850 rounded-2xl">
              <div className="flex items-center gap-2 min-w-0">
                <Code className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-0.5">GitHub</p>
                  <a
                    href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:underline font-semibold"
                  >
                    View Repository
                  </a>
                </div>
              </div>
              <CopyButton text={profile.github_url} />
            </div>
          )}

          {/* Phone Details */}
          {profile.phone && (
            <div className="flex items-center justify-between p-3 bg-gray-950/60 border border-gray-850 rounded-2xl">
              <div className="flex items-center gap-2 min-w-0">
                <PhoneCall className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-0.5">Phone Number</p>
                  <p className="text-sm font-semibold text-white select-all">{profile.phone}</p>
                </div>
              </div>
              <CopyButton text={profile.phone} />
            </div>
          )}

          {/* Instagram Handle */}
          {profile.instagram && (
            <div className="flex items-center justify-between p-3 bg-gray-950/60 border border-gray-850 rounded-2xl">
              <div className="flex items-center gap-2 min-w-0">
                <Camera className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-0.5">Instagram</p>
                  <p className="text-sm font-semibold text-white select-all">@{profile.instagram}</p>
                </div>
              </div>
              <CopyButton text={profile.instagram} />
            </div>
          )}

          {/* Telegram Handle */}
          {profile.telegram && (
            <div className="flex items-center justify-between p-3 bg-gray-950/60 border border-gray-850 rounded-2xl">
              <div className="flex items-center gap-2 min-w-0">
                <Send className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-0.5">Telegram</p>
                  <p className="text-sm font-semibold text-white select-all">@{profile.telegram}</p>
                </div>
              </div>
              <CopyButton text={profile.telegram} />
            </div>
          )}

          {/* LinkedIn Profile */}
          {profile.linkedin && (
            <div className="flex items-center justify-between p-3 bg-gray-950/60 border border-gray-850 rounded-2xl col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 min-w-0">
                <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-0.5">LinkedIn Profile</p>
                  <a
                    href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:underline font-semibold truncate block max-w-[400px]"
                  >
                    {profile.linkedin}
                  </a>
                </div>
              </div>
              <CopyButton text={profile.linkedin} />
            </div>
          )}

          {!profile.phone && !profile.instagram && !profile.telegram && !profile.linkedin && !profile.github_url && (
            <p className="text-xs text-gray-500 italic col-span-2 py-2 text-center">No links or contact options provided.</p>
          )}
        </div>
      </div>
    </div>
  );
}
