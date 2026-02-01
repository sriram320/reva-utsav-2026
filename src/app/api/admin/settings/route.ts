import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { db } from '@/lib/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/settings - Get global settings
export async function GET() {
    try {
        const allSettings = await db.select().from(settings);
        const settingsMap: Record<string, string> = {};
        allSettings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// POST /api/admin/settings - Update setting
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { key, value } = body;

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        // Upsert setting
        await db.insert(settings).values({ key, value })
            .onConflictDoUpdate({ target: settings.key, set: { value } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Settings POST error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
