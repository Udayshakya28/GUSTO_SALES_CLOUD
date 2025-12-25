import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const { leadId } = await params;
        const { status } = await request.json();
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Try Prisma first
        if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
            try {
                const updated = await prisma.lead.update({
                    where: { id: leadId },
                    data: { status: status as 'new' | 'replied' | 'saved' | 'ignored' }
                });
                
                console.log(`✅ Updated lead ${leadId} status to '${status}' in Prisma`);
                
                // Also update in-memory for consistency
                db.updateLeadStatus(leadId, status);
                
                return NextResponse.json({
                    id: updated.id,
                    status: updated.status
                });
            } catch (e: any) {
                if (e.code === 'P2025') {
                    // Record not found
                    return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
                }
                console.warn('⚠️ Prisma error updating lead status, falling back to in-memory:', e.message);
            }
        }
        
        // Fallback to in-memory
        const updated = db.updateLeadStatus(leadId, status);

        if (!updated) {
            return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Invalid data' }, { status: 400 });
    }
}
