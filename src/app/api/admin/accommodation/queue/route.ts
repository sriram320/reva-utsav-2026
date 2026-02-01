
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accommodationRequests, users, accommodationProperties } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;
        if (!session || (user?.role !== 'admin' && user?.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const requests = await db.select({
            id: accommodationRequests.id,
            status: accommodationRequests.status,
            paymentStatus: accommodationRequests.paymentStatus,
            checkedIn: accommodationRequests.checkedIn,
            createdAt: accommodationRequests.createdAt,
            user: {
                id: users.id,
                name: users.name,
                email: users.email,
                phone: users.phone,
                participantId: users.participantId,
                gender: users.gender,
            },
            assignedProperty: {
                name: accommodationProperties.name
            }
        })
            .from(accommodationRequests)
            .leftJoin(users, eq(accommodationRequests.userId, users.id))
            .leftJoin(accommodationProperties, eq(accommodationRequests.assignedPropertyId, accommodationProperties.id))
            .orderBy(desc(accommodationRequests.createdAt));

        return NextResponse.json({ requests });

    } catch (error) {
        console.error("Queue API Error", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
