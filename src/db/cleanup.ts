import { db } from '../lib/db.js';
import { users, events, registrations, passes, accommodationRequests, transactions, settlements, ticketBatches, ticketSales, coupons, tasks } from './schema.js';
import { eq, ne } from 'drizzle-orm';

async function cleanupDatabase() {
    try {
        console.log('🧹 Starting database cleanup...');

        // Keep only the admin user (sriramkundapur777@gmail.com)
        const [adminUser] = await db.select().from(users).where(eq(users.email, 'sriramkundapur777@gmail.com'));

        if (!adminUser) {
            console.error('❌ Admin user not found! Aborting cleanup.');
            process.exit(1);
        }

        console.log(`✅ Found admin user: ${adminUser.email} (ID: ${adminUser.id})`);

        // Delete all users except admin
        const deletedUsers = await db.delete(users).where(ne(users.id, adminUser.id));
        console.log('✅ Deleted all non-admin users');

        // Delete all events
        await db.delete(events);
        console.log('✅ Deleted all events');

        // Delete all registrations
        await db.delete(registrations);
        console.log('✅ Deleted all registrations');

        // Delete all passes
        await db.delete(passes);
        console.log('✅ Deleted all passes');

        // Delete all accommodation requests
        await db.delete(accommodationRequests);
        console.log('✅ Deleted all accommodation requests');

        // Delete all transactions
        await db.delete(transactions);
        console.log('✅ Deleted all transactions');

        // Delete all settlements
        await db.delete(settlements);
        console.log('✅ Deleted all settlements');

        // Delete all ticket batches
        await db.delete(ticketBatches);
        console.log('✅ Deleted all ticket batches');

        // Delete all ticket sales
        await db.delete(ticketSales);
        console.log('✅ Deleted all ticket sales');

        // Keep coupons and tasks as they might be assigned to volunteers
        console.log('ℹ️  Kept coupons and tasks (may be assigned to volunteers)');

        console.log('\n🎉 Database cleanup complete!');
        console.log(`\n📊 Remaining data:`);
        console.log(`   - Admin user: ${adminUser.email}`);
        console.log(`   - All other tables: EMPTY`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupDatabase();
