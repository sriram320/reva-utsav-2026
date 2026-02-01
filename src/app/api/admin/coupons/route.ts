
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { coupons, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/coupons - List all coupons
export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const allCoupons = await db.select({
            id: coupons.id,
            code: coupons.code,
            discountPercent: coupons.discountPercent,
            usageCount: coupons.usageCount,
            assignedToName: users.name,
            assignedToId: coupons.assignedTo
        })
            .from(coupons)
            .leftJoin(users, eq(coupons.assignedTo, users.id))
            .orderBy(desc(coupons.createdAt));

        return NextResponse.json({ coupons: allCoupons });
    } catch (e) { return NextResponse.json({ error: 'Error fetching coupons' }, { status: 500 }); }
}

// POST /api/admin/coupons - Generate Coupon
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { assignedTo, discountPercent, customCode } = await req.json();

        if (!assignedTo || !discountPercent) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Generate Code: VOL-[FIRSTNAME]-[RANDOM4]
        let finalCode = customCode;
        if (!finalCode) {
            const [user] = await db.select().from(users).where(eq(users.id, assignedTo));
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
            const namePart = user.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
            finalCode = `VOL-${namePart}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        await db.insert(coupons).values({
            code: finalCode,
            discountPercent: parseInt(discountPercent),
            assignedTo: parseInt(assignedTo),
            usageCount: 0
        });

        return NextResponse.json({ success: true, code: finalCode });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }
}
