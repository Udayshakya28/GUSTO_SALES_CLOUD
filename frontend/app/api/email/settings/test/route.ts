import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // In a real implementation, you would send an email here
        // For now, just return success
        return NextResponse.json({
            message: 'Test email would be sent here',
            success: true
        });
    } catch (error: any) {
        console.error('Error sending test email:', error);
        return NextResponse.json(
            { error: 'Failed to send test email', details: error.message },
            { status: 500 }
        );
    }
}

