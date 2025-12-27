import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const webhooks = db.getWebhooks();

        const stats = {
            totalWebhooks: webhooks.length,
            activeWebhooks: webhooks.filter(w => w.isActive).length,
            lastTriggered: webhooks
                .map(w => w.lastTriggered)
                .filter(Boolean)
                .sort()
                .pop() || null,
            webhooksByType: webhooks.reduce((acc: any, w) => {
                acc[w.type] = (acc[w.type] || 0) + 1;
                return acc;
            }, {})
        };

        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch webhook stats' }, { status: 500 });
    }
}
