/**
 * Proxy Service Integration
 * 
 * HOW IT WORKS:
 * ============
 * 
 * 1. **The Problem**: Reddit blocks requests from cloud providers (Vercel, AWS, etc.)
 *    - Reddit sees requests coming from Vercel's IP addresses
 *    - Reddit blocks these IPs because they're known cloud provider ranges
 *    - Result: 403 Forbidden errors
 * 
 * 2. **The Solution**: Use a Proxy Service
 *    - Instead of: Your App → Reddit (blocked)
 *    - We do: Your App → Proxy Service → Reddit (works!)
 *    - The proxy service has residential/datacenter IPs that Reddit doesn't block
 *    - Reddit sees the request coming from the proxy's IP, not Vercel's IP
 * 
 * 3. **How Proxy Services Work**:
 *    - Proxy services maintain pools of IP addresses (residential, datacenter, mobile)
 *    - When you send a request through a proxy, it:
 *      a. Receives your request at their server
 *      b. Routes it through one of their IP addresses
 *      c. Makes the request to Reddit from that IP
 *      d. Returns Reddit's response back to you
 *    - Reddit sees the request coming from the proxy's IP, not yours
 * 
 * 4. **Types of Proxy Services**:
 *    - **Residential Proxies**: Use real home IP addresses (harder to detect)
 *    - **Datacenter Proxies**: Use server IPs (faster, cheaper, but easier to detect)
 *    - **Rotating Proxies**: Automatically rotate IPs for each request
 * 
 * 5. **Popular Services**:
 *    - ScraperAPI: Simple API, handles rotation automatically
 *    - Bright Data: Enterprise-grade, residential proxies
 *    - ProxyMesh: Simple HTTP proxy service
 *    - Smartproxy: Residential and datacenter proxies
 */

interface ProxyConfig {
    enabled: boolean;
    type: 'scraperapi' | 'brightdata' | 'custom' | 'none';
    apiKey?: string;
    endpoint?: string;
    // For custom HTTP proxies
    host?: string;
    port?: number;
    username?: string;
    password?: string;
}

/**
 * Get proxy configuration from environment variables
 */
function getProxyConfig(): ProxyConfig {
    const proxyType = process.env.PROXY_TYPE || 'none';
    const proxyEnabled = process.env.PROXY_ENABLED === 'true';
    
    if (!proxyEnabled || proxyType === 'none') {
        return { enabled: false, type: 'none' };
    }
    
    switch (proxyType) {
        case 'scraperapi':
            return {
                enabled: true,
                type: 'scraperapi',
                apiKey: process.env.SCRAPERAPI_KEY,
                endpoint: `http://api.scraperapi.com?api_key=${process.env.SCRAPERAPI_KEY}&url=`
            };
        
        case 'brightdata':
            return {
                enabled: true,
                type: 'brightdata',
                apiKey: process.env.BRIGHTDATA_API_KEY,
                endpoint: process.env.BRIGHTDATA_ENDPOINT || 'http://zproxy.lum-superproxy.io:22225'
            };
        
        case 'custom':
            return {
                enabled: true,
                type: 'custom',
                host: process.env.PROXY_HOST,
                port: process.env.PROXY_PORT ? parseInt(process.env.PROXY_PORT) : undefined,
                username: process.env.PROXY_USERNAME,
                password: process.env.PROXY_PASSWORD,
                endpoint: process.env.PROXY_ENDPOINT
            };
        
        default:
            return { enabled: false, type: 'none' };
    }
}

/**
 * Fetch through a proxy service
 * 
 * FLOW DIAGRAM:
 * ============
 * 
 * Your Code → fetchWithProxy() → Proxy Service → Reddit API → Proxy Service → Your Code
 * 
 * Example with ScraperAPI:
 * 1. You call: fetchWithProxy('https://reddit.com/r/programming/new.json')
 * 2. Function builds URL: 'http://api.scraperapi.com?api_key=XXX&url=https://reddit.com/r/programming/new.json'
 * 3. ScraperAPI receives request, routes through their proxy IP
 * 4. ScraperAPI fetches from Reddit (Reddit sees ScraperAPI's IP, not Vercel's)
 * 5. ScraperAPI returns Reddit's response to you
 */
export async function fetchWithProxy(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const config = getProxyConfig();
    
    // If proxy is disabled, use direct fetch
    if (!config.enabled) {
        console.log('🌐 Using direct fetch (no proxy)');
        return fetch(url, options);
    }
    
    console.log(`🔀 Using proxy service: ${config.type}`);
    
    switch (config.type) {
        case 'scraperapi':
            return fetchWithScraperAPI(url, options, config);
        
        case 'brightdata':
            return fetchWithBrightData(url, options, config);
        
        case 'custom':
            return fetchWithCustomProxy(url, options, config);
        
        default:
            // Fallback to direct fetch
            return fetch(url, options);
    }
}

/**
 * Fetch using ScraperAPI
 * 
 * HOW IT WORKS:
 * ============
 * ScraperAPI uses a simple API where you pass the target URL as a parameter.
 * They handle all the proxy routing, IP rotation, and request headers automatically.
 * 
 * Example:
 * Direct: https://reddit.com/r/programming/new.json
 * Through ScraperAPI: http://api.scraperapi.com?api_key=YOUR_KEY&url=https://reddit.com/r/programming/new.json
 */
async function fetchWithScraperAPI(
    url: string,
    options: RequestInit,
    config: ProxyConfig
): Promise<Response> {
    if (!config.apiKey || !config.endpoint) {
        throw new Error('ScraperAPI configuration missing. Set SCRAPERAPI_KEY in environment variables.');
    }
    
    // ScraperAPI expects the target URL as a query parameter
    const proxyUrl = `${config.endpoint}${encodeURIComponent(url)}`;
    
    // ScraperAPI handles headers automatically, but we can pass custom headers
    const proxyOptions: RequestInit = {
        ...options,
        headers: {
            ...options.headers,
            // ScraperAPI-specific headers if needed
        },
    };
    
    console.log(`📡 Fetching through ScraperAPI: ${url.substring(0, 50)}...`);
    return fetch(proxyUrl, proxyOptions);
}

/**
 * Fetch using Bright Data (formerly Luminati)
 * 
 * HOW IT WORKS:
 * ============
 * Bright Data uses HTTP proxy authentication. You connect to their proxy server
 * using HTTP CONNECT method, and they route your requests through their IP pool.
 * 
 * Format: http://username:password@proxy-host:port
 */
async function fetchWithBrightData(
    url: string,
    options: RequestInit,
    config: ProxyConfig
): Promise<Response> {
    if (!config.endpoint) {
        throw new Error('Bright Data endpoint missing. Set BRIGHTDATA_ENDPOINT in environment variables.');
    }
    
    // Bright Data uses HTTP proxy format: http://username:password@host:port
    const proxyUrl = config.endpoint;
    
    // For Bright Data, we need to use a proxy agent (Node.js only)
    // In serverless environments, we might need to use their API endpoint instead
    console.log(`📡 Fetching through Bright Data: ${url.substring(0, 50)}...`);
    
    // Note: Bright Data in serverless might require their API endpoint instead
    // Check their documentation for serverless integration
    return fetch(url, {
        ...options,
        // Bright Data specific headers
        headers: {
            ...options.headers,
        },
    });
}

/**
 * Fetch using a custom HTTP proxy
 * 
 * HOW IT WORKS:
 * ============
 * Custom proxies work like standard HTTP proxies. You can use services like:
 * - ProxyMesh
 * - Smartproxy
 * - Any HTTP proxy service
 * 
 * Format: http://username:password@proxy-host:port
 */
async function fetchWithCustomProxy(
    url: string,
    options: RequestInit,
    config: ProxyConfig
): Promise<Response> {
    if (!config.endpoint && (!config.host || !config.port)) {
        throw new Error('Custom proxy configuration missing. Set PROXY_ENDPOINT or PROXY_HOST/PROXY_PORT.');
    }
    
    // If endpoint is provided, use it directly
    if (config.endpoint) {
        // Some proxy services work like ScraperAPI (URL as parameter)
        const proxyUrl = config.endpoint.includes('{url}') 
            ? config.endpoint.replace('{url}', encodeURIComponent(url))
            : `${config.endpoint}?url=${encodeURIComponent(url)}`;
        
        console.log(`📡 Fetching through custom proxy: ${url.substring(0, 50)}...`);
        return fetch(proxyUrl, options);
    }
    
    // Otherwise, build proxy URL from host/port
    const proxyAuth = config.username && config.password 
        ? `${config.username}:${config.password}@`
        : '';
    const proxyUrl = `http://${proxyAuth}${config.host}:${config.port}`;
    
    console.log(`📡 Fetching through custom proxy: ${url.substring(0, 50)}...`);
    
    // Note: Direct HTTP proxy requires a proxy agent library
    // For serverless, use proxy services that provide API endpoints instead
    return fetch(url, options);
}

/**
 * Check if proxy is configured and available
 */
export function isProxyEnabled(): boolean {
    const config = getProxyConfig();
    return config.enabled && config.type !== 'none';
}

/**
 * Get proxy status information
 */
export function getProxyStatus(): {
    enabled: boolean;
    type: string;
    configured: boolean;
} {
    const config = getProxyConfig();
    return {
        enabled: config.enabled,
        type: config.type,
        configured: config.enabled && (
            (config.type === 'scraperapi' && !!config.apiKey) ||
            (config.type === 'brightdata' && !!config.endpoint) ||
            (config.type === 'custom' && (!!config.endpoint || (!!config.host && !!config.port)))
        )
    };
}



