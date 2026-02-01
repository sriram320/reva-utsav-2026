
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accommodationRequests, accommodationProperties } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;
        if (!session || (user?.role !== 'admin' && user?.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 1. Request Stats
        const [totalRequests] = await db.select({ count: sql<number>`count(*)` }).from(accommodationRequests);
        const [pendingRequests] = await db.select({ count: sql<number>`count(*)` }).from(accommodationRequests).where(eq(accommodationRequests.status, 'pending'));
        const [approved] = await db.select({ count: sql<number>`count(*)` }).from(accommodationRequests).where(eq(accommodationRequests.status, 'approved'));
        const [checkedIn] = await db.select({ count: sql<number>`count(*)` }).from(accommodationRequests).where(eq(accommodationRequests.checkedIn, true));

        // 2. Bed Stats (Capacity vs Occupied)
        const [bedStats] = await db.select({
            totalCapacity: sql<number>`sum(${accommodationProperties.capacity})`,
            totalOccupied: sql<number>`sum(${accommodationProperties.occupied})`
        }).from(accommodationProperties);

        const availableBeds = (bedStats?.totalCapacity || 0) - (bedStats?.totalOccupied || 0);

        return NextResponse.json({
            stats: {
                totalRequests: totalRequests.count,
                pending: pendingRequests.count,
                approved: approved.count,
                checkedIn: checkedIn.count,
                availableBeds
            }
        });

    } catch (error) {
        console.error("Stats API Error", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
