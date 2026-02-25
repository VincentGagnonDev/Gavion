# Gavion CRM - Backend

## Requirements
- Node.js 18+
- PostgreSQL database (Supabase)

## Environment Variables
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secure-random-string-min-32-chars
NODE_ENV=production
PORT=3001
APP_URL=https://your-frontend.vercel.app
CORS_WHITELIST=https://your-frontend.vercel.app
STRIPE_SECRET_KEY=sk_...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Run locally
```bash
npm install
npx prisma generate
npm run build
npm start
```

## Deploy to Railway/Render
1. Connect your GitHub repo
2. Set environment variables in dashboard
3. Build command: `npm run build`
4. Start command: `npm start`
