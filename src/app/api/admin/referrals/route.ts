
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { users, registrations, passes } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/referrals?code=VOL-XYZ - Get purchasers for a code
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const code = url.searchParams.get('code');

        if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

        // Find users who used this code in Registrations
        const regUsers = await db.select({
            name: users.name,
            email: users.email,
            item: registrations.paymentId, // proxy for event name or id
            date: registrations.registeredAt
        })
            .from(registrations)
            .leftJoin(users, eq(registrations.userId, users.id))
            .where(eq(registrations.couponCode, code));

        // Find users who used this code in Passes
        const passUsers = await db.select({
            name: users.name,
            email: users.email,
            item: passes.passType,
            date: passes.purchaseDate
        })
            .from(passes)
            .leftJoin(users, eq(passes.userId, users.id))
            .where(eq(passes.couponCode, code));

        return NextResponse.json({ referrals: [...regUsers, ...passUsers] });

    } catch (e) { return NextResponse.json({ error: 'Error fetching referrals' }, { status: 500 }); }
}
