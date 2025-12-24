import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        totalReplies: 0,
        averageOpportunityScore: 0,
        repliesByType: {},
        recentReplies: []
    });
}
