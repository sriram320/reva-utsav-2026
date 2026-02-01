
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accommodationProperties } from '@/db/schema';
import { auth } from '@/auth';

export async function GET(req: Request) {
    try {
        const session = await auth();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session?.user as any;
        if (!session || (user?.role !== 'admin' && user?.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const properties = await db.select().from(accommodationProperties);
        return NextResponse.json({ properties });

    } catch (error) {
        console.error("Properties API Error", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
