import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
        const leads = db.getLeads(campaignId);
        return NextResponse.json({ data: leads });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
    }
}
