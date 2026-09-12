import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { BlockEditor } from '../components/editor/BlockEditor';
import { WhiteboardCanvas } from '../components/canvas/WhiteboardCanvas';
import { LiveCursors } from '../components/collaborative/LiveCursors';
import { InviteModal } from '../components/modals/InviteModal';
import { NewWorkspaceModal } from '../components/modals/NewWorkspaceModal';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { workspaceService, documentService } from '../services/api';

export const WorkspaceView = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  // Workspaces & Document State
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);

  // Real-time Collaboration State
  const [activeUsers, setActiveUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState([]);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'

  // Modals & UI
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Throttled cursor tracking
  const lastCursorEmitRef = useRef(0);
  const workspaceViewRef = useRef(null);

  // 1. Fetch user's workspaces
  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const res = await workspaceService.getAll();
      if (res.data.success && res.data.workspaces.length > 0) {
        setWorkspaces(res.data.workspaces);
        const active = res.data.workspaces[0];
        setCurrentWorkspace(active);
        loadDocuments(active._id);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    }
  };

  // 2. Fetch documents for selected workspace
  const loadDocuments = async (workspaceId) => {
    try {
      const res = await documentService.getByWorkspace(workspaceId);
      if (res.data.success) {
        setDocuments(res.data.documents);
        if (res.data.documents.length > 0) {
          loadDocumentDetails(res.data.documents[0]._id);
        } else {
          setCurrentDoc(null);
        }
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  // 3. Load full single document details (including blocks or canvas elements)
  const loadDocumentDetails = async (docId) => {
    try {
      const res = await documentService.getById(docId);
      if (res.data.success) {
        setCurrentDoc(res.data.document);
      }
    } catch (err) {
      console.error('Failed to load document details:', err);
    }
  };

  // 4. Socket Room Integration (Join room when doc changes)
  useEffect(() => {
    if (!socket || !currentDoc || !user) return;

    // Clear remote cursors when switching documents
    setRemoteCursors([]);

    // Emit join room
    socket.emit('room:join', {
      documentId: currentDoc._id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor
      }
    });

    // Listen for room presence updates
    const handlePresence = (users) => {
      setActiveUsers(users);
    };

    // Listen for cursor updates from other clients
    const handleCursorUpdate = ({ socketId, user: senderUser, position }) => {
      setRemoteCursors((prev) => {
        const filtered = prev.filter((c) => c.socketId !== socketId);
        return [...filtered, { socketId, user: senderUser, position }];
      });
    };

    // Listen for cursor removal when a client disconnects or leaves
    const handleCursorRemove = ({ socketId }) => {
      setRemoteCursors((prev) => prev.filter((c) => c.socketId !== socketId));
    };

    // Listen for save confirmation
    const handleSaveStatus = () => {
      setSaveStatus('saved');
    };

    socket.on('presence:update', handlePresence);
    socket.on('cursor:update', handleCursorUpdate);
    socket.on('cursor:remove', handleCursorRemove);
    socket.on('doc:save-status', handleSaveStatus);

    return () => {
      socket.emit('room:leave');
      socket.off('presence:update', handlePresence);
      socket.off('cursor:update', handleCursorUpdate);
      socket.off('cursor:remove', handleCursorRemove);
      socket.off('doc:save-status', handleSaveStatus);
    };
  }, [socket, currentDoc?._id, user]);

  // 5. Track and broadcast mouse cursor movements (throttled to ~40ms for high performance)
  const handleMouseMove = (e) => {
    if (!socket || !currentDoc || !isConnected) return;

    const now = Date.now();
    if (now - lastCursorEmitRef.current > 40) {
      lastCursorEmitRef.current = now;

      // Get coordinate relative to main container
      const container = workspaceViewRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      socket.emit('cursor:move', {
        documentId: currentDoc._id,
        position: { x, y }
      });
    }
  };

  // Handlers for documents
  const handleCreateDoc = async (type = 'DOC') => {
    if (!currentWorkspace) return;
    try {
      const res = await documentService.create({
        title: type === 'CANVAS' ? 'New Whiteboard' : 'New Page',
        icon: type === 'CANVAS' ? '🎨' : '📄',
        type,
        workspaceId: currentWorkspace._id
      });
      if (res.data.success) {
        setDocuments([res.data.document, ...documents]);
        setCurrentDoc(res.data.document);
      }
    } catch (err) {
      console.error('Failed to create document:', err);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentService.delete(docId);
      const remaining = documents.filter((d) => d._id !== docId);
      setDocuments(remaining);
      if (currentDoc?._id === docId) {
        if (remaining.length > 0) {
          loadDocumentDetails(remaining[0]._id);
        } else {
          setCurrentDoc(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleTitleChange = (newTitle) => {
    if (!currentDoc) return;
    setCurrentDoc({ ...currentDoc, title: newTitle });
    setSaveStatus('saving');

    // Debounced title update
    documentService.update(currentDoc._id, { title: newTitle })
      .then(() => {
        setDocuments(docs => docs.map(d => d._id === currentDoc._id ? { ...d, title: newTitle } : d));
        setSaveStatus('saved');
      })
      .catch(err => console.error('Failed to update title:', err));
  };

  const handleContentChange = () => {
    setSaveStatus('saving');
  };

  const handleSwitchWorkspace = (workspaceId) => {
    const ws = workspaces.find((w) => w._id === workspaceId);
    if (ws) {
      setCurrentWorkspace(ws);
      loadDocuments(ws._id);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F6F2] dark:bg-[#100C0D] text-[#100C0D] dark:text-[#E3DCD2] transition-colors">
      {/* Left Sidebar */}
      <Sidebar
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        documents={documents}
        currentDocId={currentDoc?._id}
        onSelectDoc={loadDocumentDetails}
        onCreateDoc={handleCreateDoc}
        onDeleteDoc={handleDeleteDoc}
        onSwitchWorkspace={handleSwitchWorkspace}
        onOpenNewWorkspaceModal={() => setIsNewWorkspaceModalOpen(true)}
        isOpen={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div 
        ref={workspaceViewRef}
        onMouseMove={handleMouseMove}
        className="relative flex-1 flex flex-col h-full overflow-hidden bg-[#F8F6F2] dark:bg-[#100C0D]"
      >
        {/* Top Navbar */}
        <Navbar
          currentDoc={currentDoc}
          workspace={currentWorkspace}
          activeUsers={activeUsers}
          saveStatus={saveStatus}
          isSocketConnected={isConnected}
          onTitleChange={handleTitleChange}
          onOpenInvite={() => setIsInviteModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        />

        {/* Real-time Multiplayer Cursors Layer */}
        <LiveCursors cursors={remoteCursors} />

        {/* Editor or Canvas Viewport */}
        <main className="flex-1 overflow-y-auto relative bg-[#F8F6F2] dark:bg-[#100C0D]">
          {currentDoc ? (
            currentDoc.type === 'CANVAS' ? (
              <WhiteboardCanvas
                document={currentDoc}
                socket={socket}
                isConnected={isConnected}
                onContentChange={handleContentChange}
              />
            ) : (
              <BlockEditor
                document={currentDoc}
                socket={socket}
                isConnected={isConnected}
                onContentChange={handleContentChange}
              />
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#F8F6F2] dark:bg-[#100C0D]">
              <div className="w-16 h-16 rounded-2xl bg-[#013328]/10 dark:bg-[#013328]/30 text-[#013328] dark:text-[#8FBDB1] flex items-center justify-center text-3xl mb-4 border border-[#013328]/20 dark:border-[#013328]/40">
                ✨
              </div>
              <h3 className="text-xl font-bold text-[#100C0D] dark:text-[#E3DCD2]">No document selected</h3>
              <p className="text-sm text-[#786B65] dark:text-[#8C7E77] max-w-sm mt-1 mb-6">
                Create a new Notion-style page or Miro whiteboard to start collaborating.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleCreateDoc('DOC')}
                  className="px-4 py-2 bg-[#013328] hover:bg-[#024B3B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  Create Document
                </button>
                <button
                  onClick={() => handleCreateDoc('CANVAS')}
                  className="px-4 py-2 bg-[#CC8B65] hover:bg-[#B8744C] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  Create Whiteboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspace={currentWorkspace}
      />

      <NewWorkspaceModal
        isOpen={isNewWorkspaceModalOpen}
        onClose={() => setIsNewWorkspaceModalOpen(false)}
        onWorkspaceCreated={(newWs) => {
          setWorkspaces([...workspaces, newWs]);
          setCurrentWorkspace(newWs);
          loadDocuments(newWs._id);
        }}
      />
    </div>
  );
};

