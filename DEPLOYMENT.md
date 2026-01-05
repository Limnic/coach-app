# 🚀 ScaleFit VPS Deployment Guide

This guide will help you deploy ScaleFit to your VPS for testing with both coach and athlete accounts.

## Prerequisites

- VPS with Ubuntu 22.04+ (or similar Linux distro)
- Minimum 2GB RAM, 2 CPU cores
- Domain name (optional, for HTTPS)
- SSH access to your server

---

## Option 1: Docker Deployment (Recommended)

### Step 1: Server Setup

SSH into your VPS and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add your user to docker group (logout and login after)
sudo usermod -aG docker $USER

# Install Git
sudo apt install git -y
```

### Step 2: Clone Repository

```bash
# Clone your repository
git clone https://github.com/your-username/coach-app.git
cd coach-app
```

### Step 3: Configure Environment

```bash
# Create environment file
nano .env
```

Add these variables:

```env
# Database
POSTGRES_USER=scalefit
POSTGRES_PASSWORD=ChangeMeToSecurePassword123!
POSTGRES_DB=scalefit

# JWT Secret (generate with: openssl rand -hex 64)
JWT_SECRET=your_64_character_secret_here

# API URL (replace with your VPS IP or domain)
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:3001
```

Generate a secure JWT secret:
```bash
openssl rand -hex 64
```

### Step 4: Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Or manually:
```bash
docker-compose up -d --build
```

### Step 5: Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test API
curl http://localhost:3001/api/health
```

Your app is now running at:
- **Frontend**: `http://YOUR_VPS_IP:3000`
- **API**: `http://YOUR_VPS_IP:3001`

---

## Option 2: Manual Deployment (Without Docker)

### Step 1: Install Node.js

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE USER scalefit WITH PASSWORD 'your_secure_password';
CREATE DATABASE scalefit OWNER scalefit;
GRANT ALL PRIVILEGES ON DATABASE scalefit TO scalefit;
EOF
```

### Step 3: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Step 4: Clone and Setup

```bash
# Clone repository
git clone https://github.com/your-username/coach-app.git
cd coach-app

# Install dependencies
npm install

# Create backend environment
cat > apps/backend/.env << EOF
DATABASE_URL=postgresql://scalefit:your_secure_password@localhost:5432/scalefit
JWT_SECRET=$(openssl rand -hex 64)
PORT=3001
NODE_ENV=production
EOF

# Create frontend environment
cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:3001
EOF
```

### Step 5: Build and Deploy

```bash
# Generate Prisma client and run migrations
cd apps/backend
npx prisma generate
npx prisma migrate deploy

# Build backend
npm run build

# Build frontend
cd ../web
npm run build
cd ../..

# Start with PM2
pm2 start apps/backend/dist/main.js --name "scalefit-api"
pm2 start npm --name "scalefit-web" -- run start --prefix apps/web

# Save PM2 config
pm2 save
pm2 startup
```

---

## Setting Up Nginx (Recommended for Production)

### Step 1: Install Nginx

```bash
sudo apt install nginx -y
```

### Step 2: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/scalefit
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Or use _ for any

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/scalefit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Setting Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
```

---

## Testing with Coach and Athlete

### Create Test Accounts

1. **Register a Coach Account**
   - Go to `http://YOUR_VPS_IP:3000/register`
   - Register with role "Coach"

2. **Register Athlete Accounts**
   - Open in incognito/different browser
   - Register with role "Athlete"
   - Connect to coach (you'll need to add this athlete to the coach in the database)

### Quick Database Seed (Optional)

```bash
# SSH into your VPS
docker-compose exec backend npx prisma db seed

# Or for manual deployment:
cd apps/backend && npx prisma db seed
```

---

## Useful Commands

### Docker

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U scalefit -d scalefit

# Run Prisma Studio
docker-compose exec backend npx prisma studio
```

### PM2 (Manual Deployment)

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart all
pm2 restart all

# Monitor resources
pm2 monit
```

---

## Firewall Configuration

```bash
# Allow required ports
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw allow 3000   # Frontend (if not using nginx)
sudo ufw allow 3001   # API (if not using nginx)

# Enable firewall
sudo ufw enable
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check if ports are in use
sudo lsof -i :3000
sudo lsof -i :3001
```

### Database connection failed

```bash
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Manually test connection
docker-compose exec postgres psql -U scalefit -d scalefit
```

### Frontend can't connect to API

1. Check `NEXT_PUBLIC_API_URL` in your `.env`
2. Ensure it's using your public IP, not `localhost`
3. Check CORS settings in backend

---

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://YOUR_IP:3000 |
| Backend API | 3001 | http://YOUR_IP:3001 |
| PostgreSQL | 5432 | Internal only |
| Nginx | 80/443 | http://your-domain.com |

---

## Mobile Testing

To test from your phone on the same network:

1. Find your VPS public IP
2. Open `http://YOUR_VPS_IP:3000` on your phone browser
3. For a more native experience, add to home screen (PWA)

For testing outside your network, you'll need:
- A domain name pointing to your VPS
- SSL certificate (Let's Encrypt)
- Proper firewall configuration

