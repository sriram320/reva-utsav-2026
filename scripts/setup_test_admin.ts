
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const email = 'superadmin@reva.edu.in';
    const password = 'password123';

    console.log('Ensure Admin User Exists:', email);

    // 1. Try to register via API (to get hashed password)
    // We assume the dev server is running at localhost:3000
    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Super Admin',
                email,
                password,
                college: 'Admin Dept'
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log('Created new user via API');
        } else {
            console.log('API Response:', data);
            if (data.error === 'Email already registered') {
                console.log('User already exists, proceeding to promote.');
            } else {
                console.error('Failed to register user:', data.error);
                // Proceed anyway, maybe it exists but API failed differently?
            }
        }
    } catch (e) {
        console.error('Fetch error (server running?):', e);
        // Fallback: If fetch fails, we can't create with hash easily unless we import bcrypt here
        // But assuming dev server is UP.
    }

    // 2. Promote to Admin directly in DB
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (user) {
            await db.update(users)
                .set({ role: 'admin' })
                .where(eq(users.email, email));
            console.log('Successfully promoted user to ADMIN');
        } else {
            console.error('User not found in DB, cannot promote.');
        }
    } catch (e) {
        console.error('DB Error:', e);
    }

    process.exit(0);
}

main();
