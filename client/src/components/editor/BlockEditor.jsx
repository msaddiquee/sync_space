import React, { useState, useEffect, useRef } from 'react';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Type, 
  CheckSquare, 
  Code, 
  Quote, 
  Plus, 
  Trash2, 
  GripVertical,
  Check
} from 'lucide-react';

const BLOCK_TYPES = [
  { id: 'paragraph', label: 'Text', icon: Type, placeholder: "Type '/' for commands..." },
  { id: 'h1', label: 'Heading 1', icon: Heading1, placeholder: 'Heading 1' },
  { id: 'h2', label: 'Heading 2', icon: Heading2, placeholder: 'Heading 2' },
  { id: 'h3', label: 'Heading 3', icon: Heading3, placeholder: 'Heading 3' },
  { id: 'todo', label: 'To-do List', icon: CheckSquare, placeholder: 'To-do item' },
  { id: 'code', label: 'Code Block', icon: Code, placeholder: 'console.log("Hello, World!");' },
  { id: 'quote', label: 'Quote', icon: Quote, placeholder: 'Inspiring quote or note...' },
];

export const BlockEditor = ({ document, socket, isConnected, onContentChange }) => {
  const [blocks, setBlocks] = useState(document?.content?.blocks || [
    { id: 'b-init-1', type: 'h1', text: document?.title || 'Welcome' },
    { id: 'b-init-2', type: 'paragraph', text: 'Start writing or press "/" to insert blocks...' }
  ]);
  const [activeMenuBlockId, setActiveMenuBlockId] = useState(null);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  // Initialize or update blocks when document prop changes
  useEffect(() => {
    if (document?.content?.blocks) {
      setBlocks(document.content.blocks);
    }
  }, [document?._id]);

  // Listen for live collaborative block updates from other users
  useEffect(() => {
    if (!socket) return;

    const handleRemoteContentChange = ({ content, senderId }) => {
      // Ignore updates initiated by our own socket
      if (senderId === socket.id) return;
      if (content?.blocks) {
        setBlocks(content.blocks);
      }
    };

    socket.on('doc:content-change', handleRemoteContentChange);

    return () => {
      socket.off('doc:content-change', handleRemoteContentChange);
    };
  }, [socket]);

  const broadcastChanges = (newBlocks) => {
    setBlocks(newBlocks);
    const content = { blocks: newBlocks };
    if (onContentChange) onContentChange(content);
    if (socket && isConnected) {
      socket.emit('doc:content-change', {
        documentId: document._id,
        content,
        senderId: socket.id
      });
    }
  };

  const handleTextChange = (id, text) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, text } : b);
    broadcastChanges(newBlocks);
  };

  const handleToggleTodo = (id) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, checked: !b.checked } : b);
    broadcastChanges(newBlocks);
  };

  const handleAddBlock = (afterId, type = 'paragraph') => {
    const newBlock = {
      id: 'b-' + Math.random().toString(36).substr(2, 9),
      type,
      text: '',
      checked: false
    };

    const index = blocks.findIndex(b => b.id === afterId);
    let newBlocks;
    if (index === -1) {
      newBlocks = [...blocks, newBlock];
    } else {
      newBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
    }
    broadcastChanges(newBlocks);
    setActiveMenuBlockId(null);
  };

  const handleDeleteBlock = (id) => {
    if (blocks.length <= 1) return; // Keep at least one block
    const newBlocks = blocks.filter(b => b.id !== id);
    broadcastChanges(newBlocks);
  };

  const handleChangeType = (id, newType) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, type: newType } : b);
    broadcastChanges(newBlocks);
    setActiveMenuBlockId(null);
  };

  const handleKeyDown = (e, block, index) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddBlock(block.id, block.type === 'todo' ? 'todo' : 'paragraph');
    } else if (e.key === 'Backspace' && block.text === '' && blocks.length > 1) {
      e.preventDefault();
      handleDeleteBlock(block.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 sm:px-12 text-[#100C0D] dark:text-[#E3DCD2] transition-colors">
      <div className="space-y-2">
        {blocks.map((block, index) => {
          const isMenuOpen = activeMenuBlockId === block.id;

          return (
            <div
              key={block.id}
              className="group relative flex items-start -ml-10 pl-10 rounded-lg hover:bg-[#E3DCD2]/30 dark:hover:bg-[#1A1416] transition-colors py-1"
            >
              {/* Left Hover Controls (Drag Handle / Change Block / Delete) */}
              <div className="absolute left-0 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 text-[#786B65] dark:text-[#8C7E77]">
                <button
                  type="button"
                  title="Add block below"
                  onClick={() => handleAddBlock(block.id)}
                  className="p-1 hover:text-[#CC8B65] dark:hover:text-[#DCA281] hover:bg-[#CC8B65]/10 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    title="Change block type"
                    onClick={() => setActiveMenuBlockId(isMenuOpen ? null : block.id)}
                    className="p-1 hover:text-[#100C0D] dark:hover:text-[#E3DCD2] hover:bg-[#E3DCD2]/40 dark:hover:bg-[#1F181A] rounded transition-colors"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Block Type Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-[#1C1618] rounded-xl shadow-xl border border-[#E3DCD2] dark:border-[#2E2325] py-1.5 z-40 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1 text-[11px] font-bold text-[#786B65] dark:text-[#8C7E77] uppercase tracking-wider">
                        Turn into
                      </div>
                      {BLOCK_TYPES.map(bt => {
                        const Icon = bt.icon;
                        return (
                          <button
                            key={bt.id}
                            onClick={() => handleChangeType(block.id, bt.id)}
                            className="w-full px-3 py-1.5 text-xs text-left text-[#100C0D] dark:text-[#E3DCD2] hover:bg-[#CC8B65]/10 hover:text-[#CC8B65] dark:hover:text-[#DCA281] flex items-center space-x-2 transition-colors"
                          >
                            <Icon className="w-4 h-4 text-[#786B65] dark:text-[#8C7E77] group-hover:text-[#CC8B65]" />
                            <span>{bt.label}</span>
                          </button>
                        );
                      })}
                      <div className="border-t border-[#E3DCD2] dark:border-[#2E2325] my-1"></div>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="w-full px-3 py-1.5 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        <span>Delete Block</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Block Content Rendering */}
              <div className="w-full">
                {block.type === 'h1' && (
                  <input
                    type="text"
                    value={block.text}
                    onChange={(e) => handleTextChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, block, index)}
                    placeholder="Heading 1"
                    className="w-full font-extrabold text-3xl sm:text-4xl text-[#100C0D] dark:text-[#E3DCD2] bg-transparent border-none outline-none placeholder-[#A0938A] tracking-tight"
                  />
                )}

                {block.type === 'h2' && (
                  <input
                    type="text"
                    value={block.text}
                    onChange={(e) => handleTextChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, block, index)}
                    placeholder="Heading 2"
                    className="w-full font-bold text-2xl text-[#013328] dark:text-[#E3DCD2] bg-transparent border-none outline-none placeholder-[#A0938A] mt-2"
                  />
                )}

                {block.type === 'h3' && (
                  <input
                    type="text"
                    value={block.text}
                    onChange={(e) => handleTextChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, block, index)}
                    placeholder="Heading 3"
                    className="w-full font-semibold text-xl text-[#013328] dark:text-[#D5CBBF] bg-transparent border-none outline-none placeholder-[#A0938A] mt-1"
                  />
                )}

                {block.type === 'paragraph' && (
                  <textarea
                    rows={1}
                    value={block.text}
                    onChange={(e) => {
                      handleTextChange(block.id, e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => handleKeyDown(e, block, index)}
                    placeholder="Type '/' for commands or write your notes..."
                    className="w-full resize-none text-base text-[#2E2527] dark:text-[#D5CBBF] leading-relaxed bg-transparent border-none outline-none placeholder-[#A0938A]"
                  />
                )}

                {block.type === 'todo' && (
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(block.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        block.checked
                          ? 'bg-[#013328] dark:bg-[#CC8B65] border-[#013328] dark:border-[#CC8B65] text-white'
                          : 'border-[#D5CBBF] dark:border-[#3D3033] hover:border-[#CC8B65] bg-white dark:bg-[#1E1719]'
                      }`}
                    >
                      {block.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <input
                      type="text"
                      value={block.text}
                      onChange={(e) => handleTextChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, block, index)}
                      placeholder="To-do task..."
                      className={`w-full text-base bg-transparent border-none outline-none placeholder-[#A0938A] ${
                        block.checked ? 'line-through text-[#786B65] dark:text-[#8C7E77]' : 'text-[#2E2527] dark:text-[#D5CBBF]'
                      }`}
                    />
                  </div>
                )}

                {block.type === 'code' && (
                  <div className="bg-[#100C0D] dark:bg-[#0B0809] rounded-xl p-4 my-2 border border-[#2A2022] shadow-inner">
                    <textarea
                      rows={3}
                      value={block.text}
                      onChange={(e) => handleTextChange(block.id, e.target.value)}
                      placeholder="// Write code here..."
                      className="w-full font-mono text-sm text-[#8FBDB1] bg-transparent border-none outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}

                {block.type === 'quote' && (
                  <div className="border-l-4 border-[#CC8B65] pl-4 py-1.5 my-1 bg-[#CC8B65]/10 dark:bg-[#CC8B65]/15 rounded-r-lg">
                    <input
                      type="text"
                      value={block.text}
                      onChange={(e) => handleTextChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, block, index)}
                      placeholder="Enter a quote or important callout..."
                      className="w-full italic text-base text-[#100C0D] dark:text-[#E3DCD2] bg-transparent border-none outline-none placeholder-[#A0938A]"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Plus button at bottom */}
      <button
        onClick={() => handleAddBlock(blocks[blocks.length - 1]?.id || 'init')}
        className="mt-6 flex items-center space-x-2 text-sm text-[#786B65] dark:text-[#8C7E77] hover:text-[#CC8B65] dark:hover:text-[#DCA281] px-3 py-1.5 rounded-lg hover:bg-[#CC8B65]/10 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add a new block</span>
      </button>
    </div>
  );
};

