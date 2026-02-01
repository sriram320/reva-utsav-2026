import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { users, registrations, events, accommodationRequests, passes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user data
        const [currentUser] = await db.select().from(users).where(eq(users.email, session.user.email));

        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Fetch user's passes
        const userPasses = await db.select().from(passes).where(eq(passes.userId, currentUser.id));

        // Fetch user's event registrations with event details
        const userRegistrations = await db
            .select({
                id: registrations.id,
                status: registrations.status,
                registeredAt: registrations.registeredAt,
                eventName: events.name,
                eventCategory: events.category,
                eventDate: events.date,
                eventVenue: events.venue,
            })
            .from(registrations)
            .leftJoin(events, eq(registrations.eventId, events.id))
            .where(eq(registrations.userId, currentUser.id));

        // Fetch accommodation status
        const [accommodation] = await db
            .select()
            .from(accommodationRequests)
            .where(eq(accommodationRequests.userId, currentUser.id));

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = currentUser;

        return NextResponse.json({
            user: userWithoutPassword,
            passes: userPasses,
            registrations: userRegistrations,
            accommodation: accommodation || null,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, phone, college, state, district } = body;

        // Validation
        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: 'Name must be at least 2 characters' },
                { status: 400 }
            );
        }

        // Update user
        await db
            .update(users)
            .set({
                name: name.trim(),
                phone: phone || null,
                college: college || null,
                state: state || null,
                district: district || null,
            })
            .where(eq(users.id, parseInt(session.user.id)));

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

