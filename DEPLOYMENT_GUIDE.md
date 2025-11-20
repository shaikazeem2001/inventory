# 🚀 Deployment Guide: Railway + Vercel

This guide walks you through deploying your Inventory Management Application with:
- **Backend**: Railway (Node.js + MongoDB)
- **Frontend**: Vercel (React/Vite)

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ [Railway account](https://railway.app/) (free tier available)
- ✅ [Vercel account](https://vercel.com/) (free tier available)
- ✅ [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas) (free tier available)
- ✅ Git repository (GitHub, GitLab, or Bitbucket)

---

## Part 1: Deploy Backend to Railway

### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0)
3. Create a database user (username + password)
4. **Add IP whitelist**: `0.0.0.0/0` (allow all IPs for Railway)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/inventory-db
   ```

### Step 2: Push Code to Git

```bash
cd /Users/azeemshaik/Downloads/dash/server
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 3: Deploy to Railway

1. **Go to** [Railway Dashboard](https://railway.app/dashboard)
2. **Click** "New Project" → "Deploy from GitHub repo"
3. **Select** your repository → choose the `server` folder
4. **Set Root Directory**: `/server` (if monorepo) or leave blank

### Step 4: Configure Environment Variables

In Railway project → **Variables** tab, add:

```bash
PORT=5200
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/inventory-db
JWT_SECRET=your_super_secret_jwt_key_here_change_this
FRONTEND_URL=https://your-app-name.vercel.app
```

> **Important**: Replace all placeholder values with your actual credentials

### Step 5: Get Railway URL

1. After deployment completes, go to **Settings** → **Networking**
2. Click **Generate Domain**
3. Copy your Railway URL: `https://your-app.railway.app`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update API Configuration

In `/Users/azeemshaik/Downloads/dash/client/.env`:

```bash
VITE_API_URL=https://your-app.railway.app
```

### Step 2: Push Frontend to Git

```bash
cd /Users/azeemshaik/Downloads/dash/client
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin <your-frontend-repo-url>
git push -u origin main
```

### Step 3: Deploy to Vercel

1. **Go to** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Click** "Add New" → "Project"
3. **Import** your Git repository
4. **Configure**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 4: Set Environment Variable

In Vercel → **Settings** → **Environment Variables**, add:

```
VITE_API_URL = https://your-app.railway.app
```

### Step 5: Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click ⋯ on latest deployment → **Redeploy**

---

## Part 3: Final Configuration

### Update Railway CORS

Go back to Railway → **Variables**, update `FRONTEND_URL`:

```
FRONTEND_URL=https://your-app-name.vercel.app
```

Then **redeploy** Railway service.

### Create Admin User

Your app is now live! To create an admin user:

**Via API** (using curl):
```bash
# Register
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Promote to admin
curl -X POST https://your-app.railway.app/api/admin/promote-admin/admin
```

---

## ✅ Verification Checklist

- [ ] Backend accessible at Railway URL
- [ ] Frontend accessible at Vercel URL
- [ ] Login page loads correctly
- [ ] Can login as admin
- [ ] Dashboard shows correctly
- [ ] Can add products
- [ ] Can import CSV
- [ ] No CORS errors in browser console

---

## 🐛 Common Issues

**CORS Errors**: Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly

**API Connection Failed**: Check `VITE_API_URL` in Vercel matches Railway URL

**MongoDB Connection Error**: Verify IP whitelist includes `0.0.0.0/0`

---

## 🎉 You're Done!

Your Inventory Management Application is now live!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
