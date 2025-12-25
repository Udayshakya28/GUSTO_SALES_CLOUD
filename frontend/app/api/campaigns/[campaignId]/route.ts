import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    const { campaignId } = await params;
    const campaign = db.getCampaign(campaignId);
    if (!campaign) {
        return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }
    return NextResponse.json(campaign);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        const { campaignId } = await params;
        const body = await request.json();
        const updated = db.updateCampaign(campaignId, body);
        if (!updated) {
            return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    const { campaignId } = await params;
    const deleted = db.deleteCampaign(campaignId);
    if (!deleted) {
        return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Campaign deleted' });
}
