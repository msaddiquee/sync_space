import React, { useState } from 'react';
import { Plus, X, FolderPlus, KeyRound } from 'lucide-react';
import { workspaceService } from '../../services/api';

export const NewWorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }) => {
  const [tab, setTab] = useState('create'); // 'create' or 'join'
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await workspaceService.create({ name, description });
      if (res.data.success) {
        onWorkspaceCreated(res.data.workspace);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await workspaceService.join(inviteCode.trim());
      if (res.data.success) {
        onWorkspaceCreated(res.data.workspace);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired invite code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#1C1618] rounded-2xl p-6 shadow-2xl border border-[#E3DCD2] dark:border-[#2E2325] animate-in fade-in zoom-in-95 duration-150 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-[#E3DCD2] dark:border-[#2E2325]">
          <h3 className="text-lg font-bold text-[#100C0D] dark:text-[#E3DCD2]">
            {tab === 'create' ? 'Create New Workspace' : 'Join Existing Workspace'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#786B65] hover:text-[#100C0D] dark:hover:text-[#E3DCD2] rounded-lg hover:bg-[#E3DCD2]/40 dark:hover:bg-[#251D20] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[#FAF8F5] dark:bg-[#151011] border border-[#E3DCD2] dark:border-[#261E20] rounded-xl my-4">
          <button
            type="button"
            onClick={() => { setTab('create'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'create' 
                ? 'bg-[#013328] dark:bg-[#CC8B65] text-white shadow-sm' 
                : 'text-[#786B65] dark:text-[#8C7E77] hover:text-[#100C0D] dark:hover:text-[#E3DCD2]'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create New</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('join'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'join' 
                ? 'bg-[#013328] dark:bg-[#CC8B65] text-white shadow-sm' 
                : 'text-[#786B65] dark:text-[#8C7E77] hover:text-[#100C0D] dark:hover:text-[#E3DCD2]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Join with Code</span>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs font-medium text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-800 rounded-xl">
            {error}
          </div>
        )}

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#786B65] dark:text-[#8C7E77] uppercase tracking-wider mb-1.5">
                Workspace Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Squad, CS Project"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#151011] border border-[#E3DCD2] dark:border-[#2E2325] rounded-xl text-sm text-[#100C0D] dark:text-[#E3DCD2] placeholder-[#A0938A] focus:outline-none focus:ring-2 focus:ring-[#CC8B65]/30 focus:border-[#CC8B65] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#786B65] dark:text-[#8C7E77] uppercase tracking-wider mb-1.5">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this space"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#151011] border border-[#E3DCD2] dark:border-[#2E2325] rounded-xl text-sm text-[#100C0D] dark:text-[#E3DCD2] placeholder-[#A0938A] focus:outline-none focus:ring-2 focus:ring-[#CC8B65]/30 focus:border-[#CC8B65] transition-all"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#5A4E4F] dark:text-[#A0938A] hover:bg-[#E3DCD2]/40 dark:hover:bg-[#251D20] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#CC8B65] hover:bg-[#B8744C] rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#786B65] dark:text-[#8C7E77] uppercase tracking-wider mb-1.5">
                Invite Code
              </label>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter 8-digit code (e.g. 7ABC49XZ)"
                className="w-full font-mono uppercase tracking-widest px-3.5 py-2.5 bg-[#FAF8F5] dark:bg-[#151011] border border-[#E3DCD2] dark:border-[#2E2325] rounded-xl text-sm text-[#100C0D] dark:text-[#E3DCD2] placeholder-[#A0938A] focus:outline-none focus:ring-2 focus:ring-[#CC8B65]/30 focus:border-[#CC8B65] transition-all"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#5A4E4F] dark:text-[#A0938A] hover:bg-[#E3DCD2]/40 dark:hover:bg-[#251D20] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#CC8B65] hover:bg-[#B8744C] rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Workspace'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

