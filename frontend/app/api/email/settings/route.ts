import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

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

        // Get email settings for the user
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

        if (!email && enabled) {
            return NextResponse.json(
                { error: 'Email is required when notifications are enabled' },
                { status: 400 }
            );
        }

        // Update or create email settings
        db.updateEmailSettings(userId, {
            email: email || '',
            enabled: enabled || false
        });

        return NextResponse.json({
            message: 'Email settings updated successfully',
            email: email || '',
            enabled: enabled || false
        });
    } catch (error: any) {
        console.error('Error updating email settings:', error);
        return NextResponse.json(
            { error: 'Failed to update email settings' },
            { status: 500 }
        );
    }
}

