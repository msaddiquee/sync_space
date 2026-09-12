# 🚀 SyncSpace — Real-Time Collaborative Workspace

> **Built with the MERN Stack (MongoDB, Express.js, React, Node.js) + Socket.io & Tailwind CSS**

**SyncSpace** combines the best of **Notion** (structured, block-based rich text documentation) and **Miro** (infinite visual whiteboards with draggable sticky notes) into a unified workspace featuring **multiplayer collaboration**: live cursors, active presence avatars, and instant synchronized updates.

---

## ✨ Features

### 1. 👥 Real-Time Multiplayer Collaboration
* **Live Cursors:** View your teammates' mouse pointers moving in real time with distinct name tags and color codes.
* **Presence Avatars:** Live avatar stack in the top navbar showing all collaborators currently viewing or editing the document.
* **Instant Synchronized Updates:** Edits to text blocks or sticky note positions broadcast instantly over WebSockets.
* **Auto-Save:** Changes are debounced and automatically persisted to MongoDB with real-time cloud save indicators.

### 2. 📝 Notion-Style Block Editor
* **Block Types:**
  * Headings (`H1`, `H2`, `H3`)
  * Body Text / Paragraphs
  * Interactive To-Do lists with checkboxes
  * Dark syntax Code Blocks
  * Quote / Callout blocks
* **Block Controls:** Hover menus to add blocks, change block types, or delete blocks.

### 3. 🎨 Miro-Style Visual Whiteboard
* **Interactive Canvas:** Grid background with customizable zoom ($50\% - 150\%$) and reset controls.
* **Sticky Notes:** Add colorful sticky notes (Yellow, Blue, Green, Pink, Purple) with editable text.
* **Spatial Drag & Drop:** Drag notes anywhere on the canvas; other connected collaborators see them move live.
* **Feature Cards:** Add project feature cards for sprint planning.

### 4. 🏢 Multi-Tenant Workspaces & Sharing
* **Workspaces:** Create isolated workspaces or switch between existing spaces.
* **Invite Codes:** Generate 8-character invite codes to invite team members with role access (`OWNER`, `EDITOR`).

---

## 🛠️ Tech Stack & Architecture

```
Client (React + Vite + Tailwind CSS + Socket.io Client)
   │
   ├─► HTTP / REST (Port 5000) ──► Express.js + Mongoose ──► MongoDB (Database)
   │
   └─► WebSocket (Port 5000)  ──► Socket.io Server ───────► Room In-Memory State
                                                               │ (Debounced Save)
                                                               ▼
                                                            MongoDB
```

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React icons, Socket.io-client, Axios.
* **Backend:** Node.js, Express.js, Socket.io, Mongoose (MongoDB ODM), JWT, bcryptjs.
* **Database:** MongoDB (`mongodb://localhost:27017/syncspace` or MongoDB Atlas).

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18+)
* **MongoDB** (running locally on port 27017 or MongoDB Atlas connection URI)

### 1. Install Dependencies

Install root, server, and client packages:
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

The server includes a pre-configured `.env` file (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/syncspace
JWT_SECRET=supersecretjwtkey_syncspace_development_2026
CLIENT_URL=http://localhost:5173
```

*(Optional: Replace `MONGO_URI` with your MongoDB Atlas connection string if running in cloud).*

### 3. Run the Application

Open two terminal tabs:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

---

## 🧪 Testing Real-Time Collaboration (Demo Walkthrough)

To experience the real-time multiplayer features:
1. Open **Tab 1** in your browser at `http://localhost:5173` and create an account (e.g. *Alice*).
2. Click **Share** in the top navbar and copy the workspace **Invite Code**.
3. Open **Tab 2** in an **Incognito Window** or another browser at `http://localhost:5173`.
4. Create a second account (e.g. *Bob*).
5. Click the Workspace dropdown in the sidebar $\rightarrow$ **New Workspace / Join** $\rightarrow$ **Join with Code**, paste the code, and join.
6. Open the same Document or Whiteboard in both tabs:
   * Notice both avatars appear in the top right **Presence Bar**.
   * Move your mouse in Tab 1; watch the colored cursor with *Alice*'s name glide across Tab 2!
   * Drag a sticky note or type a block in Tab 1; observe instant real-time synchronization in Tab 2!

---

## 📁 Repository Structure

```
.
├── client/                     # React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── canvas/         # Miro Whiteboard canvas & sticky notes
│   │   │   ├── collaborative/  # LiveCursors & PresenceBar
│   │   │   ├── editor/         # Notion block-based rich text editor
│   │   │   ├── layout/         # Navbar, Sidebar
│   │   │   └── modals/         # InviteModal, NewWorkspaceModal
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/              # AuthPage, WorkspaceView
│   │   ├── services/           # api.js (Axios REST client)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Node.js + Express + Socket.io Backend
│   ├── src/
│   │   ├── config/             # db.js (MongoDB connection)
│   │   ├── controllers/        # auth, workspace, document controllers
│   │   ├── middleware/         # auth.js (JWT protect)
│   │   ├── models/             # User, Workspace, Document schemas
│   │   ├── routes/             # REST endpoints
│   │   ├── sockets/            # socketHandler.js (real-time engine)
│   │   └── server.js           # Server bootstrap
│   ├── package.json
│   ├── test_e2e.js             # Automated E2E verification test
│   └── .env
├── PROJECT_DOCUMENTATION.md    # Complete architectural spec
├── package.json                # Monorepo root scripts
└── README.md                   # Project documentation & guide
```

