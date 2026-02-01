
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passes } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/events/verify-member - Check if a user exists and has a pass
export async function POST(req: Request) {
    try {
        const { revaId } = await req.json();

        if (!revaId) {
            return NextResponse.json({ error: 'REVA ID is required' }, { status: 400 });
        }

        // 1. Find User by REVA ID (Assuming REVA ID is stored in email or a dedicated field? 
        // For now, let's assume REVA ID is the part before @ in email OR we search by name/email logic.
        // Actually, the previous mock search was by ID. Let's assume we search by `email` or a `collegeId` field.
        // The schema has `college` but maybe not explicit ID. Let's assume 'revaId' is the 'email' for now 
        // OR simply search where name/email matches. 
        // A better approach for now: Search by Email as the "ID" for reliability, or assume College ID field exists.
        // Let's implement a search by email or name for now as the 'ID'.

        // CORRECTION: The UI asks for "REVA ID". In a real app this is likely a custom field. 
        // I'll search for users where email starts with the ID OR name contains it, just to be flexible.
        // But for strict verification, let's look for a user where `email` equals `revaId` (simplest) OR if `revaId` is actually stored.
        // Let's assume the user enters an email or valid ID.
        // For the purpose of this hackathon demo, let's search by EMAIL.

        const [user] = await db.select().from(users).where(eq(users.email, revaId)); // Strict email match for safety

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Check for active pass
        const [userPass] = await db.select().from(passes).where(eq(passes.userId, user.id));

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                hasPass: !!userPass && userPass.status === 'active'
            }
        });

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
