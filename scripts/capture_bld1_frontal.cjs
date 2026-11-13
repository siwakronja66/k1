const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto('http://localhost:8090/');
    await page.waitForTimeout(2000);

    // Focus camera directly at Building 1 (2F) from front lawn
    await page.evaluate(() => {
        const bld = BUILDINGS_META['2F'];
        if (bld) {
            camTargetState.target.set(bld.centerX, 2.5, bld.centerZ);
            camState.target.set(bld.centerX, 2.5, bld.centerZ);
            camTargetState.radius = 28;
            camState.radius = 28;
            camTargetState.theta = 0.08; // almost straight South looking North
            camState.theta = 0.08;
            camTargetState.phi = 1.38; // eye-level / slightly raised
            camState.phi = 1.38;
            if (typeof forceRender !== 'undefined') forceRender = true;
        }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'public/assets/bld1_frontal_view.png' });
    console.log('Frontal view saved to public/assets/bld1_frontal_view.png');

    await browser.close();
})();
