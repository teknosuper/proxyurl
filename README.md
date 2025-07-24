# Stack Exchange API Proxy

A simple proxy service deployed on Vercel to bypass Cloudflare Workers IP blocking issues with Stack Exchange API.

## 🚀 Quick Deploy

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd stack-exchange-proxy
   npm install
   vercel --prod
   ```

3. **Your proxy will be available at:**
   ```
   https://your-project-name.vercel.app/api/proxy
   ```

### Option 2: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   cd stack-exchange-proxy
   railway login
   railway init
   railway up
   ```

## 📖 Usage

### Basic Usage
```bash
GET https://your-proxy.vercel.app/api/proxy?url=ENCODED_STACK_EXCHANGE_URL
```

### Example Requests
```bash
# Get Stack Overflow questions
curl "https://your-proxy.vercel.app/api/proxy?url=https%3A//api.stackexchange.com/2.3/questions%3Fsite%3Dstackoverflow%26pagesize%3D10"

# Get specific question
curl "https://your-proxy.vercel.app/api/proxy?url=https%3A//api.stackexchange.com/2.3/questions/123456%3Fsite%3Dstackoverflow"

# With API key
curl "https://your-proxy.vercel.app/api/proxy?url=https%3A//api.stackexchange.com/2.3/questions%3Fsite%3Dstackoverflow%26key%3DYOUR_API_KEY"
```

## 🔧 Integration with Cloudflare Workers

Add this fallback function to your Cloudflare Workers code:

```javascript
// Add this to your Cloudflare Workers
const PROXY_URL = 'https://your-proxy.vercel.app/api/proxy';

async function fetchViaProxy(stackExchangeUrl) {
  const proxyUrl = `${PROXY_URL}?url=${encodeURIComponent(stackExchangeUrl)}`;
  
  const response = await fetch(proxyUrl);
  
  if (!response.ok) {
    throw new Error(`Proxy request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Remove proxy metadata before returning
  delete data._proxy;
  
  return data;
}

// Use in your existing code
app.get('/api/stack/questions', async (c) => {
  try {
    // ... build your Stack Exchange URL ...
    
    // Try direct request first
    let response = await fetch(stackExchangeUrl, { headers });
    
    if (!response.ok && (response.status === 429 || response.status === 403)) {
      console.log('Direct request failed, trying proxy...');
      
      // Fallback to proxy
      const data = await fetchViaProxy(stackExchangeUrl);
      return c.json({
        success: true,
        questions: data.items.map(/* your mapping */),
        note: 'Response via proxy service'
      });
    }
    
    // Continue with normal processing...
  } catch (error) {
    // Handle errors...
  }
});
```

## 🛡️ Security Features

- ✅ Only allows Stack Exchange API URLs
- ✅ CORS enabled for cross-origin requests
- ✅ Request validation and sanitization
- ✅ Error handling and logging
- ✅ Rate limiting protection

## 📊 Response Format

The proxy adds metadata to responses:

```json
{
  "items": [...],
  "has_more": true,
  "quota_remaining": 9999,
  "_proxy": {
    "service": "Vercel Proxy",
    "timestamp": "2024-01-20T10:30:00.000Z",
    "original_url": "https://api.stackexchange.com/2.3/questions?...",
    "status": "success"
  }
}
```

## 🔍 Testing

```bash
# Test the proxy
curl "https://your-proxy.vercel.app/api/proxy?url=https%3A//api.stackexchange.com/2.3/questions%3Fsite%3Dstackoverflow%26pagesize%3D1"

# Should return Stack Exchange data with _proxy metadata
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Invalid URL" error:**
   - Make sure the URL is properly encoded
   - Only Stack Exchange API URLs are allowed

2. **CORS errors:**
   - The proxy includes CORS headers automatically
   - Make sure you're using the correct proxy URL

3. **Rate limiting:**
   - The proxy doesn't add rate limiting, but Stack Exchange API limits still apply
   - Use API keys and access tokens for higher limits

### Debug Mode:
Check Vercel function logs:
```bash
vercel logs
```

## 💡 Alternative Deployment Options

### Netlify Functions
```javascript
// netlify/functions/proxy.js
exports.handler = async (event, context) => {
  // Similar implementation
}
```

### Railway
```javascript
// server.js
const express = require('express');
const app = express();
// Similar implementation
```

## 📈 Monitoring

- Monitor via Vercel dashboard
- Check function logs for errors
- Set up alerts for high error rates