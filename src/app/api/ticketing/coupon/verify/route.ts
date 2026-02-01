import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { coupons } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/ticketing/coupon/verify
export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

        const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));

        if (!coupon) {
            return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
        }

        return NextResponse.json({
            valid: true,
            discount: coupon.discountPercent,
            code: coupon.code
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
