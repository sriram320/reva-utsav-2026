import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ticketBatches } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET /api/ticketing/public - Public access to ticket info
export async function GET() {
    try {
        // Only fetch Active or Scheduled batches for public
        const batches = await db.select()
            .from(ticketBatches)
            .where(eq(ticketBatches.status, 'Active')) // Or Scheduled
            .orderBy(desc(ticketBatches.createdAt));

        return NextResponse.json({
            batches,
            status: 'ACTIVE' // Hardcoded for now or fetch from settings
        });
    } catch (error) {
        console.error('Public Ticketing API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
