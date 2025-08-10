# Deployment Guide

This application consists of two parts that need to be deployed separately:

## 1. Backend Service (Required First)

The backend service handles Puppeteer scraping and Groq AI analysis.

### Option A: Deploy to Railway (Recommended)

1. **Create Railway Account**: Go to [railway.app](https://railway.app)

2. **Deploy from GitHub**:

   - Connect your GitHub repository
   - Select the `backend` folder as the root directory
   - Railway will automatically detect it's a Node.js app

3. **Set Environment Variables**:

   ```
   GROQ_API_KEY=
   PORT=3001
   NODE_ENV=production
   ```

4. **Deploy**: Railway will automatically install Puppeteer and Chromium

### Option B: Deploy to Render

1. **Create Render Account**: Go to [render.com](https://render.com)

2. **Create Web Service**:

   - Connect GitHub repository
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`

3. **Add Environment Variables** (same as above)

4. **Add Buildpack** for Puppeteer:
   - In Render dashboard, add buildpack: `https://github.com/jontewks/puppeteer-heroku-buildpack`

### Option C: Deploy to Vercel

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Deploy**:

   ```bash
   cd backend
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel dashboard

## 2. Frontend Application

### Update Backend URL

1. **Edit `src/utils/api.ts`**:
   ```typescript
   const API_BASE_URL =
     process.env.NODE_ENV === "production"
       ? "https://your-backend-url.railway.app" // Replace with your actual backend URL
       : "http://localhost:3001";
   ```

### Deploy Frontend

The frontend can be deployed to any static hosting service:

- **Netlify**: Connect GitHub repo, build command: `npm run build`, publish directory: `dist`
- **Vercel**: `vercel --prod` from project root
- **Railway**: Create new service, select frontend folder

## 3. Testing

1. **Backend Health Check**: Visit `https://your-backend-url.com/health`
2. **Frontend**: The app will show backend status and enable analysis when connected

## 4. Costs

- **Railway**: ~$5/month for backend service
- **Render**: Free tier available, then ~$7/month
- **Vercel**: Free tier for both frontend and backend
- **Netlify**: Free tier for frontend

## 5. Performance Notes

- Each analysis takes 10-30 seconds (Puppeteer is thorough)
- Backend handles browser lifecycle automatically
- Consider implementing request queuing for high traffic
- Monitor memory usage (Puppeteer can be memory-intensive)

## Need Help?

- Check backend logs in your deployment platform
- Ensure all environment variables are set correctly
- Verify the backend URL is correctly configured in the frontend
- Test the `/health` endpoint first
