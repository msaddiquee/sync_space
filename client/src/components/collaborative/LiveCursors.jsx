import React from 'react';

export const LiveCursors = ({ cursors }) => {
  if (!cursors || cursors.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {cursors.map(({ socketId, user, position }) => {
        if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') return null;

        const color = user?.avatarColor || '#3b82f6';
        const name = user?.name || 'Teammate';

        return (
          <div
            key={socketId}
            className="absolute transition-all duration-75 ease-out flex items-center space-x-1"
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
          >
            {/* Custom SVG Cursor Arrow */}
            <svg
              className="w-5 h-5 drop-shadow-md"
              viewBox="0 0 24 24"
              fill={color}
              stroke="white"
              strokeWidth="1.5"
            >
              <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" />
            </svg>

            {/* Name Tag Badge */}
            <span
              className="px-2 py-0.5 text-xs font-semibold text-white rounded-full shadow-sm whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

