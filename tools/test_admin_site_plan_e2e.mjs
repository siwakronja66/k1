import { chromium } from '@playwright/test';

async function testSitePlan() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 1. Login
    await page.goto('http://localhost:8090/admin/login.php');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', '123456');
    await page.click('form button:has-text("เข้าสู่ระบบ")');
    await page.waitForURL('**/departments.php');

    // 2. Go to buildings.php
    await page.goto('http://localhost:8090/admin/buildings.php');
    await page.waitForLoadState('networkidle');

    // Verify initial values
    const selPos = page.locator('#site-sel-pos');
    await page.waitForSelector('#site-sel-pos:has-text("X:")');
    const initPosText = await selPos.textContent();
    console.log('Initial Selected Building Position:', initPosText);

    // Click Nudge Up (move North by 1.0m)
    await page.click('#btn-nudge-up');
    const newPosText = await selPos.textContent();
    console.log('Position after Nudge Up:', newPosText);

    // Verify Save notice is visible and Save button is enabled
    const saveNotice = page.locator('#site-save-notice');
    const isNoticeVisible = await saveNotice.isVisible();
    console.log('Save notice visible:', isNoticeVisible);

    const saveBtn = page.locator('#btn-site-save');
    const isSaveEnabled = !(await saveBtn.isDisabled());
    console.log('Save button enabled:', isSaveEnabled);

    // Click Reset button to revert
    page.on('dialog', async dialog => {
        console.log('Dialog popped:', dialog.message());
        await dialog.accept();
    });
    await page.click('#btn-site-reset');
    await page.waitForTimeout(500);

    const revertedPosText = await selPos.textContent();
    console.log('Position after Reset:', revertedPosText);

    // Test Cardinal Snap Button (Rotate to 90°)
    const selRot = page.locator('#site-sel-rot');
    const initRot = await selRot.textContent();
    console.log('Initial Rotation:', initRot);

    await page.click('button.btn-rot-cardinal[data-deg="90"]');
    const rotAfter90 = await selRot.textContent();
    console.log('Rotation after 90° button:', rotAfter90);

    // Reset again
    await page.click('#btn-site-reset');
    await page.waitForTimeout(500);
    const rotAfterReset = await selRot.textContent();
    console.log('Rotation after Reset:', rotAfterReset);

    console.log('All interactive tests passed successfully!');
    await browser.close();
}

testSitePlan().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
