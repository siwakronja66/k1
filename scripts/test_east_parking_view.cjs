const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://localhost:8090/');
    await page.waitForTimeout(2000);

    // View 1: East Driveway perspective looking north along the parking lot towards the rear fence (matching 20846.jpg)
    await page.evaluate(() => {
        if (typeof camTargetState !== 'undefined') {
            camTargetState.target = new THREE.Vector3(10.0, 1.5, -9.0);
            camTargetState.radius = 26;
            camTargetState.phi = 1.35;
            camTargetState.theta = -0.05;
            forceRender = true;
        }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'public/assets/east_parking_view.png' });
    console.log('East parking view saved');

    // View 2: Top-down 90° view showing circulation
    const btn90 = page.locator('button:has-text("มุมบน 90°")');
    if (await btn90.count() > 0) {
        await btn90.first().click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'public/assets/topdown_satellite_view.png' });
        console.log('Topdown screenshot saved');
    }

    // View 3: Isometric overview
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
