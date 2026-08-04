# Production Deployment Guide - Arogya HMS

Instructions to deploy Arogya HMS to Vercel (Frontend), Render (Backend), and MongoDB Atlas (Database).

## 1. Database: MongoDB Atlas

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a user with read/write permissions.
3. Under **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere).
4. Copy your Connection String (`mongodb+srv://<username>:<password>@cluster.mongodb.net/arogya_hms?retryWrites=true&w=majority`).

---

## 2. Backend: Deploy to Render.com

1. Push the repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com/) and click **New Web Service**.
3. Connect your repository and set the **Root Directory** to `server`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add Environment Variables in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: `<YOUR_MONGODB_ATLAS_URI>`
   - `JWT_SECRET`: `<YOUR_SECURE_JWT_SECRET>`
   - `CLIENT_URL`: `https://your-app.vercel.app`

---

## 3. Frontend: Deploy to Vercel

1. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
2. Select your repository and set the **Framework Preset** to `Vite`.
3. Set **Root Directory** to `client`.
4. Set Build Command: `npm run build`
5. Output Directory: `dist`
6. Add `vercel.json` rewrite in `client/` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
7. Deploy!
