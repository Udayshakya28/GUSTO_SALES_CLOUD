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
        return NextResponse.json([]);
    } catch (error: any) {
        console.error('Analytics weekly activity error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch weekly activity' }, { status: 500 });
    }
}
