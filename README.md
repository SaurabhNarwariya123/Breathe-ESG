# Breathe ESG — Data Ingestion Platform

A MERN stack prototype for ingesting emissions and activity data from enterprise clients, normalizing it, and providing an analyst review workflow before audit lock.

## Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Backend   | Node.js 20 + Express 4        |
| Database  | MongoDB (via Mongoose)        |
| Frontend  | React 18 + Vite               |
| Auth      | JWT (jsonwebtoken + bcryptjs) |
| Charts    | Recharts                      |
| State     | Zustand                       |
| File I/O  | Multer + csv-parse            |

---

## Project Structure

```
breathe-esg/
├── server/                        # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── constants.js       # Enums: scopes, statuses, roles
│   │   ├── models/
│   │   │   ├── Tenant.js
│   │   │   ├── User.js
│   │   │   ├── IngestionJob.js
│   │   │   ├── EmissionRecord.js
│   │   │   └── AuditLog.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT verify
│   │   │   └── upload.middleware.js # Multer CSV
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── ingest.controller.js
│   │   │   ├── records.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── ingest.routes.js
│   │   │   ├── records.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── services/
│   │   │   ├── emission.service.js # Orchestrates ingestion jobs
│   │   │   └── parsers/
│   │   │       ├── sap.parser.js   # SAP flat-file CSV
│   │   │       ├── utility.parser.js # Utility portal CSV
│   │   │       └── travel.parser.js  # Concur-style travel CSV
│   │   └── utils/
│   │       ├── emissionFactors.js  # DEFRA 2024 factors (UK grid + India travel)
│   │       ├── unitConverter.js    # L/gal/kWh/MWh/km/kg
│   │       └── seed.js            # Seed demo users
│   ├── sample-data/
│   │   ├── sap_sample.csv
│   │   ├── utility_sample.csv
│   │   └── travel_sample.csv
│   ├── uploads/                   # Temp upload storage
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/PrivateRoute.jsx
│   │   │   ├── common/Navbar.jsx
│   │   │   ├── common/Sidebar.jsx
│   │   │   ├── dashboard/RecordTable.jsx
│   │   │   ├── dashboard/StatusBadge.jsx
│   │   │   └── ingest/FileUpload.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── IngestPage.jsx
│   │   │   └── ReviewPage.jsx
│   │   ├── services/api.js        # Axios + interceptors
│   │   ├── store/authStore.js     # Zustand auth state
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── MODEL.md       # Data model & design decisions
├── DECISIONS.md   # Every ambiguity resolved
├── TRADEOFFS.md   # Three things not built & why
├── SOURCES.md     # Real-world format research per source
└── README.md
```

---

## Setup & Run (Local)

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

### 1. Clone & install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

```bash
# server/.env (already created, edit if needed)
MONGO_URI=mongodb://localhost:27017/breathe_esg
JWT_SECRET=breathe_esg_dev_secret_key_2024
PORT=5000

# client/.env (already created)
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed demo data

```bash
cd server
npm run seed
```

Creates:
- Tenant: `Acme Corp`
- **Alice Analyst** — `analyst@acme.com` / `Password123` (role: analyst) — can upload, review, approve/reject records
- **Admin** — `admin@acme.com` / `Password123` (role: admin) — full access

### 4. Start servers

```bash
# Terminal 1 — API
cd server
npm run dev      # starts on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev      # starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000)

---

## Using the App

### Login
Use `analyst@acme.com` / `Password123`

### Ingest Data
1. Go to **Ingest Data**
2. Select source type (SAP / Utility / Travel)
3. Upload one of the sample CSVs from `server/sample-data/`
4. The job processes in the background; check the ingestion history table

### Review Records
1. Go to **Review Records**
2. Filter by status, source, or scope
3. Click **Review** on any record
4. **Approve**, **Flag**, or **Reject** — approved records are locked

### Dashboard
Shows total CO₂e, status breakdown, and charts by scope and source.

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user + create tenant |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current user profile |

### Ingestion
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ingest` | Upload CSV (multipart), field: `file`, `sourceType` |
| GET | `/api/ingest` | List all jobs for tenant |
| GET | `/api/ingest/:id` | Get job status & errors |

### Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records` | List records (filter: status, sourceType, scope, page) |
| GET | `/api/records/:id` | Get single record with raw data |
| PATCH | `/api/records/:id/status` | Update status: `{ status, flagReason }` |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Aggregated CO₂e by scope, source, status |

---

## Sample Data Notes

### SAP (`sap_sample.csv`)
- 13 rows of fuel consumption + 1 scrapping row (movement type 551, filtered out)
- One row with 75,000L diesel — intentionally large to trigger the suspicious flag (>50t CO2e)
- Mixed units: litres, KG (LPG), M3 (natural gas)

### Utility (`utility_sample.csv`)
- 8 rows across 4 sites in Mumbai, Delhi, Bangalore, Hyderabad
- Non-calendar billing periods (billing starts on the 15th/20th)
- Hyderabad data center: 620 MWh — triggers suspicious flag (>500 MWh)

### Travel (`travel_sample.csv`)
- 17 rows covering domestic flights, international long-haul, hotels, taxi, car, train
- One flight (JFK–BOM) with no distance — falls back to airport-pair lookup table
- DEFRA 2024 factors applied; RFI multiplier (1.9x) already embedded in air factors

---

## Documentation

| File | Contents |
|------|----------|
| [MODEL.md](MODEL.md) | MongoDB schema, scope classification, unit normalization, multi-tenancy |
| [DECISIONS.md](DECISIONS.md) | Every ambiguity resolved with reasoning |
| [TRADEOFFS.md](TRADEOFFS.md) | Three things deliberately not built |
| [SOURCES.md](SOURCES.md) | Real-world format research for SAP, utility, travel |

---

## Deployment (Render)

```bash
# Backend on Render (Web Service)
Build command: cd server && npm install
Start command: cd server && node server.js
Environment: MONGO_URI, JWT_SECRET, PORT, NODE_ENV=production

# Frontend on Render (Static Site)
Build command: cd client && npm install && npm run build
Publish directory: client/dist
Environment: VITE_API_URL=https://your-api.onrender.com/api
```

Set `MONGO_URI` to a MongoDB Atlas connection string for production.
