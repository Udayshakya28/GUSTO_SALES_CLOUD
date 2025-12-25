import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        const { campaignId } = await params;
        if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
        }
        return NextResponse.json([]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch weekly activity' }, { status: 500 });
    }
}
