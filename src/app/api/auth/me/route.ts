import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch full user data from database
        const [currentUser] = await db.select().from(users).where(eq(users.email, session.user.email!)).limit(1);

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = currentUser;

        return NextResponse.json({
            user: userWithoutPassword,
        });

    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
