import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { registrations, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/events/[id]/registrations
export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await context.params;
        const eventId = parseInt(id);
        if (isNaN(eventId)) {
            return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
        }

        const eventRegistrations = await db
            .select({
                id: registrations.id,
                status: registrations.status,
                registeredAt: registrations.registeredAt,
                paymentId: registrations.paymentId,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    phone: users.phone,
                    srn: users.srn,
                    college: users.college,
                    department: users.department,
                }
            })
            .from(registrations)
            .where(eq(registrations.eventId, eventId))
            .leftJoin(users, eq(registrations.userId, users.id))
            .orderBy(desc(registrations.registeredAt));

        return NextResponse.json({ registrations: eventRegistrations });
    } catch (error) {
        console.error('Admin Event Registrations GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
