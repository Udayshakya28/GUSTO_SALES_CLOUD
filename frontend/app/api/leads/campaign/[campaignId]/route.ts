import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    const { campaignId } = await params;
    const leads = db.getLeads(campaignId);
    return NextResponse.json({ data: leads });
}
