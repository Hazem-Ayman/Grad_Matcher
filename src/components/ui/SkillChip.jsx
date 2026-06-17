import React from 'react';

export default function SkillChip({ skill }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700/60 hover:border-gray-600 transition-colors">
      {skill}
    </span>
  );
}
