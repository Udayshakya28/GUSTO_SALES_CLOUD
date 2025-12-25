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
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Try Prisma first
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                const settings = await prisma.emailNotificationSetting.findUnique({
                    where: { userId },
                });
                
                if (settings) {
                    return NextResponse.json({
                        email: settings.email || '',
                        enabled: settings.enabled || false
                    });
                }
            } catch (e: any) {
                console.warn('⚠️ Prisma error fetching email settings, falling back to in-memory:', e.message);
            }
        }

        // Fallback to in-memory
        const settings = db.getEmailSettings(userId);
        
        if (!settings) {
            // Return default settings if none exist
            return NextResponse.json({
                email: '',
                enabled: false
            });
        }

        return NextResponse.json({
            email: settings.email || '',
            enabled: settings.enabled || false
        });
    } catch (error: any) {
        console.error('Error fetching email settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch email settings', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { email, enabled } = body;

        // Get user's email from Clerk if not provided
        let userEmail = email;
        if (!userEmail) {
            const user = await currentUser();
            userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
        }

        if (!userEmail && enabled) {
            return NextResponse.json(
                { error: 'Email is required when notifications are enabled' },
                { status: 400 }
            );
        }

        // Try Prisma first
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                // Ensure User exists
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (!user) {
                    const clerkUser = await currentUser();
                    const emailForUser = clerkUser?.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`;
                    await prisma.user.create({
                        data: {
                            id: userId,
                            email: emailForUser,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    });
                }

                // Upsert email notification settings
                const settings = await prisma.emailNotificationSetting.upsert({
                    where: { userId },
                    update: {
                        email: userEmail || '',
                        enabled: enabled || false
                    },
                    create: {
                        userId,
                        email: userEmail || '',
                        enabled: enabled || false
                    }
                });

                console.log(`✅ Email settings updated in Prisma for user ${userId}`);

                // Also update in-memory for consistency
                db.updateEmailSettings(userId, {
                    email: settings.email,
                    enabled: settings.enabled
                });

                return NextResponse.json({
                    message: 'Email settings updated successfully',
                    email: settings.email,
                    enabled: settings.enabled
                });
            } catch (e: any) {
                console.error('❌ Prisma error updating email settings:', e);
                // Fall through to in-memory fallback
            }
        }

        // Fallback to in-memory
        db.updateEmailSettings(userId, {
            email: userEmail || '',
            enabled: enabled || false
        });

        return NextResponse.json({
            message: 'Email settings updated successfully',
            email: userEmail || '',
            enabled: enabled || false
        });
    } catch (error: any) {
        console.error('Error updating email settings:', error);
        return NextResponse.json(
            { error: 'Failed to update email settings', details: error.message },
            { status: 500 }
        );
    }
}

