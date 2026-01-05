#!/bin/bash

# ============================================
# ScaleFit VPS Deployment Script
# ============================================

set -e

echo "🚀 ScaleFit Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create a .env file with required environment variables."
    echo ""
    echo "Required variables:"
    echo "  POSTGRES_USER=scalefit"
    echo "  POSTGRES_PASSWORD=your_secure_password"
    echo "  POSTGRES_DB=scalefit"
    echo "  JWT_SECRET=your_jwt_secret"
    echo "  NEXT_PUBLIC_API_URL=http://your-vps-ip:3001"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '#' | xargs)

echo -e "${YELLOW}Step 1: Pulling latest code...${NC}"
git pull origin main

echo -e "${YELLOW}Step 2: Building Docker images...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}Step 3: Stopping existing containers...${NC}"
docker-compose down

echo -e "${YELLOW}Step 4: Starting containers...${NC}"
docker-compose up -d

echo -e "${YELLOW}Step 5: Running database migrations...${NC}"
sleep 10  # Wait for database to be ready
docker-compose exec -T backend npx prisma migrate deploy

echo -e "${YELLOW}Step 6: Checking container health...${NC}"
sleep 5
docker-compose ps

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your app is now running at:"
echo "  - Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "  - Backend API: http://$(hostname -I | awk '{print $1}'):3001"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"

