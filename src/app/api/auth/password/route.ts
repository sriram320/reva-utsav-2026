import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        // Fetch user to match old password
        const [user] = await db.select().from(users).where(eq(users.email, session.user.email));

        if (!user || !user.password) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Verify old password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'Password too short' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, user.id));

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
