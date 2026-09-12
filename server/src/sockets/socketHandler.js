const Document = require('../models/Document');

// In-memory room manager for active documents
// Structure:
// roomId -> {
//    users: Map(socketId -> { userId, name, email, avatarColor, cursor: { x, y } }),
//    saveTimeout: NodeJS.Timeout | null,
//    latestContent: Object | null
// }
const rooms = new Map();

const getRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      saveTimeout: null,
      latestContent: null
    });
  }
  return rooms.get(roomId);
};

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    let currentRoomId = null;
    let currentUser = null;

    // 1. Join Document / Canvas Room
    socket.on('room:join', async ({ documentId, user }) => {
      if (!documentId || !user) return;

      currentRoomId = documentId;
      currentUser = {
        socketId: socket.id,
        userId: user.id || user._id,
        name: user.name || 'Anonymous',
        email: user.email,
        avatarColor: user.avatarColor || '#3b82f6',
        cursor: null
      };

      socket.join(documentId);
      const room = getRoom(documentId);
      room.users.set(socket.id, currentUser);

      console.log(`[Socket] User "${currentUser.name}" joined room: ${documentId} (Active: ${room.users.size})`);

      // Broadcast current user list to all in room
      const activeUsers = Array.from(room.users.values());
      io.to(documentId).emit('presence:update', activeUsers);
    });

    // 2. Multi-user Live Cursor Tracking
    socket.on('cursor:move', ({ documentId, position }) => {
      if (!documentId || !currentUser) return;
      
      currentUser.cursor = position;
      const room = getRoom(documentId);
      room.users.set(socket.id, currentUser);

      // Broadcast to other collaborators in room (exclude sender)
      socket.to(documentId).emit('cursor:update', {
        socketId: socket.id,
        user: currentUser,
        position
      });
    });

    // 3. Document Block Edits (Notion style)
    socket.on('doc:content-change', ({ documentId, content, senderId }) => {
      if (!documentId) return;

      // Broadcast immediately to everyone else
      socket.to(documentId).emit('doc:content-change', {
        content,
        senderId: senderId || socket.id
      });

      // Debounced persistence to MongoDB (save after 1.2s of inactivity)
      const room = getRoom(documentId);
      room.latestContent = content;

      if (room.saveTimeout) {
        clearTimeout(room.saveTimeout);
      }

      room.saveTimeout = setTimeout(async () => {
        try {
          if (room.latestContent) {
            await Document.findByIdAndUpdate(documentId, {
              content: room.latestContent,
              lastEditedBy: currentUser ? currentUser.userId : null
            });
            // Notify clients that document has been persisted
            io.to(documentId).emit('doc:save-status', { status: 'saved', timestamp: new Date() });
          }
        } catch (err) {
          console.error(`[Socket Save Error] Failed to persist doc ${documentId}:`, err.message);
        }
      }, 1200);
    });

    // 4. Whiteboard Canvas Element Edits (Miro style)
    socket.on('canvas:element-change', ({ documentId, content, senderId }) => {
      if (!documentId) return;

      // Broadcast immediately to others
      socket.to(documentId).emit('canvas:element-change', {
        content,
        senderId: senderId || socket.id
      });

      // Debounced persistence
      const room = getRoom(documentId);
      room.latestContent = content;

      if (room.saveTimeout) {
        clearTimeout(room.saveTimeout);
      }

      room.saveTimeout = setTimeout(async () => {
        try {
          if (room.latestContent) {
            await Document.findByIdAndUpdate(documentId, {
              content: room.latestContent,
              lastEditedBy: currentUser ? currentUser.userId : null
            });
            io.to(documentId).emit('doc:save-status', { status: 'saved', timestamp: new Date() });
          }
        } catch (err) {
          console.error(`[Socket Save Error] Failed to persist canvas ${documentId}:`, err.message);
        }
      }, 1200);
    });

    // 5. Explicit Leave / Disconnect
    const handleLeave = () => {
      if (currentRoomId && rooms.has(currentRoomId)) {
        const room = rooms.get(currentRoomId);
        room.users.delete(socket.id);

        console.log(`[Socket] User left room: ${currentRoomId} (Remaining: ${room.users.size})`);

        // Inform other clients that cursor is gone
        socket.to(currentRoomId).emit('cursor:remove', { socketId: socket.id });

        if (room.users.size === 0) {
          // Flush pending save immediately if room is now empty
          if (room.saveTimeout && room.latestContent) {
            clearTimeout(room.saveTimeout);
            Document.findByIdAndUpdate(currentRoomId, {
              content: room.latestContent,
              lastEditedBy: currentUser ? currentUser.userId : null
            }).catch((err) => console.error('[Socket Flush Error]', err.message));
          }
          rooms.delete(currentRoomId);
        } else {
          // Broadcast updated presence list
          io.to(currentRoomId).emit('presence:update', Array.from(room.users.values()));
        }
      }
    };

    socket.on('room:leave', handleLeave);
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      handleLeave();
    });
  });
};

module.exports = setupSocket;

