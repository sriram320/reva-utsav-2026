
import { NextResponse } from 'next/server';
import { auth } from "@/auth"; // V5
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// POST /api/admin/volunteers - Create volunteer
export async function POST(req: Request) {
    try {
        const session = await auth();
        const currentUser = session?.user;

        // Verify Admin Access
        const [adminUser] = await db.select().from(users).where(eq(users.id, Number(currentUser?.id)));
        if (adminUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 });
        }


        const body = await req.json();
        const { name, email, password, role } = body; // Role optional

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Check if email exists
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const newUser = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            visiblePassword: password, // Store plain text for Admin reference
            role: role || 'volunteer', // Default to volunteer if not specified
            college: 'REVA University', // Default for staff
            phone: '',
            // state/district optional
        }).returning();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Create volunteer error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
