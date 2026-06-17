import React from 'react';

const roleColors = {
  frontend:   'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  backend:    'bg-green-500/20 text-green-300 border border-green-500/30',
  fullstack:  'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  ml:         'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  mobile:     'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  designer:   'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  other:      'bg-gray-500/20 text-gray-300 border border-gray-500/30',
};

const roleNames = {
  frontend:   'Frontend Developer',
  backend:    'Backend Developer',
  fullstack:  'Fullstack Developer',
  ml:         'ML / AI Engineer',
  mobile:     'Mobile Developer',
  designer:   'UI/UX Designer',
  other:      'Other',
};

export default function RoleBadge({ role }) {
  const normalizedRole = role ? role.toLowerCase() : 'other';
  const colorClass = roleColors[normalizedRole] || roleColors.other;
  const name = roleNames[normalizedRole] || role || 'Other';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${colorClass}`}>
      {name}
    </span>
  );
}
export { roleNames };
