import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Layout, 
  Trash2, 
  ChevronDown, 
  Check, 
  Sparkles,
  Users,
  Compass,
  X
} from 'lucide-react';

export const Sidebar = ({
  workspaces,
  currentWorkspace,
  documents,
  currentDocId,
  onSelectDoc,
  onCreateDoc,
  onDeleteDoc,
  onSwitchWorkspace,
  onOpenNewWorkspaceModal,
  isOpen,
  onCloseMobile
}) => {
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 w-64 bg-[#FAF8F5] dark:bg-[#120E0F] backdrop-blur-md border-r border-[#E3DCD2] dark:border-[#261E20] 
        flex flex-col z-40 transition-all duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Workspace Switcher Header */}
        <div className="p-3 border-b border-[#E3DCD2]/80 dark:border-[#261E20]/80 relative">
          <button
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#E3DCD2]/50 dark:hover:bg-[#1C1618] transition-colors text-left"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-lg bg-[#013328] dark:bg-[#035443] text-[#FAF8F5] flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 border border-[#0A735C]/30">
                {(currentWorkspace?.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <h2 className="text-xs font-bold text-[#100C0D] dark:text-[#E3DCD2] truncate">
                  {currentWorkspace?.name || 'Select Workspace'}
                </h2>
                <p className="text-[10px] text-[#786B65] dark:text-[#8C7E77] flex items-center space-x-1">
                  <Users className="w-2.5 h-2.5" />
                  <span>{currentWorkspace?.members?.length || 1} members</span>
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#786B65] dark:text-[#8C7E77] flex-shrink-0" />
          </button>

          {/* Workspace Dropdown */}
          {workspaceDropdownOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-white dark:bg-[#1C1618] rounded-2xl shadow-xl border border-[#E3DCD2] dark:border-[#2E2325] p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold text-[#786B65] dark:text-[#8C7E77] uppercase tracking-wider">
                Your Workspaces
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {workspaces.map(w => (
                  <button
                    key={w._id}
                    onClick={() => {
                      onSwitchWorkspace(w._id);
                      setWorkspaceDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      w._id === currentWorkspace?._id 
                        ? 'bg-[#013328]/10 dark:bg-[#013328]/40 text-[#013328] dark:text-[#8FBDB1]' 
                        : 'text-[#100C0D] dark:text-[#E3DCD2] hover:bg-[#E3DCD2]/30 dark:hover:bg-[#251D20]'
                    }`}
                  >
                    <span className="truncate">{w.name}</span>
                    {w._id === currentWorkspace?._id && <Check className="w-3.5 h-3.5 text-[#CC8B65]" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-[#E3DCD2] dark:border-[#2E2325] my-1.5"></div>

              <button
                onClick={() => {
                  setWorkspaceDropdownOpen(false);
                  onOpenNewWorkspaceModal();
                }}
                className="w-full flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#CC8B65] dark:text-[#DCA281] hover:bg-[#CC8B65]/10 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Workspace / Join</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons: New Doc / New Whiteboard */}
        <div className="p-3 grid grid-cols-2 gap-2 border-b border-[#E3DCD2]/80 dark:border-[#261E20]/80">
          <button
            onClick={() => onCreateDoc('DOC')}
            className="flex items-center justify-center space-x-1.5 py-2 px-2.5 bg-white dark:bg-[#1A1416] hover:bg-[#FAF8F5] dark:hover:bg-[#251D20] text-[#100C0D] dark:text-[#E3DCD2] rounded-xl text-xs font-semibold border border-[#E3DCD2] dark:border-[#2E2325] shadow-2xs transition-all hover:border-[#CC8B65]"
          >
            <FileText className="w-3.5 h-3.5 text-[#013328] dark:text-[#8FBDB1]" />
            <span>+ Page</span>
          </button>
          <button
            onClick={() => onCreateDoc('CANVAS')}
            className="flex items-center justify-center space-x-1.5 py-2 px-2.5 bg-white dark:bg-[#1A1416] hover:bg-[#FAF8F5] dark:hover:bg-[#251D20] text-[#100C0D] dark:text-[#E3DCD2] rounded-xl text-xs font-semibold border border-[#E3DCD2] dark:border-[#2E2325] shadow-2xs transition-all hover:border-[#CC8B65]"
          >
            <Layout className="w-3.5 h-3.5 text-[#CC8B65]" />
            <span>+ Canvas</span>
          </button>
        </div>

        {/* Document Navigation Tree */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold text-[#786B65] dark:text-[#8C7E77] uppercase tracking-wider flex items-center justify-between">
            <span>Documents & Boards</span>
            <span className="text-[10px] font-normal text-[#786B65] dark:text-[#8C7E77]">{documents.length}</span>
          </div>

          {documents.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#786B65] dark:text-[#8C7E77]">
              No documents yet. Click "+ Page" or "+ Canvas" to get started!
            </div>
          ) : (
            documents.map(doc => {
              const isActive = doc._id === currentDocId;
              const isCanvas = doc.type === 'CANVAS';

              return (
                <div
                  key={doc._id}
                  onClick={() => {
                    onSelectDoc(doc._id);
                    onCloseMobile();
                  }}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#013328] text-white shadow-xs font-semibold'
                      : 'text-[#100C0D] dark:text-[#E3DCD2] hover:bg-[#E3DCD2]/40 dark:hover:bg-[#1D1719]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-base">{doc.icon || (isCanvas ? '🎨' : '📄')}</span>
                    <span className="truncate">{doc.title || 'Untitled'}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Badge */}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isActive 
                        ? 'bg-[#035443] text-white' 
                        : isCanvas 
                          ? 'bg-[#CC8B65]/15 text-[#965A37] dark:bg-[#CC8B65]/20 dark:text-[#E7C3AC]' 
                          : 'bg-[#E3DCD2]/70 dark:bg-[#251D20] text-[#013328] dark:text-[#D5CBBF]'
                    }`}>
                      {isCanvas ? 'Canvas' : 'Doc'}
                    </span>

                    {/* Delete button (hover) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDoc(doc._id);
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                        isActive ? 'hover:bg-[#035443] text-white' : 'hover:bg-[#E3DCD2] dark:hover:bg-[#251D20] text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Workspace Footer Info */}
        <div className="p-3 border-t border-[#E3DCD2]/80 dark:border-[#261E20]/80 bg-white/50 dark:bg-[#151011]/50">
          <div className="flex items-center justify-between text-[11px] text-[#786B65] dark:text-[#8C7E77]">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#CC8B65]" />
              <span className="font-semibold text-[#100C0D] dark:text-[#E3DCD2]">SyncSpace v1.0</span>
            </span>
            <span className="text-[10px] bg-[#E3DCD2]/50 dark:bg-[#20191B] text-[#013328] dark:text-[#A0938A] px-1.5 py-0.5 rounded font-mono">
              MERN + Sockets
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

