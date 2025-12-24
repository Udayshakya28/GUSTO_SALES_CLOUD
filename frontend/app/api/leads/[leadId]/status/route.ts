import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const { leadId } = await params;
        const { status } = await request.json();

        const updated = db.updateLeadStatus(leadId, status);

        if (!updated) {
            return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }
}
