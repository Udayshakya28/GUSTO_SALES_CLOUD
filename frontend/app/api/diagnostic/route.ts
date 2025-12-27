import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Diagnostic route is working',
        timestamp: new Date().toISOString(),
        routes: {
            testRoute: '/api/test-route',
            discovery: '/api/leads/discover/manual/[campaignId]',
            campaigns: '/api/campaigns/[campaignId]',
            analytics: {
                metrics: '/api/analytics/metrics/[campaignId]',
                trends: '/api/analytics/trends/[campaignId]',
                weeklyActivity: '/api/analytics/weekly-activity/[campaignId]',
                subredditPerformance: '/api/analytics/subreddit-performance/[campaignId]',
                opportunityDistribution: '/api/analytics/opportunity-distribution/[campaignId]'
            }
        }
    });
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
        status: 'ok',
        message: 'POST method works',
        received: body,
        timestamp: new Date().toISOString()
    });
}



