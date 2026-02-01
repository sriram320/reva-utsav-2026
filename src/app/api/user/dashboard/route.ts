import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { registrations, events, passes } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/user/dashboard - Get user's registrations and passes
export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id);

        // Get user's event registrations with event details
        const userRegistrations = await db
            .select({
                id: registrations.id,
                eventId: registrations.eventId,
                status: registrations.status,
                paymentId: registrations.paymentId,
                registeredAt: registrations.registeredAt,
                eventName: events.name,
                eventCategory: events.category,
                eventDate: events.date,
                eventVenue: events.venue,
                eventFees: events.fees
            })
            .from(registrations)
            .leftJoin(events, eq(registrations.eventId, events.id))
            .where(eq(registrations.userId, userId));

        // Get user's passes
        const userPasses = await db
            .select()
            .from(passes)
            .where(eq(passes.userId, userId));

        return NextResponse.json({
            registrations: userRegistrations,
            passes: userPasses
        });
    } catch (error) {
        console.error('User dashboard GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
