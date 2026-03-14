# WorldBest Deployment Quick Reference

## \ud83d\ude80 Quick Deploy Commands

### Local Development
```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
# Configure .env.local with your credentials
pnpm dev
```

### Docker Deployment
```bash
docker build -t worldbest:latest .
docker run -d -p 3000:3000 --env-file .env.local worldbest:latest
curl http://localhost:3000/api/health
```

### Vercel Deployment
```bash
# Manual deployment
vercel --prod

# Automatic via Git
git push origin main  # Production
git push origin develop  # Staging
```

### Validation
```bash
./validate-deployment.sh
```

---

## \ud83d\udd11 Required Environment Variables

### Critical (Required for deployment)
```bash
POSTGRES_URL="postgres://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
CRON_SECRET="your-secure-random-string"
```

### Optional (Enable when ready)
```bash
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
SENTRY_DSN="https://..."
```

---

## \ud83d\udd0d Health Check Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|------------------|
| `/api/health` | Application health | `{"status":"healthy"}` |
| `/api/cron/cleanup` | Daily cleanup job | Authenticated only |
| `/api/cron/analytics` | Analytics job | Authenticated only |

---

## \ud83d\udea6 Deployment Checklist

### Pre-Deployment
- [ ] Run `./validate-deployment.sh`
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] No TypeScript errors
- [ ] Build completes successfully

### Post-Deployment
- [ ] Health check returns 200
- [ ] Critical user flows work
- [ ] No error spikes in Sentry
- [ ] Performance metrics acceptable
- [ ] Analytics tracking fires correctly

---

## \ud83d\udd27 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
pnpm clean
rm -rf .next node_modules
pnpm install --frozen-lockfile
pnpm build
```

### Docker Issues
```bash
# Check logs
docker logs <container-id>

# Rebuild without cache
docker build --no-cache -t worldbest:latest .
```

### Environment Variables Not Loading
1. Verify variables in Vercel Dashboard
2. Check `NEXT_PUBLIC_` prefix for client-side variables
3. Redeploy after adding new variables

---

## \ud83d\udcca CI/CD Pipeline

### Triggers
- **Pull Request** \u2192 Preview deployment
- **Push to `develop`** \u2192 Staging deployment  
- **Push to `main`** \u2192 Production deployment

### Quality Gates
1. ESLint (code quality)
2. TypeScript (type checking)
3. Build verification
4. Bundle size check (<350KB)

### Rollback
If deployment fails, previous version remains active.

---

## \ud83d\udcc4 Documentation

- **Full Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Validation**: `./validate-deployment.sh`

---

## \ud83d\udd17 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: `.github/workflows/ci-cd.yml`
- **Docker Hub**: (configure if using registry)
- **Monitoring**: (configure Sentry/Datadog)

---

**Last Updated**: 2025-10-22  
**Version**: 1.0.0  
**Status**: \u2705 Production Ready
