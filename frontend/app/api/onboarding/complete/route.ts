import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newCampaign = {
            id: `camp_${Math.random().toString(36).substr(2, 9)}`,
            userId: 'user_1',
            name: body.name || 'New Campaign',
            analyzedUrl: body.websiteUrl || '',
            generatedKeywords: body.generatedKeywords || [],
            generatedDescription: body.generatedDescription || '',
            targetSubreddits: body.targetSubreddits || [],
            competitors: body.competitors || [],
            createdAt: new Date().toISOString()
        };
        db.addCampaign(newCampaign);
        return NextResponse.json(newCampaign);
    } catch (error) {
        return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }
}
