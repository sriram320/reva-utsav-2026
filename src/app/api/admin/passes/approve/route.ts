import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { passes } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/admin/passes/approve - Approve or Reject a pass
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { passId, action } = body; // action: 'approve' or 'reject'

        if (!passId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const status = action === 'approve' ? 'active' : 'rejected';

        await db.update(passes)
            .set({ status })
            .where(eq(passes.id, passId));

        // TODO: Send email notification (Mock for now)
        console.log(`Pass ${passId} ${action}ed. Notification sent.`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Pass approval error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
