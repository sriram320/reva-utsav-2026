import 'dotenv/config';
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log("Dropping accommodation tables...");
    try {
        await db.execute(sql`DROP TABLE IF EXISTS "accommodation_requests" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "accommodation_properties" CASCADE`);
        console.log("Tables dropped successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error dropping tables:", error);
        process.exit(1);
    }
}

main();
