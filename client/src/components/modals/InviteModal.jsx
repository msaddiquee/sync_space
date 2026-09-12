import React, { useState } from 'react';
import { Copy, Check, Users, X } from 'lucide-react';

export const InviteModal = ({ isOpen, onClose, workspace }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !workspace) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(workspace.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#1C1618] rounded-2xl p-6 shadow-2xl border border-[#E3DCD2] dark:border-[#2E2325] animate-in fade-in zoom-in-95 duration-150 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-[#E3DCD2] dark:border-[#2E2325]">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#013328]/10 dark:bg-[#013328]/30 text-[#013328] dark:text-[#8FBDB1] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#100C0D] dark:text-[#E3DCD2]">Invite Teammates</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#786B65] hover:text-[#100C0D] dark:hover:text-[#E3DCD2] rounded-lg hover:bg-[#E3DCD2]/40 dark:hover:bg-[#251D20] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-[#5A4E4F] dark:text-[#D5CBBF] leading-relaxed">
            Share this invite code with your squad. Anyone with this code can join <strong className="text-[#100C0D] dark:text-[#E3DCD2]">{workspace.name}</strong> and collaborate in real-time.
          </p>

          <div className="flex items-center justify-between p-3 bg-[#FAF8F5] dark:bg-[#151011] border border-[#E3DCD2] dark:border-[#2E2325] rounded-xl">
            <span className="font-mono text-lg font-bold tracking-widest text-[#CC8B65]">
              {workspace.inviteCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#CC8B65] hover:bg-[#B8744C] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-semibold text-[#786B65] dark:text-[#8C7E77] uppercase tracking-wider mb-2">
              Current Members ({workspace.members?.length || 1})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {workspace.members?.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[#E3DCD2]/30 dark:bg-[#251D20]/50">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                      style={{ backgroundColor: m.user?.avatarColor || '#013328' }}
                    >
                      {(m.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-[#100C0D] dark:text-[#E3DCD2]">{m.user?.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#E3DCD2] dark:bg-[#2E2325] text-[#013328] dark:text-[#E3DCD2]">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E3DCD2] dark:border-[#2E2325] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#5A4E4F] dark:text-[#A0938A] hover:bg-[#E3DCD2]/40 dark:hover:bg-[#251D20] rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

