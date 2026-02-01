import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/events - Get all events (public)
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const category = url.searchParams.get('category');

        let query = db.select().from(events);

        // Filter by category if provided
        if (category && category !== 'All') {
            const allEvents = await query;
            const filtered = allEvents.filter(e => e.category === category);
            return NextResponse.json({ events: filtered });
        }

        const allEvents = await query;
        return NextResponse.json({ events: allEvents });
    } catch (error) {
        console.error('Events GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
