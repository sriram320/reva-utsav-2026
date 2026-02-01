import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/events/[id] - Get single event details
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const eventId = parseInt(id);

        if (isNaN(eventId)) {
            return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
        }

        const [event] = await db.select().from(events).where(eq(events.id, eventId));

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json({ event });
    } catch (error) {
        console.error('Event GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
