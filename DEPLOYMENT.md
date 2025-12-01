# GDMaxy Deployment Guide

This guide will help you deploy the GDMaxy Garbage Collection Visualizer with:
- **Backend** on Railway
- **Frontend** on Vercel

## Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)
- Vercel account (sign up at https://vercel.com)

---

## Backend Deployment on Railway

### Step 1: Create Railway Project
1. Go to https://railway.app and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account if not already connected
5. Select the **GDMaxy** repository
6. Railway will automatically detect the Python backend

### Step 2: Configure Backend
1. In Railway dashboard, click on your project
2. Go to **Settings** tab
3. Set **Root Directory** to `backend`
4. Railway will automatically detect `Procfile` and `requirements.txt`

### Step 3: Set Environment Variables
1. Go to the **Variables** tab in Railway
2. Add the following variables:
   ```
   PORT=8000
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```
3. You'll update `ALLOWED_ORIGINS` after deploying frontend

### Step 4: Deploy
1. Railway will automatically build and deploy
2. Once deployed, you'll get a URL like: `https://gdmaxy-backend.railway.app`
3. Copy this URL - you'll need it for the frontend

### Step 5: Test Backend
Visit your Railway URL + `/health` (e.g., `https://gdmaxy-backend.railway.app/health`)
You should see: `{"status":"healthy","app":"GDMaxy Backend"}`

---

## Frontend Deployment on Vercel

### Step 1: Create Vercel Project
1. Go to https://vercel.com and sign in
2. Click **"Add New Project"**
3. Import the **GDMaxy** repository from GitHub
4. Vercel will detect it's a React app

### Step 2: Configure Frontend
1. Set **Root Directory** to `frontend`
2. Framework Preset: **Create React App**
3. Build Command: `yarn build`
4. Output Directory: `build`
5. Install Command: `yarn install`

### Step 3: Set Environment Variables
1. In the **Environment Variables** section, add:
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.railway.app
   ```
2. Replace with your actual Railway backend URL from above
3. Make sure to remove `/api` from the URL (the app adds it automatically)

### Step 4: Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. You'll get a URL like: `https://gdmaxy.vercel.app`

### Step 5: Update Backend CORS
1. Go back to Railway dashboard
2. Update the `ALLOWED_ORIGINS` variable with your Vercel URL:
   ```
   ALLOWED_ORIGINS=https://gdmaxy.vercel.app,https://*.vercel.app
   ```
3. This allows your frontend to communicate with the backend

---

## Verification

1. **Visit your Vercel URL**: `https://your-app.vercel.app`
2. The app should load successfully
3. Try the following:
   - Initialize heap
   - Allocate memory blocks
   - Run garbage collection
   - View metrics and graphs

---

## Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to your project settings in Vercel
2. Click **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

### For Railway (Backend):
1. Go to your project settings in Railway
2. Click **Settings** > **Domains**
3. Add your custom domain
4. Configure DNS as instructed

---

## Troubleshooting

### Backend Issues:
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure `requirements.txt` installs correctly
- Test `/health` endpoint

### Frontend Issues:
- Check Vercel deployment logs
- Verify `REACT_APP_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend URL doesn't have trailing slash

### CORS Errors:
- Verify `ALLOWED_ORIGINS` in Railway includes your Vercel domain
- Make sure both http:// and https:// are handled
- Check that backend is actually running

---

## Environment Variables Summary

### Backend (Railway):
```
PORT=8000
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://*.vercel.app
```

### Frontend (Vercel):
```
REACT_APP_API_URL=https://your-backend.railway.app
```

---

## Continuous Deployment

Both Railway and Vercel support automatic deployments:
- **Push to GitHub** → Automatic deployment
- **Pull Requests** → Preview deployments (Vercel)
- **Main branch** → Production deployment

---

## Cost

- **Railway**: Free tier includes 500 hours/month ($5 credit)
- **Vercel**: Free tier includes unlimited deployments for hobby projects

---

## Support

For issues:
- Railway: https://railway.app/help
- Vercel: https://vercel.com/docs
- GitHub Issues: https://github.com/Vivek1566/GDMaxy/issues
