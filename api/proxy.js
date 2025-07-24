// Stack Exchange API Proxy for Vercel
// This proxy forwards requests to Stack Exchange API to bypass IP blocking

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ 
        error: 'Missing URL parameter',
        usage: 'GET /api/proxy?url=https://api.stackexchange.com/2.3/questions?...'
      });
    }

    // Validate that the URL is for Stack Exchange API
    if (!url.startsWith('https://api.stackexchange.com/')) {
      return res.status(400).json({ 
        error: 'Invalid URL - only Stack Exchange API URLs are allowed',
        provided: url
      });
    }

    console.log('Proxying request to:', url);

    // Forward the request to Stack Exchange API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'StackExchangeProxy/1.0 (Vercel Proxy Service)',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive'
      }
    });

    console.log('Stack Exchange response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stack Exchange API error:', response.status, errorText);
      
      return res.status(response.status).json({
        error: 'Stack Exchange API request failed',
        status: response.status,
        message: errorText.substring(0, 500)
      });
    }

    const data = await response.json();
    
    // Add proxy metadata
    const proxyResponse = {
      ...data,
      _proxy: {
        service: 'Vercel Proxy',
        timestamp: new Date().toISOString(),
        original_url: url,
        status: 'success'
      }
    };

    return res.status(200).json(proxyResponse);

  } catch (error) {
    console.error('Proxy error:', error);
    
    return res.status(500).json({
      error: 'Proxy service error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}