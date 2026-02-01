import 'dotenv/config';
import { db } from '../lib/db';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
    console.log("Checking for admin user...");
    const email = "admin@reva.edu";
    const password = "adminpassword"; // Simple password for testing

    const [existing] = await db.select().from(users).where(eq(users.email, email));

    if (existing) {
        console.log("Admin user already exists. Updating password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.update(users).set({
            password: hashedPassword,
            role: 'admin' // Ensure role is admin
        }).where(eq(users.email, email));
        console.log("Admin updated.");
    } else {
        console.log("Creating new admin user...");
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.insert(users).values({
            name: "Chief Admin",
            email: email,
            password: hashedPassword,
            role: 'admin',
            college: "REVA University",
            phone: "9999999999"
        });
        console.log("Admin created.");
    }
    process.exit(0);
}

seedAdmin().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
