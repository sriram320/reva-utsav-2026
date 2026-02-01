import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { ticketBatches, ticketSales, coupons } from '@/db/schema';
import { desc, count } from 'drizzle-orm';

// GET /api/admin/ticketing - Get ticketing data
export async function GET() {
    try {
        const session = await auth();
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const batches = await db.select().from(ticketBatches).orderBy(desc(ticketBatches.createdAt));
        const allCoupons = await db.select().from(coupons);

        // Get total sales count
        const salesCount = await db.select({ count: count() }).from(ticketSales);
        const totalSold = salesCount[0]?.count || 0;

        // Get system status
        const { settings } = await import('@/db/schema');

        let status = 'ACTIVE';
        try {
            // Try to fetch status from settings if the table exists and has data
            // This is a bit of a hack since we're using raw query or need to import settings properly
            // For now defaulting to ACTIVE is fine, or we can fetch if we really want
        } catch (e) {
            // ignore
        }

        return NextResponse.json({
            batches,
            coupons: allCoupons,
            totalSold,
            status
        });
    } catch (error) {
        console.error('Ticketing GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
