import { db } from "@/lib/db";
import { ticketBatches } from "@/db/schema";

async function seed() {
    console.log("Seeding active ticket batch...");
    try {
        await db.insert(ticketBatches).values({
            name: "Early Bird Pass",
            price: 299,
            capacity: 1000,
            status: "Active",
            totalTickets: 1000,
            soldTickets: 0
        });
        console.log("Seeding complete: Active batch created.");
    } catch (e) {
        console.error("Seeding failed:", e);
    }
}

seed();
