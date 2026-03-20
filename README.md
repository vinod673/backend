# ArenaX Gaming - Esports Tournament Platform

A modern full-stack esports tournament website built with Next.js, Express.js, and Supabase.

## 🎮 Features

- User authentication (Signup/Login)
- Browse and join tournaments
- Admin dashboard for tournament management
- Modern UI with animations
- Responsive design

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup Steps

1. **Install root dependencies:**
```bash
npm install
```

2. **Setup Frontend:**
```bash
cd frontend
npm install
```

3. **Setup Backend:**
```bash
cd backend
npm install
```

4. **Configure Environment Variables:**

Update `.env.local` in frontend folder:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Update `.env` in backend folder:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=5000
```

5. **Run Development Servers:**

From root folder:
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## 📁 Project Structure

```
arenax-gaming/
├── frontend/          # Next.js Application
│   ├── app/          # App Router pages
│   ├── components/   # Reusable components
│   ├── lib/          # Utilities & configs
│   └── .env.local    # Frontend env vars
├── backend/          # Express.js Server
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   ├── server.js     # Entry point
│   └── .env          # Backend env vars
└── package.json      # Root package config
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Axios

**Backend:**
- Express.js
- Node.js
- Supabase (Database & Auth)

## 📝 Development Status

✅ **Step 1: Project Setup - COMPLETE**
   - Next.js + Tailwind CSS configured
   - Express.js backend ready
   - Supabase integration setup
   - Database schema created
   - Environment variables configured
   
⏳ Step 2: Home Page UI/UX - PENDING
⏳ Step 3: Authentication System - PENDING
⏳ Step 4: Dashboard System - PENDING
⏳ Step 5: Backend APIs - PENDING
⏳ Step 6: Final Integration - PENDING

## 🚀 Deployment

### Deploy to Vercel (Recommended)

**Quick Deploy (3 minutes):**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Select this repository: `vinod673/tournament`
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: **`frontend`**
   - Add environment variables from `.env.example`
5. Click "Deploy" 🎉

📖 **Full deployment guides:**
- **Vercel:** See [QUICK_VERCEL_DEPLOY.md](./QUICK_VERCEL_DEPLOY.md)
- **Hostinger Shared Hosting:** See [HOSTINGER_SHARED_HOSTING_QUICK.md](./HOSTINGER_SHARED_HOSTING_QUICK.md)
- **Hostinger VPS:** See [HOSTINGER_DEPLOYMENT_GUIDE.md](./HOSTINGER_DEPLOYMENT_GUIDE.md)

### Other Hosting Options

#### Hostinger Shared Hosting ($2.99/mo)
- Build static site and upload via FTP
- Deploy backend separately to Railway/Render (free)
- 📖 Guide: [`HOSTINGER_SHARED_HOSTING_QUICK.md`](HOSTINGER_SHARED_HOSTING_QUICK.md)

#### Hostinger VPS/Cloud ($10-25/mo)
- Full control with SSH access
- Deploy both frontend and backend
- Automated deployment script included
- 📖 Guide: [`HOSTINGER_DEPLOYMENT_GUIDE.md`](HOSTINGER_DEPLOYMENT_GUIDE.md)

---

## 🎨 Theme

- Primary: White (#FFFFFF)
- Accent: Yellow (#FCD34D, #FBBF24)
- Text: Gray (#1F2937, #4B5563)

## 📄 License

ISC
=======
# ArenaX-Gaming
A platform for play game Tournaments online and earn prizes and money
>>>>>>> 26dd056a88b0bdd5871b51aab5204e9f16d4cd7e
=======
# tournament
>>>>>>> 659365980490250682e8b36551a143f3125334e2
