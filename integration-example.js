// Integration code for your Cloudflare Workers
// Add this to your src/index.ts file

// Configuration - replace with your actual proxy URL after deployment
const PROXY_URL = 'https://your-stack-exchange-proxy.vercel.app/api/proxy';

// Proxy fallback function
async function fetchViaProxy(stackExchangeUrl) {
  try {
    const proxyUrl = `${PROXY_URL}?url=${encodeURIComponent(stackExchangeUrl)}`;
    console.log('Trying proxy request:', proxyUrl.replace(stackExchangeUrl, '***URL***'));
    
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SocialMediaAPI/1.0 via Proxy'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Remove proxy metadata before returning
    if (data._proxy) {
      console.log('Proxy metadata:', data._proxy);
      delete data._proxy;
    }
    
    return data;
  } catch (error) {
    console.error('Proxy request failed:', error);
    throw error;
  }
}

// Enhanced fetch function with proxy fallback
async function fetchStackExchangeWithFallback(url, headers = {}) {
  try {
    console.log('Attempting direct Stack Exchange request...');
    
    // Try direct request first
    const directResponse = await fetch(url, { headers });
    
    if (directResponse.ok) {
      console.log('Direct request successful');
      return await directResponse.json();
    }
    
    // If blocked or rate limited, try proxy
    if (directResponse.status === 429 || directResponse.status === 403 || directResponse.status === 503) {
      console.log(`Direct request failed with ${directResponse.status}, trying proxy fallback...`);
      
      const proxyData = await fetchViaProxy(url);
      console.log('Proxy request successful');
      
      return proxyData;
    }
    
    // For other errors, throw
    throw new Error(`Stack Exchange API error: ${directResponse.status}`);
    
  } catch (error) {
    console.error('All Stack Exchange requests failed:', error);
    throw error;
  }
}

// Example: Update your questions endpoint
/*
app.get('/api/stack/questions', async (c) => {
  try {
    // Build your URL as usual
    let url = `https://api.stackexchange.com/2.3/questions?order=desc&sort=activity&site=${site}&filter=!nNPvSNP3wf&pagesize=${pageSize}&page=${page}`;
    
    // Add API key and access token
    const apiKey = c.env.STACK_API_KEY || await getStackConfig(c.env.DB, 'api_key');
    if (apiKey) {
      url += `&key=${apiKey}`;
    }
    
    if (accessToken) {
      url += `&access_token=${accessToken}`;
    }
    
    if (tagged) {
      url += `&tagged=${encodeURIComponent(tagged)}`;
    }
    
    // Use the enhanced fetch with fallback
    const data = await fetchStackExchangeWithFallback(url, {
      'User-Agent': 'SocialMediaAPI/1.0',
      'Accept': 'application/json'
    });
    
    if (data.items && data.items.length > 0) {
      const questions = data.items.map((question) => ({
        question_id: question.question_id,
        title: question.title,
        body: question.body,
        body_markdown: question.body_markdown,
        link: question.link,
        tags: question.tags,
        owner: question.owner,
        is_answered: question.is_answered,
        view_count: question.view_count,
        answer_count: question.answer_count,
        score: question.score,
        creation_date: question.creation_date,
        last_activity_date: question.last_activity_date
      }));
      
      return c.json({
        success: true,
        questions: questions,
        total_questions: data.items.length,
        has_more: data.has_more,
        quota_remaining: data.quota_remaining,
        page: parseInt(page),
        pagesize: parseInt(pageSize),
        timestamp: new Date().toISOString()
      });
    } else {
      return c.json({
        success: true,
        questions: [],
        total_questions: 0,
        has_more: false,
        quota_remaining: data.quota_remaining || 0,
        page: parseInt(page),
        pagesize: parseInt(pageSize),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    return c.json({ 
      error: 'Failed to fetch questions from Stack Overflow',
      message: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});
*/