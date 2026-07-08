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

import { CS_FIELDS } from '../../utils/csFields';

export default function RoleBadge({ role, framework }) {
  const roleList = role ? role.split(',').map(r => r.trim()).filter(Boolean) : ['other'];
  const fwList = framework ? framework.split(',').map(f => f.trim()).filter(Boolean) : [];

  const matchedFrameworks = new Set();
  const badges = [];

  roleList.forEach(r => {
    const normR = r.toLowerCase();
    const fieldConfig = CS_FIELDS.find(f => f.id === normR);
    
    // Find frameworks that belong to this CS field
    const fieldFws = fwList.filter(fw => {
      return fieldConfig?.frameworks.includes(fw);
    });

    fieldFws.forEach(fw => matchedFrameworks.add(fw));

    const name = roleNames[normR] || r || 'Other';
    const colorClass = roleColors[normR] || roleColors.other;

    if (fieldFws.length > 0) {
      fieldFws.forEach(fw => {
        badges.push({ label: `${name} • ${fw}`, colorClass });
      });
    } else {
      badges.push({ label: name, colorClass });
    }
  });

  // leftover frameworks
  fwList.forEach(fw => {
    if (!matchedFrameworks.has(fw)) {
      badges.push({ label: fw, colorClass: roleColors.other });
    }
  });

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((badge, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide ${badge.colorClass}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
export { roleNames };
