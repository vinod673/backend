# 🚀 Hostinger Shared Hosting - Quick Deploy (5 Minutes)

## ⚡ Prerequisites

- Hostinger Shared Hosting account (any plan)
- FTP client (FileZilla) or File Manager access
- Your Supabase credentials

---

## 📋 Step-by-Step Guide

### Step 1: Build Static Site (2 minutes)

Open PowerShell in your project folder:

```powershell
cd frontend

# Install dependencies (if not already done)
npm install

# Build static export
npx next build
npx next export

# This creates an 'out' folder with static files
```

### Step 2: Upload to Hostinger (2 minutes)

#### Option A: Using File Manager (Easiest)

1. **Login to Hostinger hPanel**
2. Go to **File Manager**
3. Navigate to `public_html` folder
4. Click **Upload** → Select all files from `frontend/out` folder
5. Wait for upload to complete

#### Option B: Using FTP (Recommended for large files)

1. **Get FTP credentials from hPanel:**
   - Go to **FTP Accounts**
   - Note down: Host, Username, Password

2. **Connect with FileZilla:**
   - Host: `ftp.yourdomain.com`
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

3. **Upload files:**
   - Local: Select all files from `frontend/out`
   - Remote: `/public_html/`
   - Transfer and wait

### Step 3: Create .htaccess File (1 minute)

In File Manager, create `.htaccess` in `public_html`:

```apache
RewriteEngine On
RewriteBase /

# Handle Next.js routing
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable compression
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

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## 🔧 Backend Setup (Required!)

Since shared hosting doesn't support Node.js, you need to deploy the backend separately.

### Option 1: Railway (Free & Easy)

1. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Login with GitHub
   - New Project → Deploy from GitHub
   - Select `vinod673/tournament`
   - Root Directory: `backend`
   
2. **Add Environment Variables:**
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   PORT=5000
   NODE_ENV=production
   ```

3. **Get your URL** (e.g., `https://tournament-production.up.railway.app`)

4. **Update Frontend Configuration:**
   
   Before building, update `frontend/next.config.js`:
   ```javascript
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
   ```

   Then rebuild:
   ```bash
   npm run build
   npx next export
   ```

### Option 2: Render (Alternative Free Tier)

1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables (same as Railway)

---

## ✅ Final Configuration

### Update Supabase CORS Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **API Settings**
4. Under **CORS Origins**, add:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   http://localhost:3000
   ```
5. Click **Save**

### Test Your Deployment

Visit your domain and test:
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Images display correctly
- ✅ API calls work (check browser console)
- ✅ Signup/Login functional

---

## 🆘 Troubleshooting

### Blank Page / White Screen

**Problem:** JavaScript not loading

**Solution:**
1. Check browser console for errors
2. Verify all files uploaded correctly
3. Re-upload the `out` folder

### 404 on Page Refresh

**Problem:** Server routing issue

**Solution:**
- Ensure `.htaccess` file is in `public_html`
- Check that mod_rewrite is enabled (usually is by default)

### API Calls Failing (CORS Error)

**Problem:** CORS not configured

**Solution:**
1. Update Supabase CORS settings (see above)
2. Check backend CORS configuration
3. Verify `NEXT_PUBLIC_API_URL` is correct

### Images Not Loading

**Problem:** Path issues

**Solution:**
- Use absolute paths for images
- Or configure `assetPrefix` in `next.config.js`

```javascript
const nextConfig = {
  output: 'export',
  assetPrefix: '/',
  images: { unoptimized: true },
};
```

---

## 💰 Cost Breakdown

| Service | Cost | What it's for |
|---------|------|---------------|
| Hostinger Shared | $2.99/mo | Frontend hosting |
| Railway/Render | FREE | Backend API |
| Supabase | FREE | Database & Auth |
| **Total** | **$2.99/mo** | Full stack app! |

---

## 📊 Performance Tips

### Optimize Images
```bash
# Compress images before upload
npm install -g imagemin-cli
imagemin public/images/* --out-dir=public/images-optimized
```

### Enable CDN
- Hostinger includes free Cloudflare CDN
- Enable it in hPanel → Advanced → Cloudflare

### Minify Assets
Next.js already minifies, but you can add:
```javascript
// next.config.js
const nextConfig = {
  output: 'export',
  compress: true,
  images: { unoptimized: true },
};
```

---

## 🎯 Quick Checklist

Before going live:

- [ ] Built static site (`npm run build && npx next export`)
- [ ] Uploaded all files to `public_html`
- [ ] Created `.htaccess` file
- [ ] Deployed backend to Railway/Render
- [ ] Updated `NEXT_PUBLIC_API_URL`
- [ ] Configured Supabase CORS
- [ ] Tested all features
- [ ] Enabled SSL (HTTPS) in hPanel
- [ ] Enabled Cloudflare CDN

---

## 📞 Need Help?

- **Hostinger Support:** 24/7 live chat in hPanel
- **Railway Support:** Discord community
- **Supabase Docs:** https://supabase.com/docs

---

## 🎉 You're Live!

Your ArenaX Gaming platform is now accessible at:
- **Frontend:** `https://yourdomain.com`
- **Backend API:** `https://your-backend.railway.app/api`
- **Database:** Supabase (cloud)

**Next Steps:**
1. Share with friends! 🎮
2. Monitor usage in Supabase dashboard
3. Consider upgrading hosting as you grow
4. Setup Google Analytics for tracking

Good luck with your esports tournament platform! 🏆
