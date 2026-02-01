import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { settlements, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/admin/financials/settlements - Settle a payment
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { settlementId } = body;

        if (!settlementId) {
            return NextResponse.json({ error: 'Settlement ID required' }, { status: 400 });
        }

        // Get settlement details
        const [settlement] = await db.select().from(settlements).where(eq(settlements.id, settlementId));

        if (!settlement) {
            return NextResponse.json({ error: 'Settlement not found' }, { status: 404 });
        }

        // Update settlement status
        await db.update(settlements)
            .set({
                status: 'Settled',
                amountDue: 0,
                lastPaidDate: new Date()
            })
            .where(eq(settlements.id, settlementId));

        // Auto-create expense transaction
        if (settlement.amountDue && settlement.amountDue > 0) {
            await db.insert(transactions).values({
                description: `Settlement: ${settlement.name}`,
                category: 'Accommodation',
                amount: settlement.amountDue || 0,
                isIncome: false,
                createdBy: parseInt(session.user?.id || '0')
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Settlement POST error:', error);
        return NextResponse.json({ error: 'Failed to settle payment' }, { status: 500 });
    }
}

// PUT /api/admin/financials/settlements - Create or update settlement
export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { name, type, amountDue } = body;

        if (!name || !type) {
            return NextResponse.json({ error: 'Name and type required' }, { status: 400 });
        }

        const [newSettlement] = await db.insert(settlements).values({
            name,
            type,
            amountDue: amountDue || 0
        }).returning();

        return NextResponse.json({ success: true, settlement: newSettlement });
    } catch (error) {
        console.error('Settlement PUT error:', error);
        return NextResponse.json({ error: 'Failed to create settlement' }, { status: 500 });
    }
}
