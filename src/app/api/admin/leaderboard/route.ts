
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { users, coupons, registrations, passes } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

// GET /api/admin/leaderboard - Get Top Volunteers
export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Get all coupons with assigned users
        const allCoupons = await db.select({
            code: coupons.code,
            volunteerId: coupons.assignedTo,
            volunteerName: users.name,
            volunteerEmail: users.email
        })
            .from(coupons)
            .leftJoin(users, eq(coupons.assignedTo, users.id));

        // 2. Count registrations per code
        // Ideally use group by in SQL, but for now simple JS aggregation 
        // (Assuming volume < 10k, JS is fine and easier to debug Drizzle joins)

        const allRegistrations = await db.select({ code: registrations.couponCode }).from(registrations);
        const allPasses = await db.select({ code: passes.couponCode }).from(passes);

        const codeCounts: Record<string, number> = {};

        [...allRegistrations, ...allPasses].forEach(r => {
            if (r.code) codeCounts[r.code] = (codeCounts[r.code] || 0) + 1;
        });

        // 3. Map to Volunteers
        const volunteerStats: Record<number, { name: string, email: string, count: number }> = {};

        allCoupons.forEach(c => {
            if (!c.volunteerId) return;
            const count = codeCounts[c.code] || 0;
            if (!volunteerStats[c.volunteerId]) {
                volunteerStats[c.volunteerId] = {
                    name: c.volunteerName || 'Unknown',
                    email: c.volunteerEmail || '',
                    count: 0
                };
            }
            volunteerStats[c.volunteerId].count += count;
        });

        const leaderboard = Object.values(volunteerStats)
            .sort((a, b) => b.count - a.count)
            .filter(v => v.count > 0); // Only show active

        return NextResponse.json({ leaderboard });
    } catch (e) { return NextResponse.json({ error: 'Error fetching leaderboard' }, { status: 500 }); }
}
