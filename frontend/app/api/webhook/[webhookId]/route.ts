import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: { webhookId: string } }
) {
    try {
        // Await the params object
        const resolvedParams = await Promise.resolve(params);
        const webhookId = resolvedParams.webhookId;

        const body = await request.json();
        const updated = db.updateWebhook(webhookId, body);

        if (!updated) {
            return NextResponse.json({ message: 'Webhook not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update webhook' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { webhookId: string } }
) {
    try {
        // Await the params object
        const resolvedParams = await Promise.resolve(params);
        const webhookId = resolvedParams.webhookId;

        const success = db.deleteWebhook(webhookId);

        if (!success) {
            return NextResponse.json({ message: 'Webhook not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Webhook deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete webhook' }, { status: 500 });
    }
}
