import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json([]); // Return empty for now to avoid errors
}
