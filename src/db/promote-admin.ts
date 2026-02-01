
import 'dotenv/config';
import { db } from "../lib/db";
import { users } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
    const email = "sriramkundapur777@gmail.com";

    console.log(`Promoting ${email} to ADMIN...`);

    await db.update(users)
        .set({ role: 'admin' })
        .where(eq(users.email, email));

    console.log("Success! User is now Admin.");
}

main();
