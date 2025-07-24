#!/bin/bash

echo "🚀 Deploying Stack Exchange Proxy to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "1. Copy the deployment URL from above"
echo "2. Update PROXY_URL in your Cloudflare Workers code"
echo "3. Deploy your Cloudflare Workers with: npm run deploy"