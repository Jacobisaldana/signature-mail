# Deployment Guide - MAS Signature Free

Complete guide for deploying to Dokploy and other platforms.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Supabase account with project set up
- Domain name (optional, for custom domain)

---

## 🚀 Deploy to Dokploy

### Step 1: Prepare Supabase

1. **Create Supabase Project** at https://supabase.com
2. **Create Storage Buckets**:
   ```sql
   -- In Supabase Dashboard > Storage

   -- Create 'icons' bucket (public)
   -- Upload these files to 'icons' bucket:
   - email.png
   - phone.png
   - website.png
   - linkedin.png
   - twitter.png
   - instagram.png
   - facebook.png
   - calendar.png

   -- Create 'avatars' bucket with these policies:
   ```

3. **Set up RLS Policies** for `avatars` bucket:

   **Policy 1: Public Read**
   ```sql
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'avatars');
   ```

   **Policy 2: Authenticated Users Can Upload to Their Folder**
   ```sql
   CREATE POLICY "Users can upload to own folder"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'avatars'
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

4. **Get Credentials**:
   - Go to Settings > API
   - Copy `Project URL` (VITE_SUPABASE_URL)
   - Copy `anon` / `public` key (VITE_SUPABASE_ANON_KEY)

### Step 2: Configure Dokploy

1. **Login to Dokploy Dashboard**

2. **Create New Application**:
   - Click "New Application"
   - Select "Docker Compose"
   - Connect your Git repository

3. **Set Environment Variables** in Dokploy:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_SUPABASE_AVATARS_BUCKET=avatars
   VITE_SUPABASE_ICONS_BUCKET=icons
   ```

4. **Configure Domain** (optional):
   - Add your custom domain in Dokploy
   - Update `docker-compose.yml` traefik labels with your domain

5. **Deploy**:
   - Click "Deploy"
   - Dokploy will build and deploy automatically

### Step 3: Verify Deployment

1. Visit your deployed URL
2. Sign up with email
3. Upload an avatar (should go to Supabase)
4. Create a signature
5. Copy and paste into Gmail/Outlook
6. Send test email

---

## 🐳 Manual Docker Deployment

### Build the Image

```bash
# Build with environment variables
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key-here \
  --build-arg VITE_SUPABASE_AVATARS_BUCKET=avatars \
  --build-arg VITE_SUPABASE_ICONS_BUCKET=icons \
  -t signature-mail:latest .
```

### Run the Container

```bash
docker run -d \
  --name signature-mail \
  -p 3000:80 \
  --restart unless-stopped \
  signature-mail:latest
```

Access at: http://localhost:3000

### Using Docker Compose

```bash
# Create .env file with your credentials
cat > .env <<EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_AVATARS_BUCKET=avatars
VITE_SUPABASE_ICONS_BUCKET=icons
EOF

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ☁️ Deploy to Other Platforms

### Vercel (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
# VITE_SUPABASE_AVATARS_BUCKET=avatars
# VITE_SUPABASE_ICONS_BUCKET=icons
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up

# Set environment variables in Railway dashboard
```

---

## 🔧 Troubleshooting

### Build Fails

**Problem**: `npm ci` fails
```bash
# Solution: Clear npm cache
docker build --no-cache ...
```

**Problem**: Build args not passed
```bash
# Solution: Check ARG names match exactly
# They must start with VITE_ to be exposed to the client
```

### Runtime Issues

**Problem**: App shows blank page
```bash
# Check Nginx logs
docker logs signature-mail

# Verify build output exists
docker exec signature-mail ls /usr/share/nginx/html
```

**Problem**: Images not loading (CORS)
```bash
# Check Supabase bucket is public
# Verify Storage URL is correct
# Check browser console for CORS errors
```

**Problem**: Authentication fails
```bash
# Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# Check Supabase Auth is enabled
# Verify email confirmations are sent
```

### Health Check Fails

```bash
# Test health endpoint
curl http://localhost:3000/health

# Should return: OK
```

---

## 🔐 Security Best Practices

### Environment Variables

✅ **DO**:
- Use Dokploy secrets for sensitive values
- Rotate Supabase keys periodically
- Use HTTPS in production
- Enable Supabase RLS policies

❌ **DON'T**:
- Commit `.env` files to Git
- Use service role key in frontend
- Disable Supabase Auth
- Expose admin endpoints

### Docker Security

```dockerfile
# Already implemented in Dockerfile:
- Multi-stage build (smaller attack surface)
- Non-root user (nginx runs as nginx user)
- Health checks
- Minimal Alpine base image
- No unnecessary packages
```

---

## 📊 Monitoring

### Logs

```bash
# Dokploy
# View in dashboard: Logs tab

# Docker Compose
docker-compose logs -f app

# Docker
docker logs -f signature-mail
```

### Metrics

```bash
# Container stats
docker stats signature-mail

# Health status
docker inspect signature-mail | grep -A 5 Health
```

### Uptime Monitoring

Set up uptime monitoring for:
- Main app: `https://your-domain.com/`
- Health endpoint: `https://your-domain.com/health`

Recommended services:
- UptimeRobot (free)
- Better Uptime
- Pingdom

---

## 🔄 Updates & Rollbacks

### Update to New Version

```bash
# Dokploy: Just push to Git, auto-deploys

# Docker Compose:
docker-compose pull
docker-compose up -d

# Manual:
docker pull signature-mail:latest
docker stop signature-mail
docker rm signature-mail
docker run -d --name signature-mail -p 3000:80 signature-mail:latest
```

### Rollback

```bash
# Dokploy: Revert in Git, redeploy

# Docker:
docker run -d --name signature-mail -p 3000:80 signature-mail:previous-tag
```

---

## 🎯 Performance Optimization

### Already Implemented

✅ Gzip compression (Nginx)
✅ Cache static assets (1 year)
✅ Optimized Docker layers
✅ Multi-stage build (70% smaller image)
✅ Health checks
✅ Image optimization (<50KB avatars)

### Optional Improvements

1. **CDN**: Put Cloudflare in front
2. **Caching**: Add Redis for session storage
3. **Scaling**: Use Docker Swarm or Kubernetes
4. **Monitoring**: Add Prometheus + Grafana

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_SUPABASE_URL` | ✅ Yes | - | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | - | Supabase anon/public key |
| `VITE_SUPABASE_AVATARS_BUCKET` | No | `avatars` | Bucket name for user avatars |
| `VITE_SUPABASE_ICONS_BUCKET` | No | `icons` | Bucket name for social icons |

---

## 🆘 Support

For issues:
1. Check Dokploy logs
2. Check browser console
3. Verify Supabase credentials
4. Review this deployment guide
5. Open GitHub issue with logs

---

## ✅ Deployment Checklist

Before going live:

- [ ] Supabase project created
- [ ] `icons` bucket created and populated
- [ ] `avatars` bucket created with RLS policies
- [ ] Environment variables set in Dokploy
- [ ] Domain configured (optional)
- [ ] SSL/HTTPS enabled
- [ ] Test signup/signin
- [ ] Test avatar upload
- [ ] Test signature creation
- [ ] Test copy/paste to Gmail
- [ ] Test copy/paste to Outlook
- [ ] Send test email
- [ ] Set up uptime monitoring
- [ ] Configure backups (Supabase auto-backups)

**Ready to deploy! 🚀**
