import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { events } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/events - Get all events
export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const allEvents = await db.select().from(events).orderBy(desc(events.date));

        return NextResponse.json({ events: allEvents });
    } catch (error) {
        console.error('Admin Events GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/events - Create new event
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { name, description, category, rules, imageUrl, date, venue, teamSize, fees, coordinators } = body;

        if (!name || !category) {
            return NextResponse.json({ error: 'Name and category required' }, { status: 400 });
        }

        const [newEvent] = await db.insert(events).values({
            name,
            description,
            category,
            rules: rules || [],
            imageUrl,
            date: date ? new Date(date) : null,
            venue,
            teamSize: teamSize || 1,
            fees: fees || 0,
            coordinators: coordinators || []
        }).returning();

        return NextResponse.json({ success: true, event: newEvent });
    } catch (error) {
        console.error('Admin Events POST error:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}

// PATCH /api/admin/events - Update event
export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
        }

        // Convert date string to Date object if present
        if (updateData.date) {
            updateData.date = new Date(updateData.date);
        }

        await db.update(events)
            .set(updateData)
            .where(eq(events.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin Events PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

// DELETE /api/admin/events - Delete event
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
        }

        await db.delete(events).where(eq(events.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin Events DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
