import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

if (!process.env.DATABASE_URL) {
    console.warn('⚠️ DATABASE_URL is missing. Using dummy connection for build.');
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const connectionString = process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db";
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
