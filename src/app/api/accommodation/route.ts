import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { accommodationRequests, settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if accommodation booking is enabled
        const [enabledSetting] = await db.select().from(settings).where(eq(settings.key, 'accommodation_open'));
        const isEnabled = enabledSetting?.value === 'true';

        // Get user's accommodation request status
        const [request] = await db.select().from(accommodationRequests).where(eq(accommodationRequests.userId, parseInt(session.user.id)));

        return NextResponse.json({
            enabled: isEnabled,
            request: request || null
        });
    } catch (error) {
        console.error('Accommodation GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if accommodation booking is enabled
        const [enabledSetting] = await db.select().from(settings).where(eq(settings.key, 'accommodation_open'));
        if (enabledSetting?.value !== 'true') {
            return NextResponse.json({ error: 'Accommodation booking is currently disabled' }, { status: 403 });
        }

        const body = await req.json();
        const { checkInDate, checkOutDate, numberOfDays } = body;

        // Check if user already has a request
        const [existingRequest] = await db.select().from(accommodationRequests).where(eq(accommodationRequests.userId, parseInt(session.user.id)));
        if (existingRequest) {
            return NextResponse.json({ error: 'You already have an accommodation request' }, { status: 400 });
        }

        await db.insert(accommodationRequests).values({
            userId: parseInt(session.user.id),
            checkInDate: new Date(checkInDate),
            checkOutDate: new Date(checkOutDate),
            numberOfDays: numberOfDays,
            status: 'pending'
        });

        return NextResponse.json({ success: true, message: 'Accommodation request submitted successfully' });
    } catch (error) {
        console.error('Accommodation POST error:', error);
        return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }
}
