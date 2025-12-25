import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        // Try Prisma first
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                const campaigns = await prisma.campaign.findMany({
                    where: { userId: userId },
                    orderBy: { createdAt: 'desc' }
                });
                
                // Convert Prisma campaigns to API format
                const formattedCampaigns = campaigns.map((campaign: any) => ({
                    id: campaign.id,
                    userId: campaign.userId,
                    name: campaign.name,
                    analyzedUrl: campaign.analyzedUrl,
                    generatedKeywords: campaign.generatedKeywords,
                    generatedDescription: campaign.generatedDescription,
                    targetSubreddits: campaign.targetSubreddits,
                    competitors: campaign.competitors,
                    createdAt: campaign.createdAt.toISOString(),
                    updatedAt: campaign.updatedAt.toISOString(),
                    isActive: campaign.isActive,
                    negativeKeywords: campaign.negativeKeywords,
                    subredditBlacklist: campaign.subredditBlacklist,
                    lastManualDiscoveryAt: campaign.lastManualDiscoveryAt?.toISOString(),
                    lastGlobalDiscoverAt: campaign.lastGlobalDiscoverAt?.toISOString(),
                    lastTargetedDiscoveryAt: campaign.lastTargetedDiscoveryAt?.toISOString()
                }));
                
                console.log(`✅ Fetched ${formattedCampaigns.length} campaigns from Prisma for user ${userId}`);
                return NextResponse.json(formattedCampaigns);
            } catch (e: any) {
                console.warn('⚠️ Prisma error fetching campaigns, falling back to in-memory:', e.message);
            }
        }
        
        // Fallback to in-memory
        return NextResponse.json(db.getCampaigns());
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Failed to fetch campaigns' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const body = await request.json();
        const campaignId = body.id || `camp_${Math.random().toString(36).substr(2, 9)}`;
        
        const campaignData = {
            id: campaignId,
            userId: userId,
            name: body.name || 'New Campaign',
            analyzedUrl: body.websiteUrl || body.analyzedUrl || '',
            generatedKeywords: body.generatedKeywords || [],
            generatedDescription: body.generatedDescription || '',
            targetSubreddits: body.targetSubreddits || [],
            competitors: body.competitors || [],
            isActive: body.isActive !== undefined ? body.isActive : true,
            negativeKeywords: body.negativeKeywords || [],
            subredditBlacklist: body.subredditBlacklist || []
        };
        
        // Try Prisma first
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                // Ensure User exists
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (!user) {
                    const clerkUser = await currentUser();
                    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`;
                    await prisma.user.create({
                        data: {
                            id: userId,
                            email: userEmail,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    });
                }
                
                const newCampaign = await prisma.campaign.create({
                    data: campaignData
                });
                
                console.log(`✅ Created campaign ${campaignId} in Prisma with ${newCampaign.targetSubreddits.length} subreddits`);
                
                // Also add to in-memory for consistency
                db.addCampaign({
                    ...campaignData,
                    createdAt: newCampaign.createdAt.toISOString()
                });
                
                return NextResponse.json({
                    id: newCampaign.id,
                    userId: newCampaign.userId,
                    name: newCampaign.name,
                    analyzedUrl: newCampaign.analyzedUrl,
                    generatedKeywords: newCampaign.generatedKeywords,
                    generatedDescription: newCampaign.generatedDescription,
                    targetSubreddits: newCampaign.targetSubreddits,
                    competitors: newCampaign.competitors,
                    createdAt: newCampaign.createdAt.toISOString(),
                    updatedAt: newCampaign.updatedAt.toISOString(),
                    isActive: newCampaign.isActive
                });
            } catch (e: any) {
                console.error('❌ Prisma error creating campaign:', e);
                // Fall through to in-memory fallback
            }
        }
        
        // Fallback to in-memory
        const newCampaign = {
            ...campaignData,
            createdAt: new Date().toISOString()
        };
        db.addCampaign(newCampaign);
        return NextResponse.json(newCampaign);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Invalid data' }, { status: 400 });
    }
}
