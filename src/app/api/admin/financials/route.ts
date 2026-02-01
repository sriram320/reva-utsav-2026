import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { transactions, settlements } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/admin/financials - Get all transactions and settlements
export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
        const allSettlements = await db.select().from(settlements);

        // Calculate summary
        const totalRevenue = allTransactions
            .filter(t => t.isIncome)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = allTransactions
            .filter(t => !t.isIncome)
            .reduce((sum, t) => sum + t.amount, 0);

        const pendingSettlements = allSettlements
            .filter(s => s.status === 'Pending')
            .reduce((sum, s) => sum + (s.amountDue || 0), 0);

        return NextResponse.json({
            transactions: allTransactions,
            settlements: allSettlements,
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit: totalRevenue - totalExpenses,
                pendingSettlements
            }
        });
    } catch (error) {
        console.error('Financials GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/financials - Add new transaction
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { description, category, amount, isIncome } = body;

        if (!description || !category || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [newTransaction] = await db.insert(transactions).values({
            description,
            category,
            amount: parseInt(amount),
            isIncome: isIncome || false,
            createdBy: parseInt(session.user.id!)
        }).returning();

        return NextResponse.json({ success: true, transaction: newTransaction });
    } catch (error) {
        console.error('Financials POST error:', error);
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}

// DELETE /api/admin/financials/:id - Delete transaction
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
        }

        await db.delete(transactions).where(eq(transactions.id, parseInt(id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Financials DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}
