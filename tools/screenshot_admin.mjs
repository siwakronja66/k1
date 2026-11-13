import { chromium } from '@playwright/test';

async function main() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // 1. Login
    await page.goto('http://localhost:8090/admin/login.php');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', '123456');
    await page.click('form button:has-text("เข้าสู่ระบบ")');
    await page.waitForURL('**/departments.php');

    // 2. Go to buildings.php
    await page.goto('http://localhost:8090/admin/buildings.php');
    await page.waitForLoadState('networkidle');

    // Wait 1 second for SVG and images
    await page.waitForTimeout(1000);

    // Screenshot full overview
    await page.screenshot({ path: 'public/assets/admin_buildings_overview.png', fullPage: true });

    // Focus on the interactive map & controls container
    const mapSection = page.locator('div.mb-6.bg-slate-900');
    if (await mapSection.count() > 0) {
        await mapSection.screenshot({ path: 'public/assets/admin_site_plan_controls.png' });
    }

    // 3. Test Form Edit mode (buildings.php?edit=2F)
    await page.goto('http://localhost:8090/admin/buildings.php?edit=2F');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'public/assets/admin_building_edit_form.png', fullPage: true });

    console.log('Screenshots saved successfully!');
    await browser.close();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
