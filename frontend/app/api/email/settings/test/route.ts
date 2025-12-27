import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { sendEmail, isEmailNotificationsEnabled } from '@/lib/email';

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

        // Get user's email
        const user = await currentUser();
        const email = user?.emailAddresses?.[0]?.emailAddress;

        if (!email) {
            return NextResponse.json(
                { error: 'No email address found for user' },
                { status: 400 }
            );
        }

        // Check if notifications are enabled
        const settings = await isEmailNotificationsEnabled(userId);
        if (!settings.enabled) {
            return NextResponse.json(
                { error: 'Email notifications are disabled. Please enable them in settings first.' },
                { status: 400 }
            );
        }

        // Send test email
        const result = await sendEmail({
            to: email,
            subject: 'Test Email from GustoSalesCloud',
            html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Test Email</title>
                  </head>
                  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: #667eea; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                      <h1 style="color: white; margin: 0;">✅ Test Email</h1>
                    </div>
                    <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                      <p style="font-size: 16px;">This is a test email from GustoSalesCloud.</p>
                      <p style="font-size: 16px;">If you received this email, your notification settings are working correctly!</p>
                      <p style="font-size: 14px; color: #666; margin-top: 30px;">
                        Best regards,<br>
                        The GustoSalesCloud Team
                      </p>
                    </div>
                  </body>
                </html>
            `,
        });

        if (result.success) {
            return NextResponse.json({
                message: 'Test email sent successfully',
                success: true,
                messageId: result.messageId
            });
        } else {
            return NextResponse.json(
                { error: result.error || 'Failed to send test email' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Error sending test email:', error);
        return NextResponse.json(
            { error: 'Failed to send test email', details: error.message },
            { status: 500 }
        );
    }
}

