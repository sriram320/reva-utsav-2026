
import 'dotenv/config';
import { db } from "../lib/db";
import { users } from "./schema";

async function main() {
    const allUsers = await db.select().from(users);
    console.log("Registered Users:", JSON.stringify(allUsers, null, 2));
}

main();
