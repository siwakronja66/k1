import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
    console.log('Starting Building 4F & Elevator E2E Visual Verification...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await context.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
    });

    await page.goto('http://localhost:8090/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // 1. Focus on Building 4F
    console.log('Focusing on Building 4F (ตึกหลัง 4 ชั้น)...');
    await page.evaluate(() => {
        if (typeof window.focusBuilding3D === 'function') {
            window.focusBuilding3D('4F');
        }
    });
    await page.waitForTimeout(1500);

    // Ensure camera shows South facade clearly (showing colonnade, elevator, piloti, vans, wheelchair ramp)
    await page.evaluate(() => {
        if (window.camera && window.controls) {
            window.camera.position.set(-3.0, 7.0, 16.0);
            window.controls.target.set(-3.0, 4.0, -8.0);
            window.controls.update();
            if (typeof window.forceRender !== 'undefined') window.forceRender = true;
        }
    });
    await page.waitForTimeout(1500);

    const ssSouthPath = 'public/assets/bld4f_south_view.png';
    await page.screenshot({ path: ssSouthPath });
    console.log('Saved:', ssSouthPath);

    // 2. Rotate camera to North side to see OSSC entrance, canopy, and roof pergola
    console.log('Rotating camera to view North facade of 4F...');
    await page.evaluate(() => {
        if (window.camera && window.controls) {
            window.camera.position.set(-3.0, 10.0, -28.0);
            window.controls.target.set(-3.0, 5.0, -8.0);
            window.controls.update();
            if (typeof window.forceRender !== 'undefined') window.forceRender = true;
        }
    });
    await page.waitForTimeout(1500);

    const ssNorthPath = 'public/assets/bld4f_north_view.png';
    await page.screenshot({ path: ssNorthPath });
    console.log('Saved:', ssNorthPath);

    // 3. Close-up on the Elevator Shaft and East Wing
    console.log('Rotating camera to close-up of East wing & Elevator...');
    await page.evaluate(() => {
        if (window.camera && window.controls) {
            window.camera.position.set(7.5, 4.0, 4.0);
            window.controls.target.set(6.5, 2.5, -6.0);
            window.controls.update();
            if (typeof window.forceRender !== 'undefined') window.forceRender = true;
        }
    });
    await page.waitForTimeout(1500);

    const ssElevatorPath = 'public/assets/bld4f_elevator_closeup.png';
    await page.screenshot({ path: ssElevatorPath });
    console.log('Saved:', ssElevatorPath);

    // 4. Test Wheelchair Accessible Wayfinding to Floor 4 room (R443)
    console.log('Testing Wayfinding to Floor 4 room (R443) with wheelchair / elevator...');
    await page.evaluate(() => {
        if (typeof window.selectRoom === 'function') {
            window.selectRoom('R443');
        }
    });
    await page.waitForTimeout(600);

    // Check the accessible route checkbox
    await page.evaluate(() => {
        const chk = document.getElementById('route-accessible');
        if (chk) chk.checked = true;
        if (typeof window.draw3DWayfindingToSelected === 'function') {
            window.draw3DWayfindingToSelected();
        }
    });
    await page.waitForTimeout(1500);

    // Inspect route steps
    const stepsText = await page.evaluate(() => {
        const ol = document.getElementById('route-steps');
        if (!ol) return 'NO_OL';
        const lis = Array.from(ol.querySelectorAll('li')).map(li => li.textContent.trim());
        return lis.join(' | ');
    });

    console.log('Generated Route Steps:');
    console.log(stepsText);

    // Save screenshot with wayfinding active
    const ssRoutePath = 'public/assets/bld4f_elevator_route.png';
    await page.screenshot({ path: ssRoutePath });
    console.log('Saved:', ssRoutePath);

    await browser.close();

    const hasElevatorStep = stepsText.includes('ลิฟต์') || stepsText.includes('elevator');
    if (hasElevatorStep) {
        console.log('SUCCESS: Elevator wayfinding step detected in accessible route!');
    } else {
        console.warn('WARNING: Elevator wayfinding step not found in:', stepsText);
    }
    console.log('Building 4F E2E Verification Complete!');
})();
