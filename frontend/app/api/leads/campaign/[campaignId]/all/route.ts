import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/leads/campaign/[campaignId]/all
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    const { campaignId } = await params;
    // Implement in db
    db.addLeads(campaignId, []); // Simplified: clear by sending empty array if db supports overwriting or implement clear
    global.rl_leads[campaignId] = [];
    return NextResponse.json({ message: 'All leads deleted' });
}
