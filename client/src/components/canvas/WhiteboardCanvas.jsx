import React, { useState, useEffect, useRef } from 'react';
import { 
  StickyNote, 
  Square, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Palette
} from 'lucide-react';

const STICKY_COLORS = [
  { name: 'Cream', bg: '#FAF4EB', border: '#E3DCD2' },
  { name: 'Terracotta', bg: '#F4E4D9', border: '#CC8B65' },
  { name: 'Sage Forest', bg: '#DDECE8', border: '#8FBDB1' },
  { name: 'Warm Amber', bg: '#FEF3C7', border: '#FDE68A' },
  { name: 'Soft Sandal', bg: '#EDE5DC', border: '#D5CBBF' }
];

export const WhiteboardCanvas = ({ document, socket, isConnected, onContentChange }) => {
  const [elements, setElements] = useState(document?.content?.elements || [
    {
      id: 'note-1',
      type: 'sticky',
      x: 120,
      y: 100,
      width: 220,
      height: 180,
      color: '#F4E4D9',
      text: '💡 Sprint Goals:\n1. Real-time Cursors\n2. MERN Backend\n3. Workshop Demo'
    },
    {
      id: 'note-2',
      type: 'sticky',
      x: 380,
      y: 100,
      width: 220,
      height: 180,
      color: '#DDECE8',
      text: '🎨 Miro Whiteboard:\n- Drag sticky notes\n- Real-time sync\n- Color switcher'
    }
  ]);

  const [zoom, setZoom] = useState(1);
  const [selectedColor, setSelectedColor] = useState(STICKY_COLORS[0].bg);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  // Sync elements when document prop loads
  useEffect(() => {
    if (document?.content?.elements) {
      setElements(document.content.elements);
    }
  }, [document?._id]);

  // Listen for remote canvas edits
  useEffect(() => {
    if (!socket) return;

    const handleRemoteCanvasChange = ({ content, senderId }) => {
      if (senderId === socket.id) return;
      if (content?.elements) {
        setElements(content.elements);
      }
    };

    socket.on('canvas:element-change', handleRemoteCanvasChange);

    return () => {
      socket.off('canvas:element-change', handleRemoteCanvasChange);
    };
  }, [socket]);

  const broadcastChanges = (newElements) => {
    setElements(newElements);
    const content = { elements: newElements };
    if (onContentChange) onContentChange(content);
    if (socket && isConnected) {
      socket.emit('canvas:element-change', {
        documentId: document._id,
        content,
        senderId: socket.id
      });
    }
  };

  const handleAddSticky = () => {
    const newElement = {
      id: 'sticky-' + Math.random().toString(36).substr(2, 9),
      type: 'sticky',
      x: Math.round(150 + Math.random() * 200),
      y: Math.round(100 + Math.random() * 150),
      width: 220,
      height: 180,
      color: selectedColor,
      text: 'New thought...'
    };
    broadcastChanges([...elements, newElement]);
  };

  const handleAddCard = () => {
    const newCard = {
      id: 'card-' + Math.random().toString(36).substr(2, 9),
      type: 'card',
      x: Math.round(200 + Math.random() * 200),
      y: Math.round(150 + Math.random() * 150),
      width: 260,
      height: 140,
      color: '#ffffff',
      text: 'Feature Card\nStatus: In Progress'
    };
    broadcastChanges([...elements, newCard]);
  };

  const handleTextChange = (id, text) => {
    const newElements = elements.map(el => el.id === id ? { ...el, text } : el);
    broadcastChanges(newElements);
  };

  const handleDeleteElement = (id, e) => {
    e.stopPropagation();
    const newElements = elements.filter(el => el.id !== id);
    broadcastChanges(newElements);
  };

  const handleColorChange = (id, color, e) => {
    e.stopPropagation();
    const newElements = elements.map(el => el.id === id ? { ...el, color } : el);
    broadcastChanges(newElements);
  };

  // Dragging logic
  const handleMouseDown = (id, e) => {
    // Only drag when clicking the top header handle of the sticky
    if (e.target.tagName.toLowerCase() === 'textarea' || e.target.tagName.toLowerCase() === 'button') {
      return;
    }
    const element = elements.find(el => el.id === id);
    if (!element) return;

    setDraggingId(id);
    setDragOffset({
      x: e.clientX / zoom - element.x,
      y: e.clientY / zoom - element.y
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId) return;

    const newX = Math.round(e.clientX / zoom - dragOffset.x);
    const newY = Math.round(e.clientY / zoom - dragOffset.y);

    const newElements = elements.map(el => {
      if (el.id === draggingId) {
        return { ...el, x: newX, y: newY };
      }
      return el;
    });

    broadcastChanges(newElements);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div 
      className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#F8F6F2] dark:bg-[#100C0D] select-none transition-colors"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={canvasRef}
    >
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 text-[#D5CBBF] dark:text-[#2E2325]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1.5px, transparent 1.5px)',
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`
        }}
      />

      {/* Floating Canvas Toolbar */}
      <div className="absolute top-6 left-6 z-40 flex items-center space-x-2 bg-white/95 dark:bg-[#1C1618]/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-[#E3DCD2] dark:border-[#2E2325] transition-colors">
        <button
          onClick={handleAddSticky}
          className="flex items-center space-x-1.5 px-3 py-2 bg-[#CC8B65]/20 hover:bg-[#CC8B65]/30 text-[#965A37] dark:text-[#E7C3AC] rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <StickyNote className="w-4 h-4" />
          <span>Sticky Note</span>
        </button>

        <button
          onClick={handleAddCard}
          className="flex items-center space-x-1.5 px-3 py-2 bg-[#013328]/10 hover:bg-[#013328]/20 dark:bg-[#013328]/30 dark:hover:bg-[#013328]/50 text-[#013328] dark:text-[#8FBDB1] rounded-xl text-xs font-bold transition-all"
        >
          <Square className="w-4 h-4" />
          <span>Card</span>
        </button>

        <div className="h-5 w-px bg-[#E3DCD2] dark:bg-[#2E2325] mx-1" />

        {/* Color Picker for next sticky */}
        <div className="flex items-center space-x-1.5 px-1">
          {STICKY_COLORS.map(c => (
            <button
              key={c.name}
              onClick={() => setSelectedColor(c.bg)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                selectedColor === c.bg ? 'scale-125 border-[#CC8B65] shadow-sm' : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: c.bg }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center space-x-1.5 bg-white/95 dark:bg-[#1C1618]/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-[#E3DCD2] dark:border-[#2E2325] transition-colors">
        <button
          onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
          className="p-2 hover:bg-[#E3DCD2]/40 dark:hover:bg-[#251D20] text-[#786B65] dark:text-[#8C7E77] hover:text-[#CC8B65] rounded-xl transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-[#100C0D] dark:text-[#E3DCD2] w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
          className="p-2 hover:bg-[#E3DCD2]/40 dark:hover:bg-[#251D20] text-[#786B65] dark:text-[#8C7E77] hover:text-[#CC8B65] rounded-xl transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-2 hover:bg-[#E3DCD2]/40 dark:hover:bg-[#251D20] text-[#786B65] dark:text-[#8C7E77] hover:text-[#CC8B65] rounded-xl transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas Elements Workspace */}
      <div
        className="w-full h-full transform-gpu origin-top-left transition-transform duration-75"
        style={{ transform: `scale(${zoom})` }}
      >
        {elements.map(el => (
          <div
            key={el.id}
            onMouseDown={(e) => handleMouseDown(el.id, e)}
            className={`absolute rounded-2xl shadow-lg border transition-shadow cursor-grab active:cursor-grabbing p-4 flex flex-col justify-between ${
              draggingId === el.id ? 'shadow-2xl ring-2 ring-[#CC8B65] z-30' : 'z-10'
            }`}
            style={{
              left: `${el.x}px`,
              top: `${el.y}px`,
              width: `${el.width || 220}px`,
              height: `${el.height || 180}px`,
              backgroundColor: el.color || '#fef08a',
              borderColor: 'rgba(0,0,0,0.08)'
            }}
          >
            {/* Header Handle & Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <div className="flex items-center space-x-1">
                {STICKY_COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={(e) => handleColorChange(el.id, c.bg, e)}
                    className="w-3 h-3 rounded-full hover:scale-125 transition-transform"
                    style={{ backgroundColor: c.bg, border: '1px solid rgba(0,0,0,0.1)' }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={(e) => handleDeleteElement(el.id, e)}
                className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-black/5 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Editable Content */}
            <textarea
              value={el.text || ''}
              onChange={(e) => handleTextChange(el.id, e.target.value)}
              placeholder="Write thoughts here..."
              className="w-full flex-1 mt-2 bg-transparent border-none outline-none resize-none font-medium text-sm text-slate-800 leading-snug cursor-text"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

