import React from 'react';
import Avatar from '../ui/Avatar';
import RoleBadge from '../ui/RoleBadge';
import LookingForBadge from '../ui/LookingForBadge';
import SkillChip from '../ui/SkillChip';
import { Code, ExternalLink } from 'lucide-react';

export default function ProfileCard({ profile, dragX = 0, isTop = false }) {
  if (!profile) return null;

  const {
    name,
    university,
    year,
    role,
    skills,
    github_url,
    project_idea,
    looking_for,
    avatar_url,
  } = profile;

  // Calculate overlay opacity based on swipe drag distance
  const likeOpacity = Math.min(Math.max(dragX / 100, 0), 0.8);
  const passOpacity = Math.min(Math.max(-dragX / 100, 0), 0.8);

  return (
    <div className="relative w-full h-[520px] md:h-[580px] bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none">
      {/* Swipe Status Overlays (only visible when top card is being dragged) */}
      {isTop && dragX !== 0 && (
        <>
          {/* LIKE Overlay */}
          <div
            className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none z-30 transition-opacity duration-75"
            style={{ opacity: likeOpacity }}
          >
            <div className="border-4 border-green-500 text-green-500 font-extrabold text-4xl px-6 py-3 rounded-2xl transform -rotate-12 tracking-wider shadow-lg bg-gray-950/40">
              LIKE
            </div>
          </div>

          {/* PASS Overlay */}
          <div
            className="absolute inset-0 bg-red-500/20 flex items-center justify-center pointer-events-none z-30 transition-opacity duration-75"
            style={{ opacity: passOpacity }}
          >
            <div className="border-4 border-red-500 text-red-500 font-extrabold text-4xl px-6 py-3 rounded-2xl transform rotate-12 tracking-wider shadow-lg bg-gray-950/40">
              PASS
            </div>
          </div>
        </>
      )}

      {/* Decorative gradient top background */}
      <div className="h-24 bg-gradient-to-b from-indigo-950/40 to-transparent absolute top-0 left-0 right-0 pointer-events-none"></div>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col items-center text-center p-6 space-y-4 pt-10 overflow-y-auto">
        {/* Avatar */}
        <Avatar src={avatar_url} name={name} size="xxl" className="border-4 border-gray-800 shadow-xl shadow-black/40" />

        {/* Identity */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-wide">{name}</h2>
          <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">
            {university} • {year} Year
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-col items-center gap-2">
          <LookingForBadge lookingFor={looking_for} />
          <RoleBadge role={role} />
        </div>

        {/* Project Idea Quote */}
        {project_idea ? (
          <div className="w-full bg-gray-950/40 border border-gray-800/80 rounded-2xl p-4 my-2 relative">
            <span className="absolute top-2 left-3 text-3xl font-serif text-gray-800/80 pointer-events-none">“</span>
            <p className="text-sm italic text-gray-300 relative z-10 px-2 line-clamp-3 leading-relaxed">
              {project_idea}
            </p>
            <span className="absolute bottom-1 right-3 text-3xl font-serif text-gray-800/80 pointer-events-none">”</span>
          </div>
        ) : (
          <div className="h-6"></div>
        )}

        {/* Skills wrapper */}
        {skills && skills.length > 0 && (
          <div className="w-full space-y-1.5 text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Skills & Tech</span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <SkillChip key={skill} skill={skill} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer (GitHub Link) */}
      <div className="bg-gray-950/50 border-t border-gray-800/60 p-4 flex items-center justify-center">
        {github_url ? (
          <a
            href={github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white bg-gray-850 hover:bg-gray-800 px-4 py-2.5 rounded-xl border border-gray-800 hover:border-gray-700 transition-all shadow-inner w-full justify-center group"
          >
            <Code className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>View GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ) : (
          <span className="text-xs text-gray-500 font-medium py-2">No GitHub profile linked</span>
        )}
      </div>
    </div>
  );
}
