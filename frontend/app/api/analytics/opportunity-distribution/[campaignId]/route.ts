import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        // Verify authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { campaignId } = await params;
        if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
        }
        return NextResponse.json({
            "0-20": 0,
            "21-40": 0,
            "41-60": 0,
            "61-80": 0,
            "81-100": 0
        });
    } catch (error: any) {
        console.error('Analytics opportunity distribution error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch opportunity distribution' }, { status: 500 });
    }
}
