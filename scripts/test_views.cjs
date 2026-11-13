const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://localhost:8090/');
    await page.waitForTimeout(2000);

    // 1. Top-down 90° view
    const btn90 = page.locator('button:has-text("มุมบน 90°")');
    if (await btn90.count() > 0) {
        await btn90.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'public/assets/topdown_satellite_view.png' });
        console.log('Topdown screenshot saved');
    }

    // 2. High-angle campus overview (pan & zoom slightly)
    await page.evaluate(() => {
        if (typeof focusBuilding3D === 'function') {
            focusBuilding3D('ALL');
            camTargetState.radius = 56;
            camTargetState.phi = 0.92;
            camTargetState.theta = 0.55;
            forceRender = true;
        }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'public/assets/overview_satellite_view.png' });
    console.log('Overview screenshot saved');

    await browser.close();
})();
