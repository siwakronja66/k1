const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://localhost:8090/');
    await page.waitForTimeout(2000);

    // View 1: Looking directly down the courtyard passage under the skybridge (matching 20847.jpg)
    await page.evaluate(() => {
        if (typeof camTargetState !== 'undefined') {
            camTargetState.target = new THREE.Vector3(-3.5, 2.0, 0.0);
            camTargetState.radius = 16;
            camTargetState.phi = 1.38;
            camTargetState.theta = Math.PI / 2;
            forceRender = true;
        }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'public/assets/skybridge_courtyard_view.png' });
    console.log('Skybridge courtyard view saved');

    // View 2: Top-down 90° view
    const btn90 = page.locator('button:has-text("มุมบน 90°")');
    if (await btn90.count() > 0) {
        await btn90.first().click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'public/assets/topdown_satellite_view.png' });
        console.log('Topdown screenshot saved');
    }

    // View 3: Overview perspective
    await page.evaluate(() => {
        if (typeof focusBuilding3D === 'function') {
            focusBuilding3D('ALL');
            camTargetState.radius = 58;
            camTargetState.phi = 0.95;
            camTargetState.theta = 0.50;
            forceRender = true;
        }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'public/assets/overview_satellite_view.png' });
    console.log('Overview screenshot saved');

    await browser.close();
})();
