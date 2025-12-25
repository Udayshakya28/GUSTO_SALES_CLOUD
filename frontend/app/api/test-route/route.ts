import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 30;

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function GET() {
    return NextResponse.json({ 
        message: 'Test route GET works!',
        timestamp: new Date().toISOString(),
        method: 'GET',
        route: '/api/test-route',
        checks: {
            routeFileExists: true,
            runtime: 'nodejs',
            dynamic: 'force-dynamic'
        }
    });
}

export async function POST(request: Request) {
    const checks: Record<string, any> = {
        routeFileExists: true,
        runtime: 'nodejs',
        dynamic: 'force-dynamic',
        timestamp: new Date().toISOString(),
        method: request.method,
        url: request.url,
    };

    try {
        // Check 1: Request method
        checks.requestMethod = request.method;
        checks.isPost = request.method === 'POST';

        // Check 2: Headers
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            headers[key] = key.toLowerCase().includes('authorization') 
                ? (value ? 'present (hidden)' : 'missing')
                : value;
        });
        checks.headers = headers;
        checks.contentType = request.headers.get('content-type');
        checks.hasContentType = !!request.headers.get('content-type');
        checks.hasAuthorization = !!request.headers.get('authorization');

        // Check 3: Body parsing
        let body: any = null;
        let bodyError: string | null = null;
        try {
            const bodyText = await request.text();
            checks.bodyRaw = bodyText;
            checks.bodyLength = bodyText.length;
            
            if (bodyText) {
                try {
                    body = JSON.parse(bodyText);
                    checks.bodyParsed = true;
                    checks.bodyType = typeof body;
                } catch (parseError: any) {
                    bodyError = parseError.message;
                    checks.bodyParsed = false;
                    checks.bodyError = bodyError;
                }
            } else {
                checks.bodyEmpty = true;
            }
        } catch (bodyReadError: any) {
            checks.bodyReadError = bodyReadError.message;
        }

        // Check 4: Environment variables (check if they're accessible)
        checks.envVars = {
            hasGroqKey: !!process.env.GROQ_API_KEY,
            hasGroqModel: !!process.env.GROQ_MODEL,
            hasDevvitToken: !!process.env.DEVVIT_TOKEN,
            hasRedditUserAgent: !!process.env.REDDIT_USER_AGENT,
            nodeEnv: process.env.NODE_ENV || 'not set',
        };

        // Check 5: Route configuration
        checks.routeConfig = {
            runtime: 'nodejs',
            dynamic: 'force-dynamic',
            fetchCache: 'force-no-store',
            maxDuration: 30
        };

        // Check 6: Response capability
        checks.canCreateResponse = true;

        return NextResponse.json({ 
            success: true,
            message: 'POST works! All checks passed.',
            route: '/api/test-route',
            receivedBody: body,
            checks: checks
        }, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'X-Test-Route': 'true',
                'X-Checks-Passed': 'true'
            }
        });
    } catch (error: any) {
        checks.error = {
            message: error.message,
            stack: error.stack,
            name: error.name
        };
        
        return NextResponse.json({
            success: false,
            message: 'POST error occurred',
            error: error.message,
            checks: checks
        }, { 
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'X-Test-Route': 'true',
                'X-Checks-Passed': 'false'
            }
        });
    }
}

