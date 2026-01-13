#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting frontend deployment process..."

# Go to frontend directory
cd "$(dirname "$0")/frontend"

# Install dependencies
echo "🔧 Installing dependencies..."
npm install

# Build the React app
echo "🔨 Building the React app..."
npm run build

echo "✅ Frontend build completed successfully!"
echo "📦 Build files are ready in the 'build' directory"
echo "🚀 You can now deploy the contents of the 'build' directory to your web server"
