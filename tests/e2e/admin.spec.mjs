import { test, expect } from '@playwright/test';

test.describe('Admin Back-office', () => {

  test('Admin login page loads with CSRF token and secure form', async ({ page }) => {
    await page.goto('/admin/login.php');

    // Check login form
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitBtn = page.locator('form button:has-text("เข้าสู่ระบบ")');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Verify CSRF hidden input exists
    const csrfToken = page.locator('input[name="_csrf"]');
    await expect(csrfToken).toBeAttached();
    const tokenVal = await csrfToken.getAttribute('value');
    expect(tokenVal).toBeTruthy();
  });

  test('Unauthenticated access to admin pages redirects to login', async ({ page }) => {
    await page.goto('/admin/rooms.php');
    await expect(page).toHaveURL(/.*\/admin\/login\.php/);

    await page.goto('/admin/buildings.php');
    await expect(page).toHaveURL(/.*\/admin\/login\.php/);

    await page.goto('/admin/bookings.php');
    await expect(page).toHaveURL(/.*\/admin\/login\.php/);

    await page.goto('/admin/photos.php');
    await expect(page).toHaveURL(/.*\/admin\/login\.php/);
  });

});
