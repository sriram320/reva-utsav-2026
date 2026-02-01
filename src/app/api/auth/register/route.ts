import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, otpVerifications } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { name, email, password, college, phone, gender, srn, department } = await req.json();

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // REVA OTP Verification Check
        if (email.endsWith('@reva.edu.in')) {
            const [otpRecord] = await db.select()
                .from(otpVerifications)
                .where(eq(otpVerifications.email, email))
                .orderBy(desc(otpVerifications.createdAt)) // Get latest
                .limit(1);

            if (!otpRecord || !otpRecord.verified) {
                return NextResponse.json({ error: 'REVA Email not verified. Please verify OTP.' }, { status: 403 });
            }
        }

        // Check if user exists
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const [newUser] = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            college: college || null,
            phone: phone || null,
            gender: gender || null,
            srn: srn || null,
            department: department || null,
            role: 'user',
        }).returning({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        });

        return NextResponse.json({
            success: true,
            user: newUser,
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
