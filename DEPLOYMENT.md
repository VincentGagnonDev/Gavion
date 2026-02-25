# Gavion CRM - Deployment Guide

## Free Tier Stack
- **Database**: Supabase (PostgreSQL)
- **Backend**: Railway or Render
- **Frontend**: Vercel

---

## Step 1: Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project:
   - Name: `gavion-crm`
   - Password: Save this!
   - Region: Choose closest to you
3. Wait for setup (2-3 minutes)
4. Go to **Settings > Database**
5. Copy **Connection String** (it looks like `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`)

---

## Step 2: Railway (Backend)

1. Go to [railway.app](https://railway.app) and connect GitHub
2. Create new project > "Deploy from GitHub repo"
3. Select your repo
4. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.xxx.supabase.co:5432/postgres
   JWT_SECRET=YOUR_RANDOM_STRING (at least 32 chars)
   NODE_ENV=production
   PORT=3001
   APP_URL=https://your-vercel-url.vercel.app
   CORS_WHITELIST=https://your-vercel-url.vercel.app
   ```
5. Click Deploy
6. Once deployed, copy your Railway URL (e.g., `https://gavion-backend.up.railway.app`)

---

## Step 3: Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) and connect GitHub
2. Import your repo
3. Set environment variables:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```
4. Click Deploy
5. Copy your Vercel URL

---

## Step 4: Update URLs

After deployment, update these in Railway:
1. `APP_URL` = Your Vercel URL
2. `CORS_WHITELIST` = Your Vercel URL

Update Vercel config in `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-railway-url.up.railway.app/api/:path*"
    }
  ]
}
```

---

## Step 5: Setup Database

1. In Railway, open the **Terminal** (or use Railway CLI)
2. Run migrations:
```bash
npx prisma migrate deploy
npx prisma generate
```

---

## Step 6: Seed Kimi Products

After setup, call the seed endpoint:
```
POST https://your-railway-url.up.railway.app/api/kimi/seed-kimi
Authorization: Bearer YOUR_JWT_TOKEN (with SYSTEM_ADMIN role)
```

---

## URLs Structure

```
User → Vercel (Frontend)
       ↓ (API calls)
    Railway (Backend)
       ↓ (database)
    Supabase (PostgreSQL)
```

---

## Troubleshooting

**CORS errors**: Make sure CORS_WHITELIST includes your Vercel URL

**Database connection**: Verify DATABASE_URL is correct from Supabase

**Build errors**: Check Railway build logs
