const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const setupSocket = require('./sockets/socketHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Cross-Origin Resource Sharing
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'SyncSpace Real-Time API'
  });
});

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] SyncSpace backend listening on port ${PORT}`);
  console.log(`[Server] Client Origin allowed: ${CLIENT_URL}`);
});

