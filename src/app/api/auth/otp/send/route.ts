import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otpVerifications } from '@/db/schema';
// import { SendMailClient } from "zeptomail"; // Commented out until creds are confirmed

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.endsWith('@reva.edu.in')) {
            return NextResponse.json({ error: 'Invalid email. Must be a REVA email address.' }, { status: 400 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save to DB
        await db.insert(otpVerifications).values({
            email,
            otp,
            expiresAt,
            verified: false
        });

        // Send Email (Mocking for now)
        console.log(`[OTP SERVICE] Sending OTP ${otp} to ${email}`);

        // Setup for ZeptoMail if needed later:
        // const client = new SendMailClient({ url: "api.zeptomail.in/", token: process.env.ZEPTO_TOKEN });
        // await client.sendMail({ ... });

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('OTP Send Error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
