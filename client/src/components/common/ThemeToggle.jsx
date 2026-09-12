import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 
        ${isDark 
          ? 'bg-[#1D1718] hover:bg-[#2A2123] text-[#CC8B65] border border-[#2F2426] shadow-sm' 
          : 'bg-[#E3DCD2]/60 hover:bg-[#E3DCD2] text-[#013328] border border-[#D5CBBF] shadow-sm'
        } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 text-[#CC8B65]" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 text-[#013328]" />
        )}
      </div>

      {showLabel && (
        <span className={`ml-2 text-xs font-semibold ${isDark ? 'text-[#E3DCD2]' : 'text-[#013328]'}`}>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};

