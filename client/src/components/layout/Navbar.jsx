import React, { useState } from 'react';
import { 
  Menu, 
  Share2, 
  Check, 
  CloudUpload, 
  Wifi, 
  WifiOff, 
  LogOut,
  Layers,
  FileText
} from 'lucide-react';
import { PresenceBar } from '../collaborative/PresenceBar';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ 
  currentDoc, 
  workspace, 
  activeUsers, 
  saveStatus, 
  isSocketConnected,
  onTitleChange,
  onOpenInvite,
  onToggleSidebar
}) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-14 border-b border-[#E3DCD2] dark:border-[#261E20] bg-white dark:bg-[#151011] px-4 flex items-center justify-between select-none z-30 relative transition-colors">
      {/* Left: Sidebar Toggle + Document Title Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#013328] dark:hover:text-[#E3DCD2] hover:bg-[#E3DCD2]/40 dark:hover:bg-[#1E1719] rounded-lg lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {currentDoc ? (
          <div className="flex items-center space-x-2">
            <span className="text-xl">{currentDoc.icon || (currentDoc.type === 'CANVAS' ? '🎨' : '📄')}</span>
            <input
              type="text"
              value={currentDoc.title || ''}
              onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
              placeholder="Untitled Document"
              className="text-sm font-semibold text-[#100C0D] dark:text-[#E3DCD2] bg-transparent border-none outline-none focus:bg-[#E3DCD2]/40 dark:focus:bg-[#1E1719] px-2 py-1 rounded hover:bg-[#E3DCD2]/20 dark:hover:bg-[#1E1719]/50 transition-colors max-w-xs sm:max-w-md truncate"
            />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              currentDoc.type === 'CANVAS' 
                ? 'bg-[#CC8B65]/15 text-[#965A37] dark:bg-[#CC8B65]/20 dark:text-[#E7C3AC] border border-[#CC8B65]/30' 
                : 'bg-[#013328]/10 text-[#013328] dark:bg-[#013328]/30 dark:text-[#8FBDB1] border border-[#013328]/20 dark:border-[#013328]/40'
            }`}>
              {currentDoc.type === 'CANVAS' ? 'Miro Canvas' : 'Notion Doc'}
            </span>
          </div>
        ) : (
          <div className="text-sm font-bold text-[#013328] dark:text-[#E3DCD2]">SyncSpace</div>
        )}
      </div>

      {/* Center: Real-time Save & Connection Status */}
      <div className="hidden md:flex items-center space-x-3 text-xs text-slate-500 dark:text-[#A0938A]">
        {saveStatus === 'saving' ? (
          <div className="flex items-center space-x-1.5 text-[#B8744C] dark:text-[#DCA281] bg-[#CC8B65]/10 dark:bg-[#CC8B65]/15 px-2.5 py-1 rounded-full border border-[#CC8B65]/30 animate-pulse">
            <CloudUpload className="w-3.5 h-3.5 animate-spin" />
            <span>Saving changes...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-[#013328] dark:text-[#C3DDD6] bg-[#013328]/5 dark:bg-[#013328]/25 px-2.5 py-1 rounded-full border border-[#013328]/15 dark:border-[#013328]/35">
            <span className="w-1.5 h-1.5 bg-[#0A735C] rounded-full"></span>
            <span>Saved to cloud</span>
          </div>
        )}

        <div className="flex items-center space-x-1 text-xs">
          {isSocketConnected ? (
            <span className="flex items-center text-[#013328] dark:text-[#8FBDB1] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#CC8B65] mr-1.5 animate-ping opacity-75"></span>
              Live Sync
            </span>
          ) : (
            <span className="flex items-center text-slate-400 dark:text-slate-500">
              <WifiOff className="w-3.5 h-3.5 mr-1" />
              Connecting...
            </span>
          )}
        </div>
      </div>

      {/* Right: Presence Avatars + Theme Toggle + Share Button + Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Collaborators Active in Current Document */}
        <PresenceBar activeUsers={activeUsers} currentUserId={user?.id} />

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Share / Invite Button */}
        <button
          onClick={onOpenInvite}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#CC8B65] hover:bg-[#B8744C] text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:shadow"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-[#E3DCD2] dark:ring-[#2E2325] hover:ring-[#CC8B65] transition-all"
            style={{ backgroundColor: user?.avatarColor || '#013328' }}
          >
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1C1618] rounded-2xl shadow-2xl border border-[#E3DCD2] dark:border-[#2E2325] p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#E3DCD2] dark:border-[#2E2325]">
                <p className="text-xs font-bold text-[#100C0D] dark:text-[#E3DCD2] truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-[#A0938A] truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); logout(); }}
                className="w-full mt-1 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl flex items-center space-x-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

