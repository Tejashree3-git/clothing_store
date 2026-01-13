#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Go to backend directory
cd "$(dirname "$0")/backend_nodejs"

# Install dependencies
echo "🔧 Installing dependencies..."
npm install --production

# Set environment to production
export NODE_ENV=production

# If .env.production exists, use it, otherwise use .env
if [ -f ".env.production" ]; then
  echo "🔧 Using production environment variables..."
  cp .env.production .env
elif [ ! -f ".env" ]; then
  echo "❌ Error: No .env or .env.production file found!"
  exit 1
fi

# Run database migrations if needed
# echo "🔄 Running database migrations..."
# npx mongoose-migrate up

# Seed the database (uncomment if needed)
# echo "🌱 Seeding database..."
# node seed/seed.js

# Restart the application
if [ -x "$(command -v pm2)" ]; then
  echo "🔄 Restarting application with PM2..."
  pm2 delete clothing-store-api || true
  pm2 start server.js --name "clothing-store-api"
  pm2 save
  pm2 startup
else
  echo "⚠️  PM2 not found. Installing PM2 globally..."
  npm install -g pm2
  echo "🔄 Starting application with PM2..."
  pm2 start server.js --name "clothing-store-api"
  pm2 save
  pm2 startup
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Application should be running at http://localhost:5000"
echo "📚 API Documentation available at http://localhost:5000/api-docs"
