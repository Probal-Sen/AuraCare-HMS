import React, { useState } from 'react';

export const getRoleEmoji = (role) => {
  if (!role) return '👤';
  const r = role.toLowerCase();
  if (r.includes('doctor')) return '👨‍⚕️';
  if (r.includes('nurse')) return '🧑‍⚕️';
  if (r.includes('patient')) return '🧑';
  if (r.includes('admin')) return '👨‍💼';
  if (r.includes('reception')) return '👩‍💻';
  if (r.includes('pharmac')) return '💊';
  if (r.includes('lab')) return '🔬';
  if (r.includes('cashier')) return '🧾';
  return '👤';
};

const UserAvatar = ({ user, className = 'w-8 h-8 rounded-lg', textSize = 'text-sm' }) => {
  const [imgError, setImgError] = useState(false);

  const hasCustomAvatar = user?.avatar && !user.avatar.includes('default.png');

  if (hasCustomAvatar && !imgError) {
    return (
      <img
        src={user.avatar}
        alt={user?.name || 'User'}
        className={`${className} object-cover ring-2 ring-medical-500/30 shadow-sm`}
        onError={() => setImgError(true)}
      />
    );
  }

  const emoji = getRoleEmoji(user?.role);

  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-medical-500/20 via-blue-500/10 to-indigo-500/20 dark:from-medical-500/30 dark:to-indigo-500/30 border border-medical-500/30 ring-2 ring-medical-500/20 select-none shadow-sm`}
      title={`${user?.name || 'User'} (${user?.role || 'Profile'})`}
    >
      <span className={textSize}>{emoji}</span>
    </div>
  );
};

export default UserAvatar;
