# Installation & Setup Guide - Arogya HMS

Follow these step-by-step instructions to run Arogya HMS locally.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** (Optional): Local MongoDB server or MongoDB Atlas connection string. *(If MongoDB is not installed locally, the server automatically boots in Database Fallback mode with complete mock data).*

---

## 1. Backend Setup (`server/`)

```bash
cd server
npm install
```

### Environment Configuration

Create a `.env` file in `server/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/arogya_hms
JWT_SECRET=arogya_hms_jwt_super_secret_key_2026_production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### Seed Database with Demo Accounts & Records

```bash
npm run seed
```

### Start Server

```bash
npm run dev
# Server running at http://localhost:5000
```

---

## 2. Frontend Setup (`client/`)

In a new terminal window:

```bash
cd client
npm install
npm run dev
# Vite dev server running at http://localhost:5173
```

Open your browser and navigate to `http://localhost:5173`.
