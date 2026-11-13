import { chromium } from 'playwright';

(async () => {
    console.log('Testing clean 3D view with navigation/travel system removed...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await context.newPage();

    await page.goto('http://localhost:8090/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // Save full campus overview screenshot
    const ssOverview = 'public/assets/clean_campus_overview.png';
    await page.screenshot({ path: ssOverview });
    console.log('Saved:', ssOverview);

    // Select a room (R431 - นพ.สสจ.)
    await page.evaluate(() => {
        if (typeof window.focusRoom3D === 'function') {
            window.focusRoom3D('R431');
        }
    });
    await page.waitForTimeout(1500);

    // Save room selected screenshot
    const ssRoom = 'public/assets/clean_room_selected.png';
    await page.screenshot({ path: ssRoom });
    console.log('Saved:', ssRoom);

    await browser.close();
    console.log('Clean view test completed successfully!');
})();
