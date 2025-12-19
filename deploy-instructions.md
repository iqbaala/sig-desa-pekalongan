# LABTANAM - Complete Vercel Deployment Guide

## Overview

This guide will help you deploy both the backend and frontend of LABTANAM to Vercel after Railway failed.

## Prerequisites

1. ✅ Vercel account (free tier available)
2. ✅ GitHub repository with your code
3. ✅ Environment variables ready (Supabase, OpenAI/Gemini API keys)

## Step 1: Deploy Backend to Vercel

### 1.1 Create New Project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set the root directory to `backend`
5. Click "Deploy"

### 1.2 Configure Environment Variables

In your Vercel project dashboard:

1. Go to "Settings" → "Environment Variables"
2. Add the following variables:

```
NODE_ENV=production
SUPABASE_URL=https://bvaxxlmhrzocbrqiykqq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2YXh4bG1ocnpvY2JycWl5a29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NjMxMDMsImV4cCI6MjA2OTQzOTEwM30.GjDhx8BUR7Y4FUS2PZalEeDhKVt_zQWGTEV_5nKKgrg
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=moonshotai/kimi-k2:free
```

### 1.3 Get Your Backend URL

After deployment, your backend will be available at:
```
https://your-backend-project-name.vercel.app
```

Note down this URL - you'll need it for the frontend.

## Step 2: Update Frontend Configuration

### 2.1 Update API Endpoints

Replace the placeholder URLs in the frontend JavaScript files with your actual Vercel backend URL:

**In `frontend/js/chatbot.js`** (line 4):
```javascript
this.apiEndpoint = 'https://your-backend-project-name.vercel.app/api/chat';
```

**In `frontend/js/logbook.js`** (line 4):
```javascript
this.apiEndpoint = 'https://your-backend-project-name.vercel.app/api/logbook';
```

### 2.2 Update CORS Configuration

Update the backend CORS configuration to include your frontend domain:

**In `backend/server.js`** (around line 20):
```javascript
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.vercel.app', 'https://labtanam.vercel.app']
        : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true,
    optionsSuccessStatus: 200
};
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Another Vercel Project

1. In Vercel dashboard, click "New Project"
2. Import the same GitHub repository
3. **Important**: Set the root directory to `frontend`
4. Click "Deploy"

### 3.2 Update Backend CORS (if needed)

If your frontend gets a different URL than expected:

1. Note your frontend URL: `https://your-frontend-project-name.vercel.app`
2. Go to your backend project in Vercel
3. Add this URL to the CORS origins in your backend code
4. Redeploy the backend

## Step 4: Test the Deployment

### 4.1 Test Backend Endpoints

Visit these URLs in your browser:

1. **Health Check**: `https://your-backend-project-name.vercel.app/api/health`
2. **Root API**: `https://your-backend-project-name.vercel.app/`

You should see JSON responses confirming the API is working.

### 4.2 Test Frontend

1. Visit your frontend URL: `https://your-frontend-project-name.vercel.app`
2. Test the chatbot functionality
3. Test the logbook functionality
4. Check browser console for any CORS errors

## Current Project Structure

```
project/
├── backend/
│   ├── api/
│   │   ├── chat/
│   │   │   └── index.js      # Serverless chat endpoint
│   │   ├── logbook/
│   │   │   └── index.js      # Serverless logbook endpoint
│   │   ├── health.js         # Health check endpoint
│   │   └── index.js          # Root API endpoint
│   ├── routes/
│   │   ├── chat.js           # Chat route handlers
│   │   └── logbook.js        # Logbook route handlers
│   ├── server.js             # Main server (for local dev)
│   ├── package.json
│   ├── vercel.json           # Vercel configuration
│   └── .env.example          # Environment template
└── frontend/
    ├── index.html
    ├── chatbot.html
    ├── logbook.html
    ├── js/
    │   ├── chatbot.js         # Updated with Vercel URLs
    │   └── logbook.js         # Updated with Vercel URLs
    └── vercel.json            # Frontend Vercel config
```

## Benefits of Vercel Deployment

- ✅ **Serverless**: Automatic scaling, pay-per-use
- ✅ **Fast**: Global CDN with edge locations
- ✅ **Secure**: Automatic HTTPS certificates
- ✅ **Easy**: Git-based deployments
- ✅ **Free Tier**: Good limits for development and small projects

## Troubleshooting

### CORS Errors
- Check that your frontend URL is in the backend CORS configuration
- Redeploy backend after updating CORS settings

### 404 Errors on API Calls
- Verify the API endpoints match: `/api/chat`, `/api/logbook`
- Check the backend URL is correct in frontend files

### Environment Variables
- Make sure all required environment variables are set in Vercel dashboard
- Check Vercel function logs for missing environment errors

### Rate Limiting
- If getting 429 errors, check rate limiting configuration
- Current limits: 10 chat requests per minute, 100 API requests per 15 minutes

## Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Configure environment variables
3. ✅ Update frontend API URLs
4. ✅ Deploy frontend to Vercel
5. ✅ Test full functionality
6. 🔄 Monitor and iterate

Your LABTANAM application should now be fully deployed and functional on Vercel!