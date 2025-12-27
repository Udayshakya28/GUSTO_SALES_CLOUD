import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const webhooks = db.getWebhooks();
        return NextResponse.json({ webhooks });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch webhooks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.url || !body.type) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const newWebhook = {
            id: `wh_${Math.random().toString(36).substr(2, 9)}`,
            name: body.name,
            url: body.url,
            type: body.type,
            isActive: true,
            events: body.events || ['lead.discovered'],
            filters: body.filters || {},
            rateLimitMinutes: body.rateLimitMinutes || 5,
            createdAt: new Date().toISOString()
        };

        db.addWebhook(newWebhook as any);
        return NextResponse.json(newWebhook);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to create webhook' }, { status: 500 });
    }
}
