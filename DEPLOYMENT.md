# Complete Deployment Guide: Vercel (Frontend), Render (Backend), and MongoDB Atlas

This document outlines the exact step-by-step process to deploy your **Societal Innovation Collaboration Portal (SICP)** to production:
- **Database**: MongoDB Atlas (Free Cloud M0 Cluster)
- **Backend API**: Render (Node.js Web Service)
- **Frontend SPA**: Vercel (React + Vite + Tailwind)

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Cloud Database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and register or sign in.
2. Click **Create a Deployment** (or **Build a Database**).
3. Select the **M0 Free** tier (free forever, 512MB).
4. Choose a Cloud Provider & Region (e.g. **AWS / Mumbai (`ap-south-1`)** or nearest to your users).
5. Name your cluster (e.g. `sicp-cluster`) and click **Create**.
6. **Create a Database User**:
   - Username: `sicp_admin`
   - Password: Click **Autogenerate Secure Password** or enter a strong password (e.g., `SecurePass123!@#`).
   - ⚠️ **Save this password** — you will need it for the connection string!
   - Click **Create Database User**.
7. **Configure Network Access (Crucial)**:
   - In the left sidebar, navigate to **Security** → **Network Access**.
   - Click **+ Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**. *(This allows Render servers to connect to your database without being blocked).*
8. **Get Your Connection String**:
   - In the left sidebar, go to **Database** → click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string. It will look like this:
     ```text
     mongodb+srv://sicp_admin:<password>@sicp-cluster.xxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password, and append `/sicp` before the `?` to set the database name:
     ```text
     mongodb+srv://sicp_admin:SecurePass123!@#@sicp-cluster.xxxx.mongodb.net/sicp?retryWrites=true&w=majority
     ```
   - Keep this connection string ready for Step 3.

---

## 📦 Step 2: Export Your Code to GitHub

1. In AI Studio, look at the top-right header menu.
2. Click **Settings** (gear icon) → **Export to GitHub** (or download the ZIP and push to GitHub).
3. Push to your repository (e.g., `github.com/your-username/sicp-portal`).

---

## 🚀 Step 3: Deploy Backend on Render

1. Go to [Render.com](https://render.com) and log in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Fill in the service configuration:
   - **Name**: `sicp-backend`
   - **Region**: Choose the region closest to India/Asia (e.g., *Singapore*)
   - **Root Directory**: `sicp/server` *(or `server` if `sicp` is repo root)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Advanced** and expand the **Environment Variables** section. Add:

| Environment Variable | Value | Notes |
| :--- | :--- | :--- |
| `NODE_VERSION` | `20` | Ensures Node 20 LTS runtime |
| `NODE_ENV` | `production` | Production mode |
| `MONGODB_URI` | `mongodb+srv://sicp_admin:<password>@.../sicp?retryWrites=true&w=majority` | Your MongoDB Atlas connection string from Step 1 |
| `JWT_SECRET` | `jharkhand_sicp_super_secure_jwt_token_2025_secret` | Any random strong 32+ character string |
| `CLIENT_ORIGIN` | `*` (or leave blank for now) | You will update this with your Vercel URL in Step 5 |
| `GEMINI_API_KEY` | *(Optional)* | Only if you want live dynamic AI translation & categorization |

6. Click **Create Web Service**.
7. Render will build and deploy your API in ~2 minutes.
8. Once the status shows **Live**, copy your public Render URL:  
   👉 `https://sicp-backend.onrender.com`

---

## ⚡ Step 4: Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com) and log in.
2. Click **Add New…** → **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** page:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `sicp/client` *(or `client` if `sicp` is repo root)*.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://sicp-backend.onrender.com` *(your exact Render URL from Step 3)* |

6. Click **Deploy**.
7. Vercel will bundle and deploy the app in ~45 seconds and give you a live URL:  
   👉 `https://sicp-portal.vercel.app`

---

## 🔒 Step 5: Secure CORS on Render (Final Touch)

1. Return to your [Render Dashboard](https://dashboard.render.com).
2. Select your `sicp-backend` Web Service → go to **Environment**.
3. Change `CLIENT_ORIGIN` to your exact Vercel URL:
   ```text
   CLIENT_ORIGIN = https://sicp-portal.vercel.app
   ```
4. Click **Save Changes**. Render will automatically restart with CORS restricted to your Vercel frontend.

---

## ✅ Deployment Checklist & Testing

- [ ] **Database**: Log into MongoDB Atlas → **Database** → **Browse Collections**. You should see the auto-seeded collections (`users`, `problems`, `organisations`).
- [ ] **Health Check**: Open `https://sicp-backend.onrender.com/api/health` in your browser. It should return `{"ok":true,"service":"sicp-server"}`.
- [ ] **Frontend**: Open `https://sicp-portal.vercel.app`.
- [ ] **Citizen Flow**: Test reporting a problem, auto GPS capture, and camera/photo upload.
- [ ] **Roles & Switcher**: Test switching languages (English, Hindi, Khortha) and logging in with different stakeholder roles.
