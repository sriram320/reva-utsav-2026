
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { accommodationRequests, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/admin/users/[userId]/accommodation
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const session = await auth();

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if admin
        const [adminUser] = await db.select().from(users).where(eq(users.id, parseInt(session.user.id)));
        if (adminUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { action, roomAllotted, checkedIn, status } = body;
        // actions: 'allot_room', 'check_in', 'update_status'

        const targetUserId = parseInt(userId);

        // Check if request exists
        const [existingRequest] = await db.select().from(accommodationRequests).where(eq(accommodationRequests.userId, targetUserId));

        if (!existingRequest) {
            // Create if not exists (Admin manual assignment)
            await db.insert(accommodationRequests).values({
                userId: targetUserId,
                status: status || 'approved',
                roomNumber: roomAllotted || null,
                checkedIn: checkedIn || false,
                checkInDate: new Date(), // Default to now if manually adding
                numberOfDays: 1
            });
        } else {
            // Update existing
            const updateData: any = {};
            if (roomAllotted !== undefined) updateData.roomNumber = roomAllotted;
            if (checkedIn !== undefined) updateData.checkedIn = checkedIn;
            if (status !== undefined) updateData.status = status;

            await db.update(accommodationRequests)
                .set(updateData)
                .where(eq(accommodationRequests.id, existingRequest.id));
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update accommodation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
