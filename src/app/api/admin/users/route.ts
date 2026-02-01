
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { users, settings, accommodationRequests, passes, registrations } from '@/db/schema';
import { eq, ilike, or } from 'drizzle-orm';

// GET /api/admin/users - List users (optional filter by role, query, or participantId)
export async function GET(req: Request) {
    try {
        const session = await auth();
        // Allow admin OR volunteer (volunteers need to search participants)
        if (!session || !['admin', 'volunteer'].includes((session.user as any)?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const url = new URL(req.url);
        const roleFilter = url.searchParams.get('role');
        const queryParam = url.searchParams.get('query');
        const participantId = url.searchParams.get('participantId');

        let query = db.select().from(users).$dynamic();

        if (queryParam) {
            query = query.where(
                or(
                    ilike(users.name, `%${queryParam}%`),
                    ilike(users.email, `%${queryParam}%`),
                    ilike(users.participantId, `%${queryParam}%`)
                )
            );
        } else if (roleFilter) {
            query = query.where(eq(users.role, roleFilter));
        }

        const allUsers = await query;

        // Only fetch extra details if NOT listing staff (optimization)
        if (roleFilter === 'volunteer' || roleFilter === 'admin') {
            return NextResponse.json({ users: allUsers });
        }

        const allAccommodation = await db.select().from(accommodationRequests);
        const allPasses = await db.select().from(passes);
        const allRegistrations = await db.select().from(registrations);

        const usersWithDetails = allUsers.map(u => ({
            ...u,
            password: null,
            accommodation: allAccommodation.find(a => a.userId === u.id) || null,
            pass: allPasses.find(p => p.userId === u.id) || null,
            registrationCount: allRegistrations.filter(r => r.userId === u.id).length
        }));

        return NextResponse.json({ users: usersWithDetails });

    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/admin/users - Update User Role
export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { userId, role } = body;

        if (!userId || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        await db.update(users).set({ role }).where(eq(users.id, userId));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

// DELETE /api/admin/users - Delete User
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const url = new URL(req.url);
        const userId = url.searchParams.get('userId') || url.searchParams.get('id');

        if (!userId) return NextResponse.json({ error: 'Missing userId or id' }, { status: 400 });

        const id = Number(userId);

        // Fetch user to check protection
        const [targetUser] = await db.select().from(users).where(eq(users.id, id));

        if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // PROTECTED USERS (Only Sriram is protected now)
        const PROTECTED_EMAILS = ['sriramkundapur777@gmail.com'];
        if (PROTECTED_EMAILS.includes(targetUser.email)) {
            return NextResponse.json({ error: 'Cannot delete Super Admin' }, { status: 403 });
        }

        // Cascade delete related records
        await db.delete(passes).where(eq(passes.userId, id));
        await db.delete(registrations).where(eq(registrations.userId, id));
        await db.delete(accommodationRequests).where(eq(accommodationRequests.userId, id));
        // Also coupons assigned to them if any? Maybe nullify
        // For now, hard delete user
        await db.delete(users).where(eq(users.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete failed:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
