# WorldBest Deployment Guide

## 🚀 Deploy to Vercel

### Step 1: Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select "worldbest-deploy" from your GitHub repositories
4. Click "Import"

### Step 2: Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Database (Supabase)
```
POSTGRES_URL=postgres://postgres.tcwuhdgsizydhtbbgirw:zYrVDG92abYmeX3b@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_PRISMA_URL=postgres://postgres.tcwuhdgsizydhtbbgirw:zYrVDG92abYmeX3b@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://postgres.tcwuhdgsizydhtbbgirw:zYrVDG92abYmeX3b@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

#### Supabase Configuration
```
SUPABASE_URL=https://tcwuhdgsizydhtbbgirw.supabase.co
SUPABASE_JWT_SECRET=1kDrjWjBlOfinP/jHFb8Xa9zvu1JAAcmCPJxrOuxzyWgm3GxcdXIamOv46sNps6iocGH7R49XX2cpE6bw5j0dg==
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjd3VoZGdzaXp5ZGh0YmJnaXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgwNDc1MCwiZXhwIjoyMDc2MzgwNzUwfQ.ULFqQa89WIT4wkQ4t8EtW3kqKpuK3TJjFsdFb7_p4F4
```

#### Public Variables (Frontend)
```
NEXT_PUBLIC_SUPABASE_URL=https://tcwuhdgsizydhtbbgirw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjd3VoZGdzaXp5ZGh0YmJnaXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDQ3NTAsImV4cCI6MjA3NjM4MDc1MH0.VBCzSM0mDxwwhxvVT61pJ-wq7MyKqN2SyLfzek0HUaA
```

### Step 3: Deploy

Click "Deploy" and wait 2-5 minutes for the build to complete.

---

## 📝 Quick Copy-Paste for Vercel

Use this format for adding to Vercel (one per line):

```
POSTGRES_URL="postgres://postgres.tcwuhdgsizydhtbbgirw:zYrVDG92abYmeX3b@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_PRISMA_URL="postgres://postgres.tcwuhdgsizydhtbbgirw:zYrVDG92abYmeX3b@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://postgres.tcwuhdgsizydhtbbgirw:zYrVDG92abYmeX3b@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
SUPABASE_URL="https://tcwuhdgsizydhtbbgirw.supabase.co"
SUPABASE_JWT_SECRET="1kDrjWjBlOfinP/jHFb8Xa9zvu1JAAcmCPJxrOuxzyWgm3GxcdXIamOv46sNps6iocGH7R49XX2cpE6bw5j0dg=="
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjd3VoZGdzaXp5ZGh0YmJnaXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgwNDc1MCwiZXhwIjoyMDc2MzgwNzUwfQ.ULFqQa89WIT4wkQ4t8EtW3kqKpuK3TJjFsdFb7_p4F4"
NEXT_PUBLIC_SUPABASE_URL="https://tcwuhdgsizydhtbbgirw.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjd3VoZGdzaXp5ZGh0YmJnaXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDQ3NTAsImV4cCI6MjA3NjM4MDc1MH0.VBCzSM0mDxwwhxvVT61pJ-wq7MyKqN2SyLfzek0HUaA"
```

---

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` (not pushed to GitHub)
- ✅ `.env.example` is safe to commit (template only)
- ✅ Sensitive keys are only in Vercel environment variables
- ✅ `NEXT_PUBLIC_*` variables are safe for frontend (public)
- ⚠️ Never commit `.env.local` or share service role keys publicly

---

## 🏗️ Database Setup

If you need to set up database tables, you can:

1. **Use Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project
   - Use SQL Editor or Table Editor

2. **Use Prisma Migrations** (if using Prisma)
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Run SQL Scripts**
   - Connect to your database
   - Run schema creation scripts

---

## 📊 What's Configured

- ✅ **Database**: Supabase PostgreSQL (connection pooling enabled)
- ✅ **Authentication**: Supabase Auth (JWT configured)
- ✅ **Storage**: Supabase Storage (if needed)
- ✅ **Real-time**: Supabase Realtime (if needed)

---

## 🎯 After Deployment

1. **Test the Application**
   - Visit your Vercel URL
   - Test database connectivity
   - Verify authentication works

2. **Monitor Logs**
   - Check Vercel deployment logs
   - Monitor Supabase dashboard for queries

3. **Set Up Custom Domain** (Optional)
   - Add domain in Vercel settings
   - Update DNS records

---

## 🆘 Troubleshooting

### Database Connection Issues

If you see database errors:
1. Check environment variables are set correctly in Vercel
2. Verify Supabase project is active
3. Check connection string format
4. Ensure SSL mode is enabled

### Build Failures

If build fails:
1. Check build logs in Vercel
2. Verify all dependencies are in package.json
3. Check for TypeScript errors
4. Ensure environment variables are set

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Repository**: https://github.com/ReeseAstor/worldbest-deploy  
**Last Updated**: October 18, 2025

