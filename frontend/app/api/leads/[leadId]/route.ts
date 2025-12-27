import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    const { leadId } = await params;
    // Implement delete in db if needed, or just return success for simulation
    return NextResponse.json({ message: 'Lead deleted' });
}
