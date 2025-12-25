import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { sendWelcomeEmail, sendSignInEmail } from '@/lib/email';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Clerk webhook secret from environment variables
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: Request) {
    if (!WEBHOOK_SECRET) {
        console.error('❌ CLERK_WEBHOOK_SECRET is not set');
        return NextResponse.json(
            { error: 'Webhook secret not configured' },
            { status: 500 }
        );
    }

    // Get the Svix headers for verification
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json(
            { error: 'Error occurred -- no svix headers' },
            { status: 400 }
        );
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as any;
    } catch (err: any) {
        console.error('❌ Error verifying webhook:', err.message);
        return NextResponse.json(
            { error: 'Error verifying webhook' },
            { status: 400 }
        );
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log(`📥 Clerk webhook received: ${eventType}`);

    try {
        if (eventType === 'user.created') {
            const { id, email_addresses, first_name, last_name } = evt.data;
            const email = email_addresses?.[0]?.email_address;
            const firstName = first_name || '';

            console.log(`👤 New user created: ${id}, email: ${email}`);

            // Create user in database
            if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
                try {
                    await prisma.user.upsert({
                        where: { id },
                        update: {},
                        create: {
                            id,
                            email: email || `${id}@clerk.local`,
                            firstName: firstName || null,
                            lastName: last_name || null,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    });
                    console.log(`✅ User ${id} created in Prisma`);
                } catch (error: any) {
                    console.error(`❌ Failed to create user in Prisma:`, error);
                }
            }

            // Send welcome email
            if (email) {
                try {
                    const result = await sendWelcomeEmail(email, firstName);
                    if (result.success) {
                        console.log(`✅ Welcome email sent to ${email}`);
                    } else {
                        console.error(`❌ Failed to send welcome email: ${result.error}`);
                    }
                } catch (error: any) {
                    console.error(`❌ Error sending welcome email:`, error);
                }
            }
        } else if (eventType === 'session.created') {
            const { user_id } = evt.data;
            console.log(`🔐 Session created for user: ${user_id}`);

            // Get user details from Clerk
            try {
                const user = await currentUser();
                if (user) {
                    const email = user.emailAddresses?.[0]?.emailAddress;
                    const firstName = user.firstName || '';
                    
                    // Check if email notifications are enabled
                    const { isEmailNotificationsEnabled } = await import('@/lib/email');
                    const settings = await isEmailNotificationsEnabled(user_id);
                    
                    // Only send sign-in email if notifications are enabled
                    if (email && settings.enabled) {
                        const ipAddress = headers().get('x-forwarded-for') || 
                                        headers().get('x-real-ip') || 
                                        'Unknown';
                        
                        const result = await sendSignInEmail(email, firstName, ipAddress);
                        if (result.success) {
                            console.log(`✅ Sign-in email sent to ${email}`);
                        } else {
                            console.error(`❌ Failed to send sign-in email: ${result.error}`);
                        }
                    } else {
                        console.log(`ℹ️ Sign-in email skipped (notifications disabled or no email)`);
                    }
                }
            } catch (error: any) {
                console.error(`❌ Error processing session.created:`, error);
            }
        }

        return NextResponse.json({ received: true, eventType });
    } catch (error: any) {
        console.error(`❌ Error handling webhook ${eventType}:`, error);
        return NextResponse.json(
            { error: 'Error processing webhook', details: error.message },
            { status: 500 }
        );
    }
}

