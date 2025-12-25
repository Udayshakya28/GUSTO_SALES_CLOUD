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
        
        // Debug: Log Prisma availability
        console.log('🔍 Prisma Fetch Diagnostics:', {
            isPrismaAvailable: isPrismaAvailable(),
            prismaExists: !!prisma,
            databaseUrlSet: !!process.env.DATABASE_URL,
            databaseUrlPreview: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : 'NOT SET'
        });
        
        let leads = [];
        let source = 'in-memory';
        
        // Try Prisma first if available and DATABASE_URL is set
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                console.log('🔍 Attempting to fetch leads from Prisma database...');
                
                // Test connection first
                try {
                    await prisma.$connect();
                    console.log('✅ Prisma connection successful for fetch');
                } catch (connError: any) {
                    console.error('❌ Prisma connection failed:', connError.message);
                    throw connError;
                }
                
                // First, check if campaign exists and get all leads for it
                const campaign = await prisma.campaign.findUnique({
                    where: { id: campaignId },
                    include: { leads: true }
                });
                
                console.log(`🔍 Campaign check:`, {
                    campaignExists: !!campaign,
                    campaignUserId: campaign?.userId,
                    currentUserId: userId,
                    userIdMatch: campaign?.userId === userId,
                    totalLeadsInCampaign: campaign?.leads.length || 0
                });
                
                // Try fetching with userId first, then without if no results
                let prismaLeads = await prisma.lead.findMany({
                    where: { 
                        campaignId: campaignId,
                        userId: userId
                    },
                    orderBy: { discoveredAt: 'desc' }
                });
                
                console.log(`📊 Leads found with userId filter: ${prismaLeads.length}`);
                
                // If no leads found with userId, try without userId filter (for debugging)
                if (prismaLeads.length === 0) {
                    const allCampaignLeads = await prisma.lead.findMany({
                        where: { 
                            campaignId: campaignId
                        },
                        orderBy: { discoveredAt: 'desc' }
                    });
                    console.log(`📊 Leads found without userId filter: ${allCampaignLeads.length}`);
                    console.log(`🔍 Sample lead userIds:`, allCampaignLeads.slice(0, 3).map((l: any) => ({ id: l.id, userId: l.userId })));
                    
                    // Use all leads if campaign exists and belongs to user
                    if (campaign && campaign.userId === userId) {
                        prismaLeads = allCampaignLeads;
                        console.log(`✅ Using all campaign leads (campaign belongs to user)`);
                    }
                }
                
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
                console.warn('⚠️ Prisma error, falling back to in-memory db:', {
                    message: prismaError.message,
                    code: prismaError.code,
                    meta: prismaError.meta
                });
                // Fall through to in-memory database
            }
        } else {
            console.log('⚠️ Prisma not used for fetch. Reasons:', {
                isPrismaAvailable: isPrismaAvailable(),
                prismaExists: !!prisma,
                databaseUrlSet: !!process.env.DATABASE_URL
            });
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
                source: source, // 'prisma' or 'in-memory'
                userId: userId,
                prismaAvailable: isPrismaAvailable(),
                databaseUrlSet: !!process.env.DATABASE_URL
            }
        });
    } catch (error: any) {
        console.error('❌ Error fetching leads:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch leads' }, { status: 500 });
    }
}
