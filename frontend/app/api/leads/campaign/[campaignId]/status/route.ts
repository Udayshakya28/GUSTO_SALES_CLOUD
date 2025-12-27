import { NextResponse } from 'next/server';

export async function DELETE() {
    return NextResponse.json({ message: 'Leads by status deleted' });
}
