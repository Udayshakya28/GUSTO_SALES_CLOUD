import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: Request) {
    const origin = request.headers.get('origin');
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': origin || '*',
            'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400',
        },
    });
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        const { campaignId } = await params;
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        // Try Prisma first
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                const campaign = await prisma.campaign.findUnique({
                    where: { id: campaignId }
                });
                
                if (campaign) {
                    // Convert Prisma campaign to API format
                    return NextResponse.json({
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
                    });
                }
            } catch (e: any) {
                console.warn('⚠️ Prisma error fetching campaign, falling back to in-memory:', e.message);
            }
        }
        
        // Fallback to in-memory
        const campaign = db.getCampaign(campaignId);
        if (!campaign) {
            return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
        }
        return NextResponse.json(campaign);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Failed to fetch campaign' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        const { campaignId } = await params;
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const body = await request.json();
        console.log(`📝 Updating campaign ${campaignId}:`, {
            targetSubreddits: body.targetSubreddits?.length || 0,
            generatedKeywords: body.generatedKeywords?.length || 0,
            keys: Object.keys(body)
        });
        
        // Try Prisma first
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                // Ensure campaign exists
                const existingCampaign = await prisma.campaign.findUnique({
                    where: { id: campaignId }
                });
                
                if (!existingCampaign) {
                    // Campaign doesn't exist in Prisma, create it
                    console.log(`📝 Campaign ${campaignId} doesn't exist in Prisma, creating it...`);
                    const inMemoryCampaign = db.getCampaign(campaignId);
                    
                    const newCampaign = await prisma.campaign.create({
                        data: {
                            id: campaignId,
                            userId: userId,
                            name: body.name || inMemoryCampaign?.name || 'Untitled Campaign',
                            analyzedUrl: body.analyzedUrl || inMemoryCampaign?.analyzedUrl || '',
                            generatedKeywords: body.generatedKeywords || inMemoryCampaign?.generatedKeywords || [],
                            generatedDescription: body.generatedDescription || inMemoryCampaign?.generatedDescription || '',
                            targetSubreddits: body.targetSubreddits || inMemoryCampaign?.targetSubreddits || [],
                            competitors: body.competitors || inMemoryCampaign?.competitors || [],
                            isActive: body.isActive !== undefined ? body.isActive : ((inMemoryCampaign as any)?.isActive ?? true),
                            negativeKeywords: body.negativeKeywords || (inMemoryCampaign as any)?.negativeKeywords || [],
                            subredditBlacklist: body.subredditBlacklist || (inMemoryCampaign as any)?.subredditBlacklist || []
                        }
                    });
                    
                    console.log(`✅ Created campaign ${campaignId} in Prisma with ${newCampaign.targetSubreddits.length} subreddits`);
                    
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
                }
                
                // Update existing campaign
                const updated = await prisma.campaign.update({
                    where: { id: campaignId },
                    data: {
                        ...(body.name !== undefined && { name: body.name }),
                        ...(body.analyzedUrl !== undefined && { analyzedUrl: body.analyzedUrl }),
                        ...(body.generatedKeywords !== undefined && { generatedKeywords: body.generatedKeywords }),
                        ...(body.generatedDescription !== undefined && { generatedDescription: body.generatedDescription }),
                        ...(body.targetSubreddits !== undefined && { targetSubreddits: body.targetSubreddits }),
                        ...(body.competitors !== undefined && { competitors: body.competitors }),
                        ...(body.isActive !== undefined && { isActive: body.isActive }),
                        ...(body.negativeKeywords !== undefined && { negativeKeywords: body.negativeKeywords }),
                        ...(body.subredditBlacklist !== undefined && { subredditBlacklist: body.subredditBlacklist })
                    }
                });
                
                console.log(`✅ Updated campaign ${campaignId} in Prisma:`, {
                    targetSubreddits: updated.targetSubreddits.length,
                    generatedKeywords: updated.generatedKeywords.length
                });
                
                // Also update in-memory for consistency
                db.updateCampaign(campaignId, body);
                
                return NextResponse.json({
                    id: updated.id,
                    userId: updated.userId,
                    name: updated.name,
                    analyzedUrl: updated.analyzedUrl,
                    generatedKeywords: updated.generatedKeywords,
                    generatedDescription: updated.generatedDescription,
                    targetSubreddits: updated.targetSubreddits,
                    competitors: updated.competitors,
                    createdAt: updated.createdAt.toISOString(),
                    updatedAt: updated.updatedAt.toISOString(),
                    isActive: updated.isActive
                });
            } catch (e: any) {
                console.error('❌ Prisma error updating campaign:', e);
                // Fall through to in-memory fallback
            }
        }
        
        // Fallback to in-memory
        const updated = db.updateCampaign(campaignId, body);
        if (!updated) {
            return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Invalid data' }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ campaignId: string }> }
) {
    try {
        const { campaignId } = await params;
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        // Try Prisma first
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                await prisma.campaign.delete({
                    where: { id: campaignId }
                });
                console.log(`✅ Deleted campaign ${campaignId} from Prisma`);
            } catch (e: any) {
                console.warn('⚠️ Prisma error deleting campaign:', e.message);
            }
        }
        
        // Also delete from in-memory
        const deleted = db.deleteCampaign(campaignId);
        if (!deleted) {
            return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Campaign deleted' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Failed to delete campaign' }, { status: 500 });
    }
}
