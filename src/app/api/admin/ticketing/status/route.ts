import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { status } = body;

        // Store in settings table
        const { settings } = await import('@/db/schema');
        await db.insert(settings).values({
            key: 'ticketing_status',
            value: status
        }).onConflictDoUpdate({
            target: settings.key,
            set: { value: status }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Status PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
}
