import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
    request: Request,
    { params }: { params: { webhookId: string } }
) {
    try {
        // Await the params object
        const resolvedParams = await Promise.resolve(params);
        const webhookId = resolvedParams.webhookId;

        const webhooks = db.getWebhooks();
        const webhook = webhooks.find(w => w.id === webhookId);

        if (!webhook) {
            return NextResponse.json({ message: 'Webhook not found' }, { status: 404 });
        }

        // Simulate a lead payload
        const testPayload = {
            event: 'test.event',
            timestamp: new Date().toISOString(),
            data: {
                message: 'This is a test notification from RedLead.',
                lead: {
                    id: 'test_lead_123',
                    title: 'Test Lead Title',
                    subreddit: 'r/test',
                    url: 'https://reddit.com/r/test/comments/123',
                    opportunityScore: 95
                }
            }
        };

        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'RedLead-Webhook/1.0'
                },
                body: JSON.stringify(testPayload)
            });

            if (!response.ok) {
                return NextResponse.json({
                    message: `Webhook failed with status: ${response.status}`,
                    details: await response.text()
                }, { status: 400 });
            }

            // Update lastTriggered
            db.updateWebhook(webhookId, { lastTriggered: new Date().toISOString() });

            return NextResponse.json({ message: 'Test webhook sent successfully' });

        } catch (fetchError: any) {
            return NextResponse.json({
                message: 'Failed to send webhook request',
                error: fetchError.message
            }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
