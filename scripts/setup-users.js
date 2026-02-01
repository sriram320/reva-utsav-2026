
const fetch = require('node-fetch');
const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL);

async function createAdmin() {
    const adminUser = {
        name: "Super Admin",
        email: "admin@reva.edu",
        password: "AdminPassword123!",
        college: "REVA University",
        phone: "9999999999"
    };

    console.log('1. Registering Admin User...');
    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminUser)
        });

        if (res.status === 409) {
            console.log('   User already exists. Proceeding to promote.');
        } else if (res.ok) {
            console.log('   Registration Successful.');
        } else {
            console.error('   Registration Failed:', await res.json());
            process.exit(1);
        }

        console.log('2. Promoting to Admin Role...');
        await sql`
            UPDATE users 
            SET role = 'admin', image = 'https://github.com/shadcn.png'
            WHERE email = ${adminUser.email}
        `;
        console.log('   Role updated to ADMIN.');

        // Also ensure a volunteer exists for task assignment testing
        const volUser = {
            name: "Volunteer One",
            email: "volunteer@reva.edu",
            password: "VolunteerPass123!",
            college: "REVA University",
            phone: "8888888888"
        };
        console.log('3. Registering Volunteer User...');
        const volRes = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(volUser)
        });
        if (volRes.ok || volRes.status === 409) {
            await sql`
                UPDATE users SET role = 'volunteer' WHERE email = ${volUser.email}
            `;
            console.log('   Volunteer created and role set.');
        }

        console.log('✅ Setup Complete. Ready for Browser Testing.');
        process.exit(0);

    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

createAdmin();
