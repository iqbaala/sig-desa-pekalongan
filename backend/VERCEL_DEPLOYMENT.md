# LABTANAM Backend - Vercel Deployment Guide

## Prerequisites

1. Vercel account (free tier available)
2. GitHub account with your code repository
3. Environment variables ready

## Deployment Steps

### 1. Connect Repository to Vercel

1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository containing the backend
4. Select the `backend` folder as the root directory

### 2. Configure Environment Variables

In Vercel dashboard, go to your project settings and add these environment variables:

```
NODE_ENV=production
SUPABASE_URL=https://bvaxxlmhrzocbrqiykqq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2YXh4bG1ocnpvY2JycWl5a29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NjMxMDMsImV4cCI6MjA2OTQzOTEwM30.GjDhx8BUR7Y4FUS2PZalEeDhKVt_zQWGTEV_5nKKgrg
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=moonshotai/kimi-k2:free
```

### 3. Deploy

Vercel will automatically deploy your backend. The API will be available at:
- `https://your-project-name.vercel.app/api/chat`
- `https://your-project-name.vercel.app/api/logbook`
- `https://your-project-name.vercel.app/api/health`

### 4. Update Frontend

Update the frontend JavaScript files to use your Vercel backend URL:

In `frontend/js/chatbot.js`:
```javascript
this.apiEndpoint = 'https://your-project-name.vercel.app/api/chat';
```

In `frontend/js/logbook.js`:
```javascript
this.apiEndpoint = 'https://your-project-name.vercel.app/api/logbook';
```

## Project Structure

```
backend/
├── api/
│   ├── chat/
│   │   └── index.js      # Chat API endpoint
│   ├── logbook/
│   │   └── index.js      # Logbook API endpoint
│   ├── health.js         # Health check endpoint
│   └── index.js          # Root API endpoint
├── routes/
│   ├── chat.js           # Chat route handlers
│   └── logbook.js        # Logbook route handlers
├── server.js             # Main server (for local development)
├── package.json
├── vercel.json           # Vercel configuration
└── .env.example          # Environment variables template
```

## Features

- ✅ Serverless deployment on Vercel
- ✅ Automatic HTTPS
- ✅ CORS configuration for frontend
- ✅ Rate limiting
- ✅ Health checks
- ✅ Environment-based configuration

## Testing

Once deployed, test your endpoints:

1. Health check: `GET https://your-project-name.vercel.app/api/health`
2. Chat API: `POST https://your-project-name.vercel.app/api/chat`
3. Logbook API: `GET/POST https://your-project-name.vercel.app/api/logbook`

## Troubleshooting

- Check Vercel logs in the dashboard for errors
- Ensure all environment variables are set
- Verify CORS origins match your frontend domain
- Check rate limiting if getting 429 errors