const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://localhost:8090/');
    await page.waitForTimeout(2000);

    // View 1: Floor 1 isolate view showing clear driveway under 4F
    const btnF1 = page.locator('button:has-text("ชั้น 1")');
    if (await btnF1.count() > 0) {
        await btnF1.first().click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'public/assets/under4f_floor1_view.png' });
        console.log('Floor 1 view saved');
    }

    // View 2: Driveway perspective looking directly through 4F ground floor
    await page.evaluate(() => {
        if (typeof camTargetState !== 'undefined') {
            camTargetState.target = new THREE.Vector3(-8.0, 1.5, -8.0);
            camTargetState.radius = 28;
            camTargetState.phi = 1.35;
            camTargetState.theta = -0.15;
            forceRender = true;
        }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'public/assets/under4f_corridor_view.png' });
    console.log('Under 4F corridor view saved');

    await browser.close();
})();
