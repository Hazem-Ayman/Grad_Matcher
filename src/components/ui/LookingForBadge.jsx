import React from 'react';

const lookingForConfig = {
  full_team: {
    label: 'Needs Full Team',
    styles: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    icon: '🔍',
  },
  one_member: {
    label: 'Needs 1–2 Members',
    styles: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    icon: '👤',
  },
  browsing: {
    label: 'Just Exploring',
    styles: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
    icon: '👀',
  },
};

export default function LookingForBadge({ lookingFor }) {
  const config = lookingForConfig[lookingFor] || lookingForConfig.browsing;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${config.styles}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
export { lookingForConfig };
