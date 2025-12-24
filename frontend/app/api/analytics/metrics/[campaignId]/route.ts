import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    const { campaignId } = await params;
    // Placeholder analytics data
    return NextResponse.json({
        totalLeads: 0,
        newLeads: 0,
        repliedLeads: 0,
        conversionRate: 0,
        dailyActivity: [],
        opportunityScoreDistribution: {
            "0-20": 0,
            "21-40": 0,
            "41-60": 0,
            "61-80": 0,
            "81-100": 0
        }
    });
}
