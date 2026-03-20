#!/bin/bash

# ArenaX Gaming - Hostinger VPS Deployment Script
# Automated deployment for Ubuntu/CentOS servers

set -e  # Exit on error

echo "🎮 ArenaX Gaming - Hostinger VPS Deployment"
echo "==========================================="
echo ""

# Configuration
DOMAIN_NAME=""
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_KEY=""
EMAIL=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root (use sudo -i)${NC}"
  exit 1
fi

# Get configuration
echo -e "${YELLOW}Enter your domain name (e.g., example.com):${NC}"
read DOMAIN_NAME

echo -e "${YELLOW}Enter Supabase URL:${NC}"
read SUPABASE_URL

echo -e "${YELLOW}Enter Supabase Anon Key:${NC}"
read SUPABASE_ANON_KEY

echo -e "${YELLOW}Enter Supabase Service Key:${NC}"
read SUPABASE_SERVICE_KEY

echo -e "${YELLOW}Enter email for SSL certificate:${NC}"
read EMAIL

echo ""
echo -e "${GREEN}Starting deployment...${NC}"
echo ""

# Step 1: Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install Node.js
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Step 3: Install Git
echo "📦 Installing Git..."
apt install -y git

# Step 4: Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Step 5: Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Step 6: Clone repository
echo "📦 Cloning repository..."
cd /var/www
git clone https://github.com/vinod673/tournament.git arenax
cd arenax

# Step 7: Setup environment files
echo "⚙️  Setting up environment variables..."

# Frontend .env.local
cat > frontend/.env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NODE_ENV=production
EOF

# Backend .env
cat > backend/.env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
PORT=5000
NODE_ENV=production
EOF

# Step 8: Create PM2 ecosystem file
echo "⚙️  Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js <<EOF
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
      }
    }
  ]
};
EOF

# Step 9: Install dependencies and build
echo "📦 Installing dependencies..."
cd frontend
npm install
npm run build

cd ../backend
npm install

# Step 10: Start applications with PM2
echo "🚀 Starting applications with PM2..."
cd /var/www/arenax
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo -e "${YELLOW}IMPORTANT: Copy and run the PM2 startup command above!${NC}"
echo ""

# Step 11: Configure Nginx
echo "⚙️  Configuring Nginx..."
cat > /etc/nginx/sites-available/arenax <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/arenax /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Step 12: Install SSL certificate
echo "🔒 Installing SSL certificate..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email $EMAIL

# Step 13: Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

# Final status
echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo "🌐 Your website is live at: https://$DOMAIN_NAME"
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📝 Useful Commands:"
echo "   pm2 status              - Check application status"
echo "   pm2 logs                - View logs"
echo "   pm2 restart all         - Restart all apps"
echo "   systemctl status nginx  - Check Nginx status"
echo "   tail -f /var/log/nginx/error.log - Nginx error log"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update Supabase CORS settings to include: https://$DOMAIN_NAME"
echo "2. Test signup/login functionality"
echo "3. Verify tournament creation works"
echo ""
echo "🎉 Happy Gaming!"
