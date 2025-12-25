import { NextResponse } from 'next/server';
import { getProxyStatus, fetchWithProxy, isProxyEnabled } from '@/lib/proxy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const proxyStatus = getProxyStatus();
        
        // Test fetching Reddit through proxy
        let testResult: any = {
            proxyStatus,
            testUrl: 'https://www.reddit.com/r/programming/new.json?limit=1',
            success: false,
            error: null,
        };
        
        if (proxyStatus.enabled && proxyStatus.configured) {
            try {
                console.log('🧪 Testing proxy with Reddit API...');
                const response = await fetchWithProxy(testResult.testUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                });
                
                testResult.success = response.ok;
                testResult.status = response.status;
                testResult.statusText = response.statusText;
                
                if (response.ok) {
                    const data = await response.json();
                    testResult.postsFound = data?.data?.children?.length || 0;
                    testResult.message = '✅ Proxy is working! Successfully fetched from Reddit.';
                } else {
                    const errorText = await response.text().catch(() => 'Unknown error');
                    testResult.error = `Reddit returned ${response.status}: ${errorText.substring(0, 200)}`;
                    testResult.message = `⚠️ Proxy connected but Reddit returned ${response.status}`;
                }
            } catch (error: any) {
                testResult.error = error.message;
                testResult.message = `❌ Proxy test failed: ${error.message}`;
            }
        } else {
            testResult.message = 'ℹ️ Proxy is not enabled. Set PROXY_ENABLED=true and configure a proxy service.';
        }
        
        return NextResponse.json({
            message: 'Proxy Test Results',
            ...testResult,
            instructions: {
                setup: 'See PROXY_SETUP_GUIDE.md for setup instructions',
                envVars: {
                    required: ['PROXY_ENABLED=true', 'PROXY_TYPE=scraperapi', 'SCRAPERAPI_KEY=your_key'],
                    optional: ['BRIGHTDATA_ENDPOINT', 'PROXY_ENDPOINT']
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            error: 'Test failed',
            message: error.message
        }, { status: 500 });
    }
}

