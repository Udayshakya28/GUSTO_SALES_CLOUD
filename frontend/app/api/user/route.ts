import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        id: 'user_1',
        email: 'user@example.com',
        onboardingCompleted: true
    });
}

export async function DELETE() {
    return NextResponse.json({ message: 'Account deleted' });
}
