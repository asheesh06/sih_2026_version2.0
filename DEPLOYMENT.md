# Deployment Guide: Vercel (Frontend) & Render (Backend)

This repository is already structured into two clean, independent folders:
- **Frontend (Client)**: `sicp/client/` (React + Vite + Tailwind)
- **Backend (Server)**: `sicp/server/` (Node.js + Express + MongoDB/Mongoose API)

---

## 📦 How to Download / Export Your Code
You can export this codebase from AI Studio using either method:
1. **GitHub Export**: Go to Settings (top-right menu) → **Export to GitHub** (recommended).
2. **ZIP Download**: Go to Settings → **Download ZIP**.

---

## 🚀 Part 1: Deploy Backend to Render

1. Go to [Render.com](https://render.com) and create an account or sign in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (or select public Git repository).
4. Configure the service:
   - **Name**: `sicp-backend` (or your preferred name)
   - **Region**: Choose the region closest to you (e.g., *Singapore* or *Frankfurt*)
   - **Root Directory**: `sicp/server` *(if your repo root is the `sicp` folder, enter `server`)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Advanced** and add these **Environment Variables**:
   - `NODE_VERSION`: `20`
   - `JWT_SECRET`: Any random secure string (e.g., `sicp_jwt_secret_jharkhand_2025`)
   - `MONGODB_URI`: *(Optional)* Your MongoDB Atlas connection string. If left blank, the server automatically uses the built-in persistent local database!
   - `GEMINI_API_KEY`: *(Optional)* For live dynamic AI translation and auto-categorization.
   - `CLIENT_ORIGIN`: Leave empty initially, or enter your Vercel URL once deployed.
6. Click **Create Web Service**.
7. Once deployed, Render will provide your public backend URL, for example:  
   👉 `https://sicp-backend.onrender.com`  
   *(Copy this URL for the frontend step).*

---

## ⚡ Part 2: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign in.
2. Click **Add New…** → **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `sicp/client` *(if your repo root is the `sicp` folder, select `client`)*.
   - **Build Command**: `npm run build` *(default)*
   - **Output Directory**: `dist` *(default)*
5. Open the **Environment Variables** section and add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL (e.g., `https://sicp-backend.onrender.com`)
6. Click **Deploy**.
7. In ~60 seconds, Vercel will give you your live frontend URL, for example:  
   👉 `https://sicp-portal.vercel.app`

---

## 🔄 Part 3: Final Step (Link CORS)

1. Return to your **Render Dashboard** → select your `sicp-backend` service.
2. Go to **Environment** tab.
3. Update `CLIENT_ORIGIN` with your Vercel URL:
   - `CLIENT_ORIGIN`: `https://sicp-portal.vercel.app`
4. Click **Save Changes** (Render will automatically redeploy with CORS restricted to your Vercel frontend).

---

## 🛠️ Testing Your Deployment
- Visit your Vercel URL.
- Try switching languages (English, Hindi, Khortha).
- Test Citizen login, problem reporting with live camera capture, and status tracking.
- Test Government, University, and Industry workflows.
