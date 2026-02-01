import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { ticketBatches, ticketSales } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/admin/ticketing/batch - Create new batch
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { name, price, capacity } = body;

        if (!name) {
            return NextResponse.json({ error: 'Batch name required' }, { status: 400 });
        }

        const [newBatch] = await db.insert(ticketBatches).values({
            name,
            price: price || 299,
            capacity: capacity || 100,
            totalTickets: capacity || 100,
            soldTickets: 0,
            status: 'Scheduled'
        }).returning();

        return NextResponse.json({ success: true, batch: newBatch });
    } catch (error) {
        console.error('Batch POST error:', error);
        return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
    }
}

// DELETE /api/admin/ticketing/batch - Delete batch
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Batch ID required' }, { status: 400 });
        }

        const batchId = parseInt(id);

        // Check for existing sales
        const [sales] = await db.select({ count: ticketSales.id }).from(ticketSales).where(eq(ticketSales.batchId, batchId));

        if (sales) {
            return NextResponse.json({ error: 'Cannot delete batch that has sold tickets.' }, { status: 400 });
        }

        await db.delete(ticketBatches).where(eq(ticketBatches.id, batchId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Batch DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 });
    }
}

// PATCH /api/admin/ticketing/batch - Update batch status
export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Batch ID and Status required' }, { status: 400 });
        }

        await db.update(ticketBatches)
            .set({ status })
            .where(eq(ticketBatches.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Batch PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update batch' }, { status: 500 });
    }
}
