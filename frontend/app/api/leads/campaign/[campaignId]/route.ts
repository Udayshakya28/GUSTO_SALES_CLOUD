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
        
        console.log(`📥 Fetching leads for campaign: ${campaignId}`);
        const leads = db.getLeads(campaignId);
        console.log(`📊 Found ${leads.length} leads in database for campaign ${campaignId}`);
        
        // Debug: Check all campaigns and their lead counts
        const allCampaigns = db.getCampaigns();
        console.log(`🔍 All campaigns in database:`, allCampaigns.map(c => ({
            id: c.id,
            name: c.name,
            leadCount: db.getLeads(c.id).length
        })));
        
        return NextResponse.json({ 
            data: leads,
            debug: {
                campaignId,
                leadCount: leads.length,
                allCampaigns: allCampaigns.map(c => ({
                    id: c.id,
                    leadCount: db.getLeads(c.id).length
                }))
            }
        });
    } catch (error: any) {
        console.error('❌ Error fetching leads:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
    }
}
