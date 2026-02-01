import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { passes } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/admin/checkin - Check in a pass
export async function POST(req: Request) {
    try {
        const session = await auth();
        // Allow volunteer or admin
        if (!session || (session.user as any)?.role !== 'admin' && (session.user as any)?.role !== 'volunteer') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { passId } = body;

        if (!passId) {
            return NextResponse.json({ error: 'Pass ID is required' }, { status: 400 });
        }

        // Update to checked in
        await db.update(passes)
            .set({ checkedIn: true })
            .where(eq(passes.id, passId));

        return NextResponse.json({ success: true, message: "Checked In Successfully" });
    } catch (error) {
        console.error('Check-in error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
