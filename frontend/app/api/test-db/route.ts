import { NextResponse } from 'next/server';
import { prisma, isPrismaAvailable } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics: any = {
        timestamp: new Date().toISOString(),
        prismaAvailable: isPrismaAvailable(),
        databaseUrlSet: !!process.env.DATABASE_URL,
        databaseUrlPreview: process.env.DATABASE_URL 
            ? `${process.env.DATABASE_URL.substring(0, 20)}...` 
            : 'NOT SET',
    };

    // Test Prisma connection if available
    if (isPrismaAvailable() && prisma) {
        try {
            // Test basic connection
            await prisma.$connect();
            diagnostics.connectionTest = '✅ Connected';
            
            // Test query with error handling for prepared statement issues
            let userCount = 0;
            let campaignCount = 0;
            let leadCount = 0;
            
            try {
                userCount = await prisma.user.count();
            } catch (e: any) {
                diagnostics.userCountError = e.message;
            }
            
            try {
                campaignCount = await prisma.campaign.count();
            } catch (e: any) {
                diagnostics.campaignCountError = e.message;
            }
            
            try {
                leadCount = await prisma.lead.count();
            } catch (e: any) {
                diagnostics.leadCountError = e.message;
            }
            
            diagnostics.databaseStats = {
                users: userCount,
                campaigns: campaignCount,
                leads: leadCount,
            };
            
            // Test specific campaign
            const demoCampaign = await prisma.campaign.findUnique({
                where: { id: 'demo-campaign-1' },
                include: { leads: true }
            });
            
            // Get all campaigns
            const allCampaigns = await prisma.campaign.findMany({
                take: 5,
                select: { id: true, name: true, userId: true }
            });
            
            // Get leads for demo campaign without userId filter
            const allDemoLeads = await prisma.lead.findMany({
                where: { campaignId: 'demo-campaign-1' },
                take: 5,
                select: { id: true, redditId: true, userId: true, title: true }
            });
            
            diagnostics.demoCampaign = {
                exists: !!demoCampaign,
                leadCount: demoCampaign?.leads.length || 0,
                campaignUserId: demoCampaign?.userId,
            };
            
            diagnostics.allCampaigns = allCampaigns;
            diagnostics.demoCampaignLeads = allDemoLeads;
            
            await prisma.$disconnect();
        } catch (error: any) {
            diagnostics.connectionTest = '❌ Failed';
            diagnostics.error = {
                message: error.message,
                code: error.code,
                meta: error.meta,
            };
        }
    } else {
        diagnostics.connectionTest = '⚠️ Prisma not available';
        diagnostics.reason = 'Prisma client not initialized. Check if DATABASE_URL is set and Prisma client is generated.';
    }

    return NextResponse.json(diagnostics, { status: 200 });
}

