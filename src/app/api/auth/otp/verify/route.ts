import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otpVerifications } from '@/db/schema';
import { eq, and, gt, desc } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
        }

        // Find latest valid OTP
        const [record] = await db.select()
            .from(otpVerifications)
            .where(and(eq(otpVerifications.email, email), eq(otpVerifications.otp, otp)))
            .orderBy(desc(otpVerifications.createdAt))
            .limit(1);

        if (!record) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        if (new Date() > record.expiresAt) {
            return NextResponse.json({ error: 'OTP Expired' }, { status: 400 });
        }

        if (record.verified) {
            return NextResponse.json({ success: true, message: 'Already verified' });
        }

        // Mark as verified
        await db.update(otpVerifications)
            .set({ verified: true })
            .where(eq(otpVerifications.id, record.id));

        return NextResponse.json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
