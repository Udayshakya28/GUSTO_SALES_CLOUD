import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
<<<<<<< HEAD

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newCampaign = {
            id: `camp_${Math.random().toString(36).substr(2, 9)}`,
            userId: 'user_1',
            name: body.name || 'New Campaign',
            analyzedUrl: body.websiteUrl || '',
=======
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const campaignId = `camp_${Math.random().toString(36).substr(2, 9)}`;

        const campaignData = {
            id: campaignId,
            userId: userId,
            name: body.name || 'New Campaign',
            analyzedUrl: body.websiteUrl || body.analyzedUrl || '',
>>>>>>> landing/main
            generatedKeywords: body.generatedKeywords || [],
            generatedDescription: body.generatedDescription || '',
            targetSubreddits: body.targetSubreddits || [],
            competitors: body.competitors || [],
<<<<<<< HEAD
            createdAt: new Date().toISOString()
        };
        db.addCampaign(newCampaign);
        return NextResponse.json(newCampaign);
    } catch (error) {
        return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
=======
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            negativeKeywords: [],
            subredditBlacklist: []
        };

        // Try Prisma first
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                // Ensure User exists before creating campaign
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (!user) {
                    const clerkUser = await currentUser();
                    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`;

                    console.log(`👤 Creating user record for ${userId} (${userEmail})`);
                    await prisma.user.upsert({
                        where: { id: userId },
                        update: {},
                        create: {
                            id: userId,
                            email: userEmail,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    });
                }

                console.log(`📝 Creating campaign in Prisma for user ${userId}`);
                const newCampaign = await prisma.campaign.create({
                    data: campaignData
                });

                console.log(`✅ Successfully created campaign ${newCampaign.id} in Prisma`);

                // Also add to in-memory for immediate consistency if anything reads from there
                db.addCampaign({
                    id: campaignData.id,
                    userId: campaignData.userId,
                    name: campaignData.name,
                    analyzedUrl: campaignData.analyzedUrl,
                    generatedKeywords: campaignData.generatedKeywords,
                    generatedDescription: campaignData.generatedDescription,
                    targetSubreddits: campaignData.targetSubreddits,
                    competitors: campaignData.competitors,
                    createdAt: campaignData.createdAt.toISOString()
                });

                return NextResponse.json({
                    ...newCampaign,
                    createdAt: newCampaign.createdAt.toISOString(),
                    updatedAt: newCampaign.updatedAt.toISOString()
                });
            } catch (error: any) {
                console.error('❌ Prisma error creating campaign in onboarding:', error);
                // Fallback to in-memory if Prisma fails
            }
        }

        // Fallback to in-memory implementation
        console.warn('⚠️ using in-memory fallback for onboarding campaign creation');
        const memoryCampaign = {
            id: campaignData.id,
            userId: campaignData.userId,
            name: campaignData.name,
            analyzedUrl: campaignData.analyzedUrl,
            generatedKeywords: campaignData.generatedKeywords,
            generatedDescription: campaignData.generatedDescription,
            targetSubreddits: campaignData.targetSubreddits,
            competitors: campaignData.competitors,
            createdAt: campaignData.createdAt.toISOString()
        };
        db.addCampaign(memoryCampaign);
        return NextResponse.json(memoryCampaign);

    } catch (error: any) {
        console.error('❌ Error in onboarding complete:', error);
        return NextResponse.json({ message: error.message || 'Invalid data' }, { status: 400 });
>>>>>>> landing/main
    }
}
