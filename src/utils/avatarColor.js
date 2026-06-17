const colors = [
  'bg-indigo-500', 
  'bg-violet-500', 
  'bg-pink-500', 
  'bg-rose-500', 
  'bg-orange-500', 
  'bg-teal-500', 
  'bg-cyan-500', 
  'bg-green-500'
];

export function getAvatarColor(name) {
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
