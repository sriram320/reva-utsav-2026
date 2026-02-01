import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { hashToken } from '@/lib/tokens';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        // Validation
        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Hash the token to compare with database
        const hashedToken = hashToken(token);

        // Find valid token
        const [resetToken] = await db
            .select()
            .from(passwordResetTokens)
            .where(
                and(
                    eq(passwordResetTokens.token, hashedToken),
                    eq(passwordResetTokens.used, false),
                    gt(passwordResetTokens.expiresAt, new Date())
                )
            )
            .limit(1);

        if (!resetToken) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, resetToken.userId));

        // Mark token as used
        await db.update(passwordResetTokens)
            .set({ used: true })
            .where(eq(passwordResetTokens.id, resetToken.id));

        return NextResponse.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
