import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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
        route: '/api/test-route'
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        return NextResponse.json({ 
            message: 'POST works!',
            timestamp: new Date().toISOString(),
            method: 'POST',
            route: '/api/test-route',
            received: body,
            headers: {
                contentType: request.headers.get('content-type'),
                authorization: request.headers.get('authorization') ? 'present' : 'missing'
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            message: 'POST error',
            error: error.message
        }, { status: 500 });
    }
}

