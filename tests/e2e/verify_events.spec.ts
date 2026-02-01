import { test, expect } from '@playwright/test';

test.describe('Admin Events Verification', () => {
    test('Create and Verify Event', async ({ page }) => {
        // 1. Login
        await page.goto('/staff-login'); // Assuming this is the login page for admins/staff
        await page.fill('input[name="email"]', 'tempadmin@test.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for redirect to default page (registration-desk)
        await page.waitForURL('**/registration-desk');

        // 2. Go to Events
        await page.goto('/admin/events');

        // 3. Create Event
        await page.click('text=Create Event');
        await page.fill('input[placeholder="e.g. RoboWars 2026"]', 'Verification Event 2026');
        await page.selectOption('select', 'Technical');
        await page.fill('input[type="date"]', '2026-10-10');
        await page.fill('input[type="time"]', '10:00');
        await page.fill('input[placeholder="e.g. Main Auditorium"]', 'Lab 101');
        await page.fill('input[placeholder="0"]', '100'); // Fees
        await page.fill('textarea[placeholder="Detailed event description"]', 'This is a test event for verification.');

        await page.click('button:has-text("Create Event")');

        // 4. Verify in List
        await expect(page.locator('text=Verification Event 2026')).toBeVisible();

        // 5. Reload and Verify
        await page.reload();
        await expect(page.locator('text=Verification Event 2026')).toBeVisible();

        // 6. Cleanup (Delete)
        // Find the delete button for this specific event card
        const card = page.locator('.group', { hasText: 'Verification Event 2026' });

        // Setup dialog handler for confirm
        page.on('dialog', dialog => dialog.accept());
        await card.locator('button:has-text("trash")').click(); // Using aria-label or icon if possible, but earlier code had Trash2 icon button
        // The delete button is in CardHeader. 
        // We'll click the first delete button inside the card.
        await card.locator('button').first().click();

        await expect(page.locator('text=Verification Event 2026')).not.toBeVisible();
    });
});
