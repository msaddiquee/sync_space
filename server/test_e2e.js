const axios = require('axios');
const { io } = require('socket.io-client');
const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

dotenv.config({ path: './.env' });

const connectDB = require('./src/config/db');
const setupSocket = require('./src/sockets/socketHandler');

const runTest = async () => {
  console.log('=== 🚀 STARTING SYNCSPACE END-TO-END VERIFICATION ===');
  
  // 1. Start test server on port 5055
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/syncspace');
  console.log('✔ Connected to MongoDB');

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', require('./src/routes/authRoutes'));
  app.use('/api/workspaces', require('./src/routes/workspaceRoutes'));
  app.use('/api/documents', require('./src/routes/documentRoutes'));
  app.get('/api/health', (req, res) => res.json({ status: 'online' }));

  const testServer = http.createServer(app);
  const testIo = new Server(testServer, { cors: { origin: '*' } });
  setupSocket(testIo);

  await new Promise((resolve) => testServer.listen(5055, resolve));
  console.log('✔ Test HTTP & Socket.io server running on http://localhost:5055');

  const BASE_URL = 'http://localhost:5055/api';

  try {
    // 2. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✔ Health check OK:', health.data);

    // 3. User Registration
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Engineer',
      email: testEmail,
      password: 'password123'
    });
    console.log('✔ User registered successfully. Token generated.');
    const token = regRes.data.token;
    const defaultWorkspaceId = regRes.data.defaultWorkspaceId;
    const starterDocId = regRes.data.starterDocId;

    // 4. Test authenticated request
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✔ Auth me verified:', meRes.data.user.name, `(${meRes.data.user.email})`);

    // 5. Test Workspace listing
    const wsRes = await axios.get(`${BASE_URL}/workspaces`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✔ Workspaces fetched count:', wsRes.data.count);

    // 6. Test Document Creation (Whiteboard Canvas)
    const docRes = await axios.post(`${BASE_URL}/documents`, {
      title: 'Sprint 1 Brainstorm Canvas',
      type: 'CANVAS',
      workspaceId: defaultWorkspaceId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✔ Canvas created with ID:', docRes.data.document._id, 'Type:', docRes.data.document.type);
    const canvasId = docRes.data.document._id;

    // 7. Test Real-time Socket.io multi-client interaction
    console.log('--- Testing Socket.io Real-Time Collaboration ---');
    const client1 = io('http://localhost:5055');
    const client2 = io('http://localhost:5055');

    await Promise.all([
      new Promise(res => client1.on('connect', res)),
      new Promise(res => client2.on('connect', res))
    ]);
    console.log('✔ Both Socket.io test clients connected.');

    // Join room
    client1.emit('room:join', {
      documentId: canvasId,
      user: { id: regRes.data.user.id, name: 'Client 1 (Alice)', avatarColor: '#3b82f6' }
    });

    client2.emit('room:join', {
      documentId: canvasId,
      user: { id: 'client2_id', name: 'Client 2 (Bob)', avatarColor: '#db2777' }
    });

    // Test cursor tracking broadcast
    const cursorReceivedPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Cursor broadcast timeout')), 3000);
      client2.on('cursor:update', (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    });

    client1.emit('cursor:move', {
      documentId: canvasId,
      position: { x: 350, y: 420 }
    });

    const receivedCursor = await cursorReceivedPromise;
    console.log('✔ Real-time cursor successfully broadcast from Client 1 to Client 2:', receivedCursor.position);

    // Test element change broadcast
    const contentReceivedPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Content broadcast timeout')), 3000);
      client2.on('canvas:element-change', (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    });

    client1.emit('canvas:element-change', {
      documentId: canvasId,
      content: {
        elements: [{ id: 'sticky-test', text: 'Live sync verified!' }]
      },
      senderId: client1.id
    });

    const receivedContent = await contentReceivedPromise;
    console.log('✔ Whiteboard canvas change broadcast received by Client 2:', receivedContent.content.elements[0].text);

    client1.disconnect();
    client2.disconnect();
    console.log('✔ All Socket.io real-time tests passed successfully!');

    console.log('=== 🎉 ALL VERIFICATION TESTS PASSED ===');
  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    testServer.close();
    await mongoose.connection.close();
    process.exit(0);
  }
};

runTest();

