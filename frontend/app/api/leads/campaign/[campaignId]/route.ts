import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

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
        
        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        console.log(`📥 Fetching leads for campaign: ${campaignId}, user: ${userId}`);
        
        let leads = [];
        let source = 'in-memory';
        
        // Try Prisma first if available and DATABASE_URL is set
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                console.log('🔍 Attempting to fetch leads from Prisma database...');
                const prismaLeads = await prisma.lead.findMany({
                    where: { 
                        campaignId: campaignId,
                        userId: userId // Ensure user owns the leads
                    },
                    orderBy: { discoveredAt: 'desc' }
                });
                
                // Convert Prisma leads to API format
                leads = prismaLeads.map((lead: any) => ({
                    id: lead.id,
                    redditId: lead.redditId,
                    title: lead.title,
                    author: lead.author,
                    subreddit: lead.subreddit,
                    url: lead.url,
                    body: lead.body || '',
                    createdAt: Math.floor(lead.postedAt.getTime() / 1000), // Convert to Unix timestamp
                    discoveredAt: Math.floor(lead.discoveredAt.getTime() / 1000),
                    intent: lead.intent || 'unclassified',
                    summary: lead.summary || null,
                    opportunityScore: lead.opportunityScore,
                    status: lead.status as 'new' | 'replied' | 'saved' | 'ignored',
                    numComments: 0, // Not stored in Prisma, will need to add if needed
                    upvoteRatio: 0, // Not stored in Prisma, will need to add if needed
                    isGoogleRanked: lead.isGoogleRanked || false
                }));
                
                source = 'prisma';
                console.log(`📊 Found ${leads.length} leads in Prisma database for campaign ${campaignId}`);
            } catch (prismaError: any) {
                console.warn('⚠️ Prisma error, falling back to in-memory db:', prismaError);
                // Fall through to in-memory database
            }
        }
        
        // Fallback to in-memory database if Prisma failed or not available
        if (source === 'in-memory') {
            leads = db.getLeads(campaignId);
            console.log(`📊 Found ${leads.length} leads in in-memory database for campaign ${campaignId}`);
        }
        
        return NextResponse.json({ 
            data: leads,
            debug: {
                campaignId,
                leadCount: leads.length,
                source: 'prisma' // or 'in-memory'
            }
        });
    } catch (error: any) {
        console.error('❌ Error fetching leads:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
    }
}
