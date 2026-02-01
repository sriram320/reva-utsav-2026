import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { passes, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/passes/pending - Get all pending passes
export async function GET() {
    try {
        const session = await auth();
        // Check admin role (cast to any because role is not in default session type)
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const pendingPasses = await db
            .select({
                id: passes.id,
                passType: passes.passType,
                passId: passes.passId,
                amountPaid: passes.amountPaid,
                purchaseDate: passes.purchaseDate,
                userId: passes.userId,
                userName: users.name,
                userEmail: users.email,
                userSrn: users.srn,
                userDept: users.department,
                userPhone: users.phone,
            })
            .from(passes)
            .leftJoin(users, eq(passes.userId, users.id))
            .where(eq(passes.status, 'pending_verification'))
            .orderBy(desc(passes.purchaseDate));

        return NextResponse.json({ passes: pendingPasses });
    } catch (error) {
        console.error('Pending passes error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
