# 🌱 LABTANAM MVP - Smart Hydroponic System

## 🏗️ Architecture Overview

LABTANAM is a comprehensive hydroponic farming platform with AI chatbot assistance, plant monitoring, and community features.

### System Components:
- **Frontend**: Static web app (HTML + TailwindCSS + Vanilla JS) hosted on Vercel
- **Backend**: Node.js + Express API for chatbot functionality hosted on Railway
- **Database**: Supabase for plant logbook storage
- **AI**: OpenRouter API integration for agricultural chatbot

### Features:
- 📚 Educational content (videos, guides)
- 📝 Plant monitoring and logbook
- 🤖 AI chatbot for farming questions
- 👥 Community integration
- 🛒 Marketplace links

## 🚀 Quick Start

### Frontend Development
```bash
cd frontend
# Open index.html in browser or use live server
```

### Backend Development
```bash
cd backend
npm install
npm run dev
```

## 📁 Project Structure
```
labtanam-mvp/
├── frontend/           # Static web app
│   ├── index.html
│   ├── edukasi.html
│   ├── chatbot.html
│   ├── monitoring.html
│   ├── komunitas.html
│   ├── assets/
│   └── js/
├── backend/           # Node.js API server
│   ├── server.js
│   ├── routes/
│   └── package.json
└── docs/             # Documentation
```

## 🌐 Deployment
- Frontend: Vercel (auto-deploy from GitHub)
- Backend: Railway/Render
- Database: Supabase