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
            
            // Test query
            const userCount = await prisma.user.count();
            const campaignCount = await prisma.campaign.count();
            const leadCount = await prisma.lead.count();
            
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
            
            diagnostics.demoCampaign = {
                exists: !!demoCampaign,
                leadCount: demoCampaign?.leads.length || 0,
            };
            
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

