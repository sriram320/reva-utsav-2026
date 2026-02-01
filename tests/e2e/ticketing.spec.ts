import { test, expect } from '@playwright/test';

test.describe('Suite 2: The Ticketing Engine', () => {

    test('2.1 The Outsider Purchase (Standard)', async ({ page }) => {
        // Login first
        const email = `outsider.${Date.now()}@example.com`;
        await page.goto('/register');
        await page.fill('input[name="name"]', 'Outsider User');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/dashboard/);

        // Buying Pass
        await page.goto('/passes');

        // Select Outsider
        await page.click('label[for="outsider"]');

        // Click Proceed
        await page.click('text=PROCEED TO PAYMENT');

        // Assert redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/);

        // Assert QR Code button is visible (Active status)
        await expect(page.locator('button:has-text("View QR Code")')).toBeVisible();
    });

    test('2.2 The Reva Student Purchase (Concession)', async ({ page }) => {
        // Login with Reva Email
        const email = `student.${Date.now()}@reva.edu.in`;
        await page.goto('/register');
        await page.fill('input[name="name"]', 'Reva Student');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/dashboard/);

        // Buying Pass
        await page.goto('/passes');

        // Select Reva
        await page.click('label[for="reva"]');

        // Fill details
        await page.fill('input[placeholder="R21..."]', 'R1234567');
        await page.fill('input[placeholder="e.g. C&IT"]', 'C&IT');

        // Click Verify & Pay
        await page.click('text=VERIFY & PAY');

        // Assert redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/);

        // Assert Pending Status
        await expect(page.locator('text=Verification Pending')).toBeVisible();
        await expect(page.locator('text=Validating your identity')).toBeVisible();
        await expect(page.locator('button:has-text("View QR Code")')).not.toBeVisible();
    });

});
