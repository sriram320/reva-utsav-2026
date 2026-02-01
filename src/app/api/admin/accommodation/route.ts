import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { accommodationRequests } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/accommodation - Get all accommodation requests
export async function GET() {
    try {
        const session = await auth();
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const requests = await db.select().from(accommodationRequests).orderBy(desc(accommodationRequests.createdAt));

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Accommodation GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/admin/accommodation - Delete accommodation request
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
        }

        await db.delete(accommodationRequests).where(eq(accommodationRequests.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Accommodation DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
    }
}

// PATCH /api/admin/accommodation - Update accommodation request (approve/reject/allot room)
export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { requestId, status, roomAllotted, checkedIn } = body;

        if (!requestId) {
            return NextResponse.json({ error: 'Request ID required' }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (roomAllotted !== undefined) updateData.roomAllotted = roomAllotted;
        if (checkedIn !== undefined) updateData.checkedIn = checkedIn;

        await db.update(accommodationRequests)
            .set(updateData)
            .where(eq(accommodationRequests.id, requestId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Accommodation PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }
}
