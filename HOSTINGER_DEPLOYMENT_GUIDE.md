# 🚀 Hostinger Deployment Guide - ArenaX Gaming

## 📋 Overview

This guide covers **3 deployment methods** for Hostinger:

1. **Shared Hosting (hPanel)** - Budget-friendly, good for static sites
2. **Cloud/VPS Hosting** - Full control, supports Node.js backend
3. **Hybrid Approach** - Frontend on Hostinger + Backend elsewhere

---

## ⚡ Method 1: Shared Hosting (Static Export) - EASIEST

**Best for:** Demo/Portfolio sites, low traffic
**Cost:** ~$3-10/month
**Limitations:** No Node.js backend support

### Step 1: Build Static Site

```bash
cd frontend

# Install dependencies
npm install

# Build static export
npx next build
npx next export

# This creates an 'out' folder with static HTML/CSS/JS
```

### Step 2: Upload to Hostinger

1. **Login to Hostinger hPanel**
2. Go to **File Manager** → **public_html**
3. Upload contents of `frontend/out` folder
4. Or use FTP (FileZilla):
   - Host: `ftp.yourdomain.com`
   - Username: Your FTP username
   - Password: Your FTP password

### Step 3: Configure .htaccess

Create `.htaccess` file in `public_html`:

```apache
RewriteEngine On
RewriteBase /

# Handle Next.js routing
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Step 4: Update API Configuration

Since shared hosting doesn't support Node.js, you have two options:

**Option A: Use Serverless Functions**
- Move backend logic to Vercel/Netlify functions
- Update `NEXT_PUBLIC_API_URL` to point to serverless endpoints

**Option B: Deploy Backend Separately**
- Deploy Express backend to Railway/Render/Heroku
- Update API calls in frontend

Update `next.config.js`:
```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: 'https://your-backend.railway.app/api',
  },
};

module.exports = nextConfig;
```

---

## ☁️ Method 2: Cloud/VPS Hosting (Full Stack) - RECOMMENDED

**Best for:** Production apps, full features
**Cost:** ~$10-25/month
**Requirements:** SSH access, root privileges

### Step 1: Choose Hostinger Plan

You need:
- **Cloud Startup** or higher
- **VPS hosting** (Ubuntu/CentOS)

### Step 2: Connect via SSH

```bash
ssh root@your-server-ip
```

### Step 3: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Git
apt install -y git

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
apt install -y nginx
```

### Step 4: Clone Your Repository

```bash
cd /var/www
git clone https://github.com/vinod673/tournament.git arenax
cd arenax
```

### Step 5: Setup Frontend

```bash
cd /var/www/arenax/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Create PM2 ecosystem file
nano ../ecosystem.config.js
```

Add this to `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'arenax-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/arenax/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_url',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_anon_key',
        NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
      }
    },
    {
      name: 'arenax-backend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/arenax/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        SUPABASE_URL: 'your_supabase_url',
        SUPABASE_ANON_KEY: 'your_anon_key',
        SUPABASE_SERVICE_KEY: 'your_service_key',
      }
    }
  ]
};
```

### Step 6: Setup Environment Variables

```bash
# Frontend
cd /var/www/arenax/frontend
cp ../.env.example .env.local
nano .env.local

# Backend
cd /var/www/arenax/backend
cp ../.env.example .env
nano .env
```

Update with your actual values:
```env
# Frontend .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Backend .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
PORT=5000
NODE_ENV=production
```

### Step 7: Start Applications with PM2

```bash
cd /var/www/arenax
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Copy the command from `pm2 startup` output and run it.

### Step 8: Configure Nginx

```bash
nano /etc/nginx/sites-available/arenax
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSL (after certbot)
    # listen 443 ssl http2;
    # ssl_certificate /etc/lets/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/lets/live/yourdomain.com/privkey.pem;
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/arenax /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 9: Setup SSL Certificate (HTTPS)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to complete SSL setup.

### Step 10: Configure Firewall

```bash
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw enable
```

---

## 🔗 Method 3: Hybrid Approach - FASTEST

**Best for:** Quick deployment, minimal cost
**Cost:** Free - $5/month

### Architecture:
- **Frontend:** Hostinger Shared Hosting (static files)
- **Backend:** Railway/Render (free tier)
- **Database:** Supabase (free tier)

### Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `vinod673/tournament`
4. Set Root Directory: `backend`
5. Add environment variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   PORT=5000
   NODE_ENV=production
   ```
6. Deploy and get your URL (e.g., `https://tournament-production.up.railway.app`)

### Step 2: Build Static Frontend

```bash
cd frontend

# Update next.config.js
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: 'https://tournament-production.up.railway.app/api',
  },
};

module.exports = nextConfig;

# Build
npm install
npm run build
npx next export
```

### Step 3: Upload to Hostinger

Upload contents of `frontend/out` to `public_html` via FTP or File Manager.

---

## ✅ Post-Deployment Checklist

### For All Methods:

1. **Test Core Features:**
   - ✅ Homepage loads
   - ✅ Signup/Login works
   - ✅ Tournaments display
   - ✅ Registration works
   - ✅ Admin dashboard accessible

2. **Update Supabase CORS:**
   - Go to Supabase Dashboard → API Settings
   - Add your domain: `https://yourdomain.com`

3. **Environment Variables:**
   - Double-check all values are correct
   - Never commit `.env` files

4. **Performance:**
   - Enable gzip compression
   - Setup browser caching
   - Optimize images

5. **Security:**
   - HTTPS enabled
   - Security headers configured
   - Rate limiting on backend

---

## 🆘 Troubleshooting

### Frontend Issues

**Blank page after deployment:**
```bash
# Check build output
npm run build

# Verify .env.local has correct values
cat .env.local
```

**404 errors on refresh:**
- Configure `.htaccess` (shared hosting) or Nginx rewrite rules (VPS)

### Backend Issues

**API not responding:**
```bash
# Check if PM2 is running
pm2 status

# Check logs
pm2 logs arenax-backend
```

**CORS errors:**
- Update backend CORS configuration
- Add your domain to allowed origins

### Database Issues

**RLS policy errors:**
- Check Supabase RLS policies
- Ensure anon key has proper permissions

---

## 📊 Performance Optimization

### Shared Hosting:
- Enable gzip compression
- Minify CSS/JS
- Use CDN for assets
- Optimize images

### VPS:
- Setup Redis caching
- Enable Nginx caching
- Use PM2 cluster mode
- Configure database connection pooling

---

## 💰 Cost Comparison

| Method | Monthly Cost | Complexity | Best For |
|--------|-------------|------------|----------|
| Shared (Static) | $3-10 | Easy | Demo/Portfolio |
| VPS (Full Stack) | $10-25 | Medium | Production |
| Hybrid | Free-5 | Easy | MVP/Testing |

---

## 🎯 Recommendation

**For Production:** Use **Method 2 (VPS)** for full control and performance.

**For Testing/Demo:** Use **Method 3 (Hybrid)** - fastest and cheapest.

**Need Help?** Contact Hostinger 24/7 support via hPanel live chat.

---

## 📞 Support Resources

- [Hostinger Knowledge Base](https://www.hostinger.com/tutorials/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
