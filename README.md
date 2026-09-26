# 📦 LogiTrack — Shipment Status Tracker

LogiTrack is a full-stack logistics application for tracking shipments as they move through different lifecycle stages. It provides real-time search & status filtering, status change management, and a complete visual timeline audit trail for every shipment status transition.

---

## 🚀 Tech Stack & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Fast HMR development, component reusability, strict type safety, and optimal production bundling. |
| **Styling** | Tailwind CSS, Lucide Icons | Clean logistics dashboard aesthetics with curated dark-slate color palette, distinct status badges, and responsive UI components. |
| **Backend** | Node.js, Express.js, TypeScript | Clean REST API design, modular controller/service/route architecture, Zod validation, and robust error handling. |
| **Database & ORM** | PostgreSQL / SQLite, Prisma ORM | Strong relational integrity, type-safe queries, migration management, index optimizations, and transactional status updates. |

---

## 🌟 Key Features

1. **Create Shipment**:
   - Create shipments with reference number (unique), origin, destination, initial status, and expected delivery date.
   - Frontend and backend validation with Zod.
2. **Logistics Dashboard**:
   - Overview metrics cards showing total count and status breakdown.
   - Filterable & searchable shipment table.
   - Distinct visual status badges (`BOOKED`, `IN_TRANSIT`, `CUSTOMS_HOLD`, `OUT_FOR_DELIVERY`, `DELIVERED`).
3. **Status Update & Audit History**:
   - Update shipment current status with optional status change notes.
   - Prevents duplicate history entries if status hasn't changed.
   - Transactional execution: updates shipment `currentStatus` and appends a `ShipmentStatusHistory` audit log.
4. **Shipment History & Detail Page**:
   - View shipment details and route summary.
   - Visual vertical timeline displaying chronological sequence of status transitions with timestamps and notes.
5. **Combined Backend Search & Filtering**:
   - Search by reference number (`?search=TRK-1001`) and filter by status (`?status=IN_TRANSIT`) processed directly at the API/database layer.

---

## 🏗 Architecture & Flow

```
┌───────────────────────────┐
│     React + Vite UI       │ (Tailwind CSS, Axios, Lucide Icons)
└─────────────┬─────────────┘
              │ HTTP / REST API (JSON)
              ▼
┌───────────────────────────┐
│   Node.js + Express API   │ (Zod Validation, Custom Error Handler)
└─────────────┬─────────────┘
              │ Type-safe Database Transactions
              ▼
┌───────────────────────────┐
│        Prisma ORM         │ (Schema & Migrations)
└─────────────┬─────────────┘
              │ Relational Data Persistence
              ▼
┌───────────────────────────┐
│ PostgreSQL / SQLite DB    │ (Shipment & ShipmentStatusHistory)
└───────────────────────────┘
```

---

## 🗄 Database Data Model

The application enforces a **One-to-Many relationship** between `Shipment` and `ShipmentStatusHistory`.

```
Shipment (1) ───────────< (Many) ShipmentStatusHistory
```

### Models Overview

#### `Shipment`
- `id` (String, UUID, Primary Key)
- `referenceNumber` (String, Unique Index)
- `origin` (String)
- `destination` (String)
- `currentStatus` (Enum/String: `BOOKED`, `IN_TRANSIT`, `CUSTOMS_HOLD`, `OUT_FOR_DELIVERY`, `DELIVERED`, Indexed)
- `expectedDeliveryDate` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

#### `ShipmentStatusHistory`
- `id` (String, UUID, Primary Key)
- `shipmentId` (String, Foreign Key -> Shipment.id, Indexed)
- `previousStatus` (Enum/String, Nullable for initial creation)
- `newStatus` (Enum/String)
- `notes` (String, Optional)
- `createdAt` (DateTime)

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Query / Body Params | Response Code |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/shipments/stats/summary` | Summary count breakdown per status | None | `200 OK` |
| **GET** | `/api/shipments` | List shipments with search & filtering | `?search=TRK-1001&status=IN_TRANSIT` | `200 OK` |
| **POST** | `/api/shipments` | Create new shipment | Body: `{ referenceNumber, origin, destination, currentStatus?, expectedDeliveryDate }` | `201 Created` |
| **GET** | `/api/shipments/:id` | Get single shipment with history timeline | Path: `:id` | `200 OK` / `404 Not Found` |
| **PATCH** | `/api/shipments/:id/status` | Update status & record audit history | Body: `{ status: 'DELIVERED', notes?: string }` | `200 OK` / `400 Bad Request` |

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd shipment-status-tracker

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Database Setup & Seeding

For instant local testing, SQLite is pre-configured in `backend/.env`. If you wish to use PostgreSQL locally via Docker Compose:
```bash
# Optional: Start local PostgreSQL container
docker compose up -d
```

Run database sync & sample seeding:
```bash
cd backend

# Sync schema and generate Prisma client
npx prisma db push

# Seed realistic sample shipments
npx prisma db seed
cd ..
```

### 3. Running Development Servers
From the root directory:

```bash
# Terminal 1: Run Backend API (Port 5000)
npm run dev:backend

# Terminal 2: Run Frontend (Port 5173)
npm run dev:frontend
```

Open your browser at `http://localhost:5173`.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="file:./dev.db" # Or "postgresql://postgres:postgrespassword@localhost:5432/shipment_tracker?schema=public"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:5000/api"
```

---

## 📌 Architectural Assumptions

1. **Shipment Reference Number**: Reference numbers are case-insensitive and strictly unique across the system (e.g. `TRK-1001`).
2. **Status Transition Auditing**: Status changes do not overwrite history. Every status update executes in a database transaction (`prisma.$transaction`) inserting a `ShipmentStatusHistory` audit record.
3. **Idempotent Updates**: Submitting a status update matching the shipment's current status will return early without creating duplicate history entries.
4. **Initial Creation**: Creating a shipment automatically logs an initial `ShipmentStatusHistory` entry with `previousStatus: null`.

---

## 📈 Scaling to 10,000+ Shipments & High Concurrency

If this application needed to scale to 10,000+ active shipments and high concurrent read/write throughput, the following enhancements would be applied:

1. **Database Indexing & Cursor Pagination**:
   - Add composite indexes on `(currentStatus, updatedAt)` and `(referenceNumber)`.
   - Transition from offset pagination (`SKIP/TAKE`) to cursor-based pagination (`where: { id: { gt: lastId } }`) to maintain constant-time query latency.
2. **Read-Heavy Caching (Redis)**:
   - Cache frequent query results (e.g., status summary stats `/api/shipments/stats/summary` and individual shipment details) in Redis with cache invalidation on status updates.
3. **Connection Pooling**:
   - Use Prisma Accelerate or PgBouncer connection pooling to efficiently manage PostgreSQL database connections under high concurrent worker requests.
4. **Optimistic Locking & Concurrency Control**:
   - Add an `version` or `updatedAt` field to `Shipment` model for optimistic locking during concurrent status update requests.
5. **Horizontal Backend Scaling & CDN**:
   - Run backend API across multiple stateless Docker instances behind an NGINX load balancer. Serve static frontend assets from Vercel/Cloudflare CDN.

---

## ☁️ Deployment Guide

### Frontend Deployment (Vercel)
1. Push project to GitHub repository.
2. Import project into Vercel, setting root directory to `frontend`.
3. Add Environment Variable: `VITE_API_URL = https://your-backend.onrender.com/api`.
4. Deploy!

### Backend Deployment (Render / Railway / Fly.io)
1. Create a Web Service pointing to `backend` folder.
2. Build command: `npm install && npm run build`.
3. Start command: `npm start`.
4. Environment Variables:
   - `DATABASE_URL` = Hosted PostgreSQL URL (from Neon / Supabase / Render Postgres).
   - `PORT` = `5000` (or provided by platform).
   - `CORS_ORIGIN` = Vercel frontend production domain URL.
