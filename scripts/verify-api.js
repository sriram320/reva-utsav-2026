
const fetch = require('node-fetch');

async function runVerification() {
    const baseUrl = 'http://localhost:3000';
    console.log('Starting API Verification...');

    // 1. Verify Public Endpoints
    console.log('\n--- 1. Testing Public Endpoints ---');
    try {
        const eventsRes = await fetch(`${baseUrl}/api/events`);
        console.log(`GET /api/events: ${eventsRes.status}`);
        if (eventsRes.ok) {
            const data = await eventsRes.json();
            console.log(`  Events found: ${data.events ? data.events.length : 0}`);
        } else {
            console.error('  Failed to fetch events');
        }
    } catch (e) { console.error('  Error fetching events:', e.message); }

    // 2. Verify Registration (New User)
    console.log('\n--- 2. Testing Registration ---');
    const testUser = {
        name: "Auto Test User",
        email: `autotest_${Date.now()}@example.com`,
        password: "TestPassword123!",
        college: "Test University",
        phone: "9999999999"
    };

    try {
        const regRes = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        console.log(`POST /api/auth/register: ${regRes.status}`);
        const regData = await regRes.json();

        if (regRes.ok) {
            console.log('  Registration Successful!');
            console.log(`  User ID: ${regData.user?.id}`);
            console.log(`  Email: ${regData.user?.email}`);
        } else {
            console.error('  Registration Failed:', regData);
        }
    } catch (e) { console.error('  Error during registration:', e.message); }

    // 3. Verify Admin Access (Should be Unauthorized without cookie)
    console.log('\n--- 3. Testing Admin Access (Expected 401/403) ---');
    try {
        const taskRes = await fetch(`${baseUrl}/api/admin/tasks`);
        console.log(`GET /api/admin/tasks: ${taskRes.status}`);
        if (taskRes.status === 401 || taskRes.status === 403) {
            console.log('  Correctly denied access (Unauthorized/Forbidden)');
        } else {
            console.warn(`  Unexpected status: ${taskRes.status}`);
        }
    } catch (e) { console.error('  Error checking admin:', e.message); }
}

runVerification();
