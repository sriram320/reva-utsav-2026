
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accommodationRequests, accommodationProperties } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;
        if (!session || (user?.role !== 'admin' && user?.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { requestId, propertyId } = await req.json();

        // 1. Assign property
        await db.update(accommodationRequests)
            .set({
                assignedPropertyId: propertyId,
                status: 'approved',
                // checkedIn: true // Optional: Maybe check-in is a separate step? User said "Assignments... then check in".
                // User said: "Admin will automatically assign them... until then we take payment... and tell whats their payment status"
                // The "Assignments" happens when they come to the event.
            })
            .where(eq(accommodationRequests.id, requestId));

        // 2. Increment Occupancy
        await db.update(accommodationProperties)
            .set({ occupied: sql`${accommodationProperties.occupied} + 1` })
            .where(eq(accommodationProperties.id, propertyId));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Assignment API Error", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
