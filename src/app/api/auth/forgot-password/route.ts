import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateResetToken, hashToken, getTokenExpiry } from '@/lib/tokens';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        // Validation
        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Find user
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        // Always return success to prevent email enumeration
        // (Don't reveal if email exists or not)
        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link.',
            });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const hashedToken = hashToken(resetToken);
        const expiresAt = getTokenExpiry();

        // Store token in database
        await db.insert(passwordResetTokens).values({
            userId: user.id,
            token: hashedToken,
            expiresAt,
            used: false,
        });

        // TODO: Send email with ZeptoMail
        // For now, we'll log the reset link (in production, this would be sent via email)
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        console.log('='.repeat(60));
        console.log('PASSWORD RESET LINK (Development Only):');
        console.log(resetUrl);
        console.log('='.repeat(60));

        // In production, you would send this via ZeptoMail:
        // await sendPasswordResetEmail(user.email, user.name, resetUrl);

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.',
            // Remove this in production:
            devResetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
