const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://localhost:8090/');
    await page.waitForTimeout(2000);

    // View 1: Match the user's exact uploaded camera angle (media_1794539628842_f7a2ab0a.jpg)
    // Looking directly at the front of Building 2F and the flagpole / monument island
    await page.evaluate(() => {
        if (typeof camTargetState !== 'undefined') {
            camTargetState.target = new THREE.Vector3(-4.0, 3.0, 18.0);
            camTargetState.radius = 36;
            camTargetState.phi = 1.30;
            camTargetState.theta = 0.05;
            forceRender = true;
        }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'public/assets/front2f_user_angle.png' });
    console.log('User angle screenshot saved');

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
