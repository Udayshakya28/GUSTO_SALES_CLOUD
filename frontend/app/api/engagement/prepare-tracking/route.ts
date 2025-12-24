import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { leadId, content } = await request.json();

        if (!leadId) {
            return NextResponse.json({ message: 'Lead ID is required' }, { status: 400 });
        }

        // Update lead status in local DB
        const updatedLead = db.updateLeadStatus(leadId, 'replied');

        if (!updatedLead) {
            // If lead not found (might happen if strictly enforcing DB existence, but generic success often needed for UI)
            // We'll treat it as success for the tracking status update request itself if request was valid.
            // Or return 404 if strict. Given "demo" nature of db.ts, we can be lenient or strict.
            // Let's return 404 to be correct.
            return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Reply marked for tracking' });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to prepare tracking' }, { status: 500 });
    }
}
