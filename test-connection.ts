import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('Testing connection to:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); // Mask password

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function main() {
    try {
        console.log('Connecting...');
        const result = await sql`SELECT version()`;
        console.log('✅ Connection successful!');
        console.log('Database Version:', result[0].version);
        process.exit(0);
    } catch (e) {
        console.error('❌ Connection failed:', e);
        process.exit(1);
    }
}

main();
