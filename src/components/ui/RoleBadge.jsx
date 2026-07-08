import React from 'react';

const roleColors = {
  frontend:       'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  backend:        'bg-green-500/20 text-green-300 border border-green-500/30',
  fullstack:      'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  mobile:         'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  ml:             'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  datascience:    'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  cybersecurity:  'bg-red-500/20 text-red-300 border border-red-500/30',
  devops:         'bg-teal-500/20 text-teal-300 border border-teal-500/30',
  designer:       'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  game:           'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  embedded:       'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  other:          'bg-gray-500/20 text-gray-300 border border-gray-500/30',
};

const roleNames = {
  frontend:       'Frontend Dev',
  backend:        'Backend Dev',
  fullstack:      'Fullstack Dev',
  mobile:         'Mobile Dev',
  ml:             'ML / AI Engineer',
  datascience:    'Data Scientist',
  cybersecurity:  'Cyber Security',
  devops:         'DevOps & Cloud',
  designer:       'UI/UX Designer',
  game:           'Game Dev',
  embedded:       'Embedded / IoT',
  other:          'Other Field',
};

export default function RoleBadge({ role, framework }) {
  const normalizedRole = role ? role.toLowerCase() : 'other';
  const colorClass = roleColors[normalizedRole] || roleColors.other;
  const name = roleNames[normalizedRole] || role || 'Other';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${colorClass}`}>
      {name}{framework ? ` • ${framework}` : ''}
    </span>
  );
}
export { roleNames };
