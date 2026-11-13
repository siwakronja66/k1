import { test, expect } from '@playwright/test';

test.describe('3D Public Viewer & Directory', () => {

  test('Page loads successfully without JS errors and renders WebGL canvas', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore 404s for missing optional photos or asset stubs
        if (!text.includes('404') && !text.includes('Failed to load resource')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/');

    // Check title / header
    await expect(page).toHaveTitle(/สสจ\.มุกดาหาร|3D/);
    
    // Check canvas exists and is loaded
    const canvas = page.locator('#canvas-container canvas');
    await expect(canvas).toBeAttached({ timeout: 10000 });
    await expect(canvas).toBeVisible();

    // Check directory list has items
    const dirCount = page.locator('#dir-count-badge');
    await expect(dirCount).toBeVisible();
    await expect(dirCount).not.toBeEmpty();

    // Verify no unexpected console JS errors
    expect(consoleErrors).toEqual([]);
  });

  test('Search works by service keyword ("ร้านยา") and selects department', async ({ page }) => {
    await page.goto('/');

    // Type "ร้านยา" in search box
    const searchInput = page.locator('#dir-search');
    await searchInput.fill('ร้านยา');

    // Wait for search results
    const results = page.locator('#directory-list');
    await expect(results).toContainText('OSSC');
  });

  test('Deep linking with ?room=R441 highlights room and updates detail panel', async ({ page }) => {
    await page.goto('/?room=R441');

    // Room detail card should show R441 or Digital Health info
    const badge = page.locator('#detail-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('441');
  });

  test('Language toggle switches between TH and EN', async ({ page }) => {
    await page.goto('/');

    const langBtn = page.locator('#btn-lang');
    await expect(langBtn).toHaveText('EN');

    // Click to switch to English
    await langBtn.click();
    await expect(langBtn).toHaveText('ไทย');

    // The floor pick button should be in English
    const floorAllBtn = page.locator('#btn-fl-ALL');
    await expect(floorAllBtn).toContainText('All floors');

    // Switch back to Thai
    await langBtn.click();
    await expect(langBtn).toHaveText('EN');
  });

  test('Kiosk mode (?kiosk=1) hides staff back-office link', async ({ page }) => {
    // Normal mode: staff link exists
    await page.goto('/');
    const staffLinkNormal = page.locator('a[data-hide-in-kiosk]');
    await expect(staffLinkNormal).toBeAttached();

    // Kiosk mode: staff link hidden/removed
    await page.goto('/?kiosk=1');
    const staffLinkKiosk = page.locator('a[data-hide-in-kiosk]');
    await expect(staffLinkKiosk).not.toBeVisible();
  });

  test.skip('Wayfinding button draws path and generates route steps (currently disabled)', async ({ page }) => {
    await page.goto('/?room=R441');

    // Ensure room detail is populated first
    await expect(page.locator('#detail-badge')).toContainText('441');

    // Click "นำทาง 3D ไปห้องนี้"
    const startNavBtn = page.locator('#btn-start-wayfinding');
    await startNavBtn.scrollIntoViewIfNeeded();
    await startNavBtn.click();

    // Route steps list should become visible
    const stepsList = page.locator('#route-steps');
    await expect(stepsList).toBeVisible();
    await expect(stepsList.locator('li')).not.toHaveCount(0);

    // Clear route button should appear
    const clearBtn = page.locator('#btn-clear-route');
    await clearBtn.scrollIntoViewIfNeeded();
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(stepsList).not.toBeVisible();
  });

  test('Sidebar can be collapsed and expanded', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('#sidebar-panel');
    const collapseBtn = page.locator('#btn-collapse-sidebar');
    const expandBtn = page.locator('#btn-expand-sidebar');

    await expect(sidebar).toBeVisible();
    await expect(expandBtn).not.toBeVisible();

    // Click collapse button
    await collapseBtn.click();
    await expect(sidebar).not.toBeVisible();
    await expect(expandBtn).toBeVisible();

    // Click expand button to reopen
    await expandBtn.click();
    await expect(sidebar).toBeVisible();
    await expect(expandBtn).not.toBeVisible();
  });

  test('Room detail body can be folded/minimized', async ({ page }) => {
    await page.goto('/?room=R441');

    const detailBody = page.locator('#room-detail-body');
    const toggleBtn = page.locator('#btn-toggle-room-detail');
    const icon = page.locator('#icon-toggle-room-detail');

    await expect(detailBody).toBeVisible();
    await expect(icon).toHaveClass(/fa-chevron-up/);

    // Minimize detail card
    await toggleBtn.click();
    await expect(detailBody).not.toBeVisible();
    await expect(icon).toHaveClass(/fa-chevron-down/);

    // Expand detail card back
    await toggleBtn.click();
    await expect(detailBody).toBeVisible();
    await expect(icon).toHaveClass(/fa-chevron-up/);
  });

});
