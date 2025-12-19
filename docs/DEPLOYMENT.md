# 🚀 LABTANAM MVP - Deployment Guide

**Updated**: July 30, 2025  
**Status**: ✅ Ready for Production Deployment

---

## 🎯 Quick Deployment

### Frontend to Vercel
```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Deploy from frontend directory
cd frontend
vercel --prod

# 3. Follow prompts:
# - Project name: labtanam-frontend
# - Framework: Other
# - Build command: (leave empty)
# - Output directory: ./
```

### Backend to Railway
```bash
# 1. Install Railway CLI (if not installed)
npm install -g @railway/cli

# 2. Deploy from backend directory
cd backend
railway login
railway init
railway up

# 3. Set environment variables in Railway dashboard
```

---

## ⚠️ VERCEL CONFIGURATION FIX

**Issue Fixed**: `If 'rewrites', 'redirects', 'headers', 'cleanUrls' or 'trailingSlash' are used, then 'routes' cannot be present.`

**Solution Applied**: ✅ Updated `vercel.json` to use modern Vercel configuration:

```json
{
  "version": 2,
  "name": "labtanam-frontend",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [...],
  "redirects": [...]
}
```

**Changes Made**:
- ❌ Removed `routes` property (deprecated)
- ❌ Removed `builds` property (auto-detected)
- ✅ Added `cleanUrls: true` for clean URLs
- ✅ Kept `trailingSlash: false` for consistency
- ✅ Maintained security headers and caching rules

---

## 🔧 Environment Configuration

### Required Environment Variables

#### Backend (.env)
```env
# Production Environment
NODE_ENV=production
PORT=3000

# OpenRouter AI API (Kimi model - free tier)
OPENROUTER_API_KEY=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

# Frontend URL (Update with your Vercel domain)
FRONTEND_URL=https://labtanam.vercel.app

# Supabase Database Integration
SUPABASE_URL=https://bvaxxlmhrzocbrqiykqq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2YXh4bG1ocnpvY2JycWl5a29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NjMxMDMsImV4cCI6MjA2OTQzOTEwM30.GjDhx8BUR7Y4FUS2PZalEeDhKVt_zQWGTEV_5nKKgrg
```

### Getting OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Go to Keys section
4. Create a new API key
5. Add credits to your account ($5-10 is enough for MVP testing)
6. Copy the key to your Railway environment variables

## 🔗 Post-Deployment Configuration

### Update Frontend API Endpoint

After backend deployment, update the chatbot JavaScript:

```javascript
// In frontend/js/chatbot.js
this.apiEndpoint = 'https://your-railway-app.railway.app/api/chat';
```

### CORS Configuration

Ensure your Railway backend allows your Vercel frontend:

```javascript
// In backend/server.js
const corsOptions = {
    origin: [
        'https://your-vercel-domain.vercel.app',
        'https://labtanam.vercel.app'
    ],
    credentials: true
};
```

## 🧪 Testing Deployment

### Health Checks

1. **Frontend Health**
   ```
   https://your-vercel-domain.vercel.app
   ```

2. **Backend Health**
   ```
   https://your-railway-app.railway.app/health
   ```

3. **Chat API Health**
   ```
   https://your-railway-app.railway.app/api/chat/health
   ```

### Test Chat Functionality

1. Open your deployed frontend
2. Go to ChatBot page
3. Send a test message: "Bagaimana cara mengatur pH air?"
4. Verify AI response is received

## 📊 Monitoring & Logs

### Vercel Monitoring
- Go to Vercel Dashboard → Your Project
- Check Functions tab for any errors
- Monitor usage in Analytics

### Railway Monitoring
- Go to Railway Dashboard → Your Project
- Check Metrics tab for performance
- View Logs tab for debugging

### Error Handling
- Backend has fallback mock responses if OpenRouter fails
- Frontend shows user-friendly error messages
- All errors are logged for debugging

## 💰 Cost Estimation

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month
- **Railway**: $5/month after free trial
- **OpenRouter**: Pay-per-use (~$0.001 per message)
- **Supabase**: 500MB database, 2GB bandwidth

### Expected Monthly Costs (1000 users)
- Vercel: $0 (within free tier)
- Railway: $5-10
- OpenRouter: $10-20 (depending on usage)
- **Total**: ~$15-30/month

## 🔒 Security Checklist

- ✅ API keys stored in environment variables
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input validation implemented
- ✅ Security headers added
- ✅ HTTPS enforced
- ✅ No sensitive data in frontend

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify frontend domain is whitelisted

2. **OpenRouter API Errors**
   - Verify API key is correct
   - Check account has sufficient credits
   - Monitor rate limits

3. **Deployment Failures**
   - Check build logs in Railway/Vercel
   - Verify all dependencies are listed
   - Ensure environment variables are set

### Debug Commands

```bash
# Test backend locally
cd backend
npm install
npm run dev

# Test API endpoint
curl https://your-railway-app.railway.app/health

# Check logs
railway logs --tail
```

## 📈 Scaling Considerations

### Performance Optimization
- Enable Vercel Edge Network
- Use Railway autoscaling
- Implement response caching
- Optimize images and assets

### Database Migration
- Set up Supabase database
- Implement user authentication
- Add data persistence for logbook

### Feature Additions
- Real-time notifications
- Mobile app development
- Advanced AI features
- Community features

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy LABTANAM
on:
  push:
    branches: [main]
jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

## 📞 Support

For deployment issues:
1. Check this documentation first
2. Review platform-specific docs (Vercel/Railway)
3. Check GitHub Issues
4. Contact support via WhatsApp community

---

**Next Steps**: After successful deployment, monitor usage and gather user feedback for the next iteration! 🌱