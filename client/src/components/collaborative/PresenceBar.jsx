import React from 'react';

export const PresenceBar = ({ activeUsers = [], currentUserId }) => {
  return (
    <div className="flex items-center -space-x-2 overflow-hidden px-1">
      {activeUsers.map((u, idx) => {
        const isSelf = (u.userId || u.id) === currentUserId;
        const color = u.avatarColor || '#3b82f6';
        const initial = (u.name || 'U').charAt(0).toUpperCase();

        return (
          <div
            key={u.socketId || idx}
            title={`${u.name} ${isSelf ? '(You)' : ''}`}
            className="relative inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white ring-2 ring-white shadow-sm transition-transform hover:scale-110 hover:z-10 cursor-pointer"
            style={{ backgroundColor: color }}
          >
            {initial}
            {/* Online Pulse indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
        );
      })}
    </div>
  );
};

