# Project Documentation: SyncSpace (Real-Time Collaborative Workspace)

> **Project Title:** SyncSpace  
> **Type:** Full-Stack Web Application (Real-Time Collaborative Workspace)  
> **Target Audience:** Remote teams, students, and project squads who need seamless document editing and visual brainstorming in one place.

---

## 1. Executive Summary & Value Proposition

**SyncSpace** is an all-in-one collaborative workspace inspired by Notion and Miro. It bridges the gap between structured documentation and freeform visual brainstorming by providing:
1. **Block-Based Rich Text Documents** (Notion-style page trees with markdown support, to-do lists, and headings).
2. **Interactive Visual Canvas / Whiteboard** (sticky notes, shapes, drawing tools, and cards).
3. **Multiplayer Collaboration Engine** (live multi-user cursors, real-time sync, and online presence).

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Next.js / React)                 │
│  - Rich Text Editor (TipTap / BlockNote / Slate)            │
│  - Canvas Engine (HTML5 Canvas / Konva / Excalidraw-core)   │
│  - Real-time Client (Yjs / Socket.io / Supabase Realtime)   │
└──────────────┬───────────────────────────────┬──────────────┘
               │ HTTP / REST                   │ WebSockets (WSS)
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│       API Web Server         │ │    Real-Time / Sync Server  │
│  - Next.js Server Actions    │ │  - Node.js + Socket.io /    │
│    or Express.js / Fastify   │ │    Hocuspocus (Yjs backend) │
│  - Auth & Permission Checks  │ │  - Live presence / cursors  │
│  - File uploads / Webhooks   │ │  - In-memory room management│
└──────────────┬───────────────┘ └──────────────┬──────────────┘
               │                                │
               │                                ▼
               │                     ┌────────────────────────┐
               │                     │ Redis (Pub/Sub & Cache)│
               │                     │ - Ephemeral cursors    │
               │                     │ - Room state / scaling │
               │                     └──────────┬─────────────┘
               ▼                                │ Debounced Persistence
┌───────────────────────────────────────────────▼─────────────┐
│                Database (PostgreSQL / Supabase)             │
│  - Users, Workspaces, Members, Roles                        │
│  - Documents, Canvas Boards, Snapshot JSON                  │
│  - Comments & Activity Logs                                 │
└─────────────────────────────────────────────────────────────┘
```

### Recommended Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14+ (App Router)** or **Vite + React** | SSR for public pages, client-side reactivity for the canvas/editor. |
| **Styling & Components** | **Tailwind CSS + shadcn/ui** | Rapid UI development, accessible dialogs, popovers, and menus. |
| **State & Collaboration** | **Yjs** + **Socket.io** (or **Hocuspocus**) | Battle-tested Conflict-free Replicated Data Types (CRDT) for conflict-free multi-user editing. |
| **Rich Text Engine** | **TipTap** or **BlockNote** | Built-in Yjs support, modular block architecture. |
| **Whiteboard / Canvas** | **React Konva** or **Tldraw SDK** / **Fabric.js** | High-performance interactive 2D canvas with panning and zooming. |
| **Backend & APIs** | **Node.js (Express/Fastify)** or **Next.js Route Handlers** | High-throughput async handling and clean TypeScript sharing. |
| **Database & ORM** | **PostgreSQL** + **Prisma ORM** or **Drizzle** | Strong relational integrity for permissions, workspaces, and versioning. |
| **Caching & Presence** | **Redis (Upstash or local Redis)** | Ephemeral presence data (mouse positions) without hammering the relational DB. |
| **Authentication** | **NextAuth.js (Auth.js)**, **Clerk**, or **Supabase Auth** | Session management, OAuth (Google/GitHub), JWT verification. |

---

## 3. Core Features & Scope

### Phase 1: Authentication & Workspace Structure (MVP)
* **User Accounts:** Sign up / Login via Email & Google OAuth.
* **Workspaces:**
  * Users can create workspaces (e.g., "Engineering Team", "Personal Notes").
  * Workspace invitations via email or shareable invite links with role assignment (`OWNER`, `EDITOR`, `VIEWER`).
* **Nested Page Hierarchy:**
  * Sidebar tree navigation allowing unlimited nested documents (`Workspace -> Project -> Task Document`).

### Phase 2: Document & Board Creation
* **Block-Based Editor:**
  * Supports Headings (H1, H2, H3), bullet points, to-do lists with checkboxes, code blocks with syntax highlighting, and callout boxes.
  * Slash commands (`/h1`, `/todo`, `/code`) to insert blocks dynamically.
* **Canvas / Whiteboard View:**
  * Infinite canvas with zoom ($25\% - 200\%$) and pan.
  * Drag-and-drop sticky notes, colored rectangles, text boxes, and connecting arrows.

### Phase 3: Real-Time Multiplayer Experience
* **Multi-User Cursors:** View real-time mouse positions of all active collaborators in a document or canvas, color-coded with their names.
* **Presence Avatars:** Live avatar stack in the top navigation showing who is currently viewing or editing the document.
* **Conflict-Free Synchronization:** Simultaneous edits merge smoothly without overwriting colleagues' text.
* **Auto-Save & Snapshotting:** Document states persist automatically to PostgreSQL after typing stops (debounced by $1.5\text{s}$).

### Phase 4: Polish & Stretch Features
* **Exporting:** Export documents as Markdown, PDF, or canvas snapshot as PNG.
* **Comments & Mentions:** Highlight text or pin comments onto canvas coordinates; tag team members with `@username`.
* **Dark Mode:** Seamless theme toggling with persistent user preference.

---

## 4. Database Schema (Prisma Format)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  OWNER
  ADMIN
  EDITOR
  VIEWER
}

enum DocumentType {
  DOC
  CANVAS
}

model User {
  id            String            @id @default(cuid())
  name          String?
  email         String            @unique
  avatarUrl     String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  
  workspaces    WorkspaceMember[]
  createdDocs   Document[]        @relation("CreatedDocuments")
  comments      Comment[]
}

model Workspace {
  id          String            @id @default(cuid())
  name        String
  slug        String            @unique
  inviteCode  String            @unique @default(uuid())
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  members     WorkspaceMember[]
  documents   Document[]
}

model WorkspaceMember {
  id          String    @id @default(cuid())
  role        Role      @default(EDITOR)
  userId      String
  workspaceId String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
}

model Document {
  id          String        @id @default(cuid())
  title       String        @default("Untitled")
  icon        String?       // Emoji or icon slug
  type        DocumentType  @default(DOC)
  content     Json?         // TipTap JSON format or Canvas element array
  isPublished Boolean       @default(false)
  
  // Hierarchy
  workspaceId String
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  parentId    String?
  parent      Document?     @relation("NestedDocs", fields: [parentId], references: [id], onDelete: SetNull)
  children    Document[]    @relation("NestedDocs")
  
  createdById String
  createdBy   User          @relation("CreatedDocuments", fields: [createdById], references: [id])
  
  comments    Comment[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Comment {
  id         String   @id @default(cuid())
  content    String
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Optional coordinates for Canvas pinned comments
  posX       Float?
  posY       Float?
  
  createdAt  DateTime @default(now())
}
```

---

## 5. API & WebSocket Specification

### REST / Server Actions

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account | Public |
| `GET` | `/api/workspaces` | Get all workspaces the user belongs to | Auth required |
| `POST` | `/api/workspaces` | Create a new workspace | Auth required |
| `POST` | `/api/workspaces/join` | Join workspace using `inviteCode` | Auth required |
| `GET` | `/api/workspaces/:id/documents` | Fetch sidebar document tree | Member |
| `POST` | `/api/documents` | Create a new document or canvas board | Member (Editor+) |
| `GET` | `/api/documents/:id` | Fetch document content & metadata | Member / Public if published |
| `PATCH` | `/api/documents/:id` | Update title, icon, or content snapshot | Member (Editor+) |
| `DELETE`| `/api/documents/:id` | Archive or delete a document | Member (Admin+) |

### WebSocket Event Protocol

All real-time communication connects to `/ws` with a JWT handshake.

```typescript
// 1. Client joins a room
socket.emit("room:join", { 
  documentId: "doc_123", 
  user: { id: "u_1", name: "Alice", color: "#FF5733" } 
});

// 2. Broadcast user cursor position (high-frequency, throttled ~30-50ms)
socket.emit("cursor:move", { 
  documentId: "doc_123", 
  position: { x: 420.5, y: 310.2 } 
});

// 3. Document binary synchronization update (Yjs CRDT update vector)
socket.emit("doc:sync-step", {
  documentId: "doc_123",
  update: Uint8Array // Yjs encoded document patch
});

// 4. Server broadcast to other clients in the room
socket.to(documentId).emit("user:joined", { user, activeUsersList });
socket.to(documentId).emit("cursor:update", { userId: "u_1", position: { x, y } });
socket.to(documentId).emit("doc:sync-step", { update });
```

---

## 6. Concurrency & Real-Time Strategy

1. **Why CRDT (Yjs) over naive WebSocket replacement?**
   * If two users type at the same second with regular JSON over WebSockets, user A's save will overwrite user B's cursor position or characters (Race Condition).
   * **Yjs** turns document modifications into mathematically commutative operations. Whether updates arrive out-of-order or with high latency, all clients converge to the exact same text automatically.
2. **Auto-Saving vs. Real-Time Sync:**
   * **In-Memory / WebSockets:** Fast peer-to-peer or server relay for immediate character rendering and cursor movements.
   * **Database Persistence:** The server or client debounces changes by $1.5\text{s}$ to $2\text{s}$ after typing stops, writing the serialized state back to PostgreSQL.

---

## 7. Step-by-Step Implementation Roadmap

```
Sprint 1 (Days 1-3)  ──► Base setup, Database schema, Auth, & Sidebar Navigation
Sprint 2 (Days 4-6)  ──► Block Editor (TipTap) & Canvas Engine (Konva) integration
Sprint 3 (Days 7-9)  ──► Real-Time WebSockets: Presence, Multi-cursor, & Yjs Sync
Sprint 4 (Days 10-12) ──► Permissions, Exporting, UI Polish & Cloud Deployment
```

### Sprint 1: Foundation & CRUD
- [ ] Initialize repository with Next.js, Tailwind, and shadcn/ui.
- [ ] Set up PostgreSQL database with Prisma.
- [ ] Implement Auth (Email + OAuth).
- [ ] Build workspace switcher and expandable sidebar tree for documents.

### Sprint 2: Core Editor & Canvas
- [ ] Integrate TipTap/BlockNote for rich-text document pages.
- [ ] Add slash-menu command (`/`) for block types.
- [ ] Build canvas page with pan/zoom and sticky note components.
- [ ] Implement local auto-save to REST API.

### Sprint 3: Real-Time Multiplayer
- [ ] Set up WebSocket server (or configure Supabase Realtime / Liveblocks / Hocuspocus).
- [ ] Implement cursor tracking with smooth CSS interpolation.
- [ ] Connect Yjs provider to the TipTap editor.
- [ ] Implement presence indicator bar (avatars of users currently viewing).

### Sprint 4: Polish & Deployment
- [ ] Add invite links & role access controls.
- [ ] Add document export (Markdown download or PDF print).
- [ ] Test network disconnect/reconnect resilience.
- [ ] Deploy frontend to Vercel and backend/database to Render / Supabase / Neon.

---

## 8. Workshop Evaluation Checklist (Why This Project Scores Top Marks)

* **Architecture Complexity:** Integrates both relational storage (PostgreSQL) and real-time streaming (WebSockets/Redis).
* **Engineering Rigor:** Demonstrates understanding of distributed state management and race conditions (CRDTs).
* **UI/UX Polish:** Fast optimistic updates, intuitive slash commands, and visual delight (smooth cursor indicators).
* **Scalable Data Model:** Supports hierarchical nesting and multi-tenant workspaces.

