import { NextResponse } from 'next/server';

// Login is now handled by NextAuth
// Use the /api/auth/signin endpoint instead
export async function POST() {
    return NextResponse.json({
        error: 'Please use NextAuth signin at /api/auth/signin'
    }, { status: 400 });
}
