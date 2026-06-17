import React from 'react';
import { getAvatarColor, getInitials } from '../../utils/avatarColor';

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
    xxl: 'w-32 h-32 text-2xl',
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md;
  const initials = getInitials(name || '?');
  const bgColorClass = getAvatarColor(name || '?');

  return (
    <div className={`relative flex-shrink-0 inline-flex items-center justify-center rounded-full overflow-hidden font-bold select-none ${selectedSizeClass} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, fallback to initials by resetting src
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.classList.add(bgColorClass);
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={`w-full h-full flex items-center justify-center text-white ${bgColorClass}`}
        style={{ display: src ? 'none' : 'flex' }}
      >
        {initials}
      </div>
    </div>
  );
}
