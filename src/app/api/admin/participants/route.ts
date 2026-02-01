import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { users, registrations, events, passes } from '@/db/schema';
import { eq, isNull, sql } from 'drizzle-orm';

// Helper function to generate participant ID
async function generateParticipantId() {
    // Get the highest existing participant ID number
    const [lastUser] = await db
        .select({ participantId: users.participantId })
        .from(users)
        .where(sql`${users.participantId} IS NOT NULL`)
        .orderBy(sql`${users.participantId} DESC`)
        .limit(1);

    let nextNumber = 1;
    if (lastUser?.participantId) {
        const match = lastUser.participantId.match(/REVA-UTS-(\d+)/);
        if (match) {
            nextNumber = parseInt(match[1]) + 1;
        }
    }

    return `REVA-UTS-${String(nextNumber).padStart(3, '0')}`;
}

// GET /api/admin/participants - List all participants with their registrations
export async function GET() {
    try {
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;
        if (!session || (user?.role !== 'admin' && user?.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch all users (excluding admins and volunteers)
        const allUsers = await db
            .select()
            .from(users)
            .where(eq(users.role, 'user'));

        // Generate participant IDs for users who don't have one
        for (const user of allUsers) {
            if (!user.participantId) {
                const newId = await generateParticipantId();
                await db.update(users)
                    .set({ participantId: newId })
                    .where(eq(users.id, user.id));
                user.participantId = newId;
            }
        }

        // Fetch event registrations for each user
        const participantsWithDetails = await Promise.all(
            allUsers.map(async (user) => {
                // Get event registrations
                const userRegistrations = await db
                    .select({
                        eventId: events.id,
                        eventName: events.name,
                        eventCategory: events.category,
                        status: registrations.status,
                        paymentId: registrations.paymentId,
                    })
                    .from(registrations)
                    .leftJoin(events, eq(registrations.eventId, events.id))
                    .where(eq(registrations.userId, user.id));

                // Get passes
                const userPasses = await db
                    .select({
                        passType: passes.passType,
                        passId: passes.passId,
                        status: passes.status,
                        checkedIn: passes.checkedIn,
                        id: passes.id,
                    })
                    .from(passes)
                    .where(eq(passes.userId, user.id));

                return {
                    id: user.id,
                    participantId: user.participantId,
                    name: user.name,
                    email: user.email,
                    college: user.college,
                    phone: user.phone,
                    verified: user.verified,
                    createdAt: user.createdAt,
                    govtIdUrl: user.govtIdUrl,
                    events: userRegistrations,
                    passes: userPasses,
                };
            })
        );

        return NextResponse.json({ participants: participantsWithDetails });
    } catch (error) {
        console.error('Error fetching participants:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/admin/participants/:id/verify - Mark participant as verified
export async function PATCH(req: Request) {
    try {
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;
        if (!session || (user?.role !== 'admin' && user?.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { userId, verified, govtIdUrl } = await req.json();

        // Prepare update data
        const updateData: { verified: boolean; govtIdUrl?: string } = { verified };
        if (govtIdUrl !== undefined) {
            updateData.govtIdUrl = govtIdUrl;
        }

        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating verification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
