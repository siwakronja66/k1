import { chromium } from '@playwright/test';

async function runDemo() {
  console.log('🚀 กำลังเปิด Google Chrome / Chromium บนหน้าจอ (Headed Mode)...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1200
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 850 }
  });
  const page = await context.newPage();

  console.log('📍 1. เข้าสู่หน้าเว็บ http://localhost:8090 (ผังอาคาร 3 มิติ)...');
  await page.goto('http://localhost:8090');
  await page.waitForTimeout(2500);

  console.log('🔍 2. พิมพ์ค้นหาบริการ "ร้านยา" ...');
  const searchInput = page.locator('#dir-search');
  await searchInput.click();
  await searchInput.fill('ร้านยา');
  await page.waitForTimeout(2500);

  console.log('🏢 3. ล้างคำค้นหา และคลิกเลือกดู "ชั้น 2 (ทางเชื่อม)" ...');
  await searchInput.fill('');
  const fl2Btn = page.locator('#btn-fl-2');
  await fl2Btn.click();
  await page.waitForTimeout(2500);

  console.log('🔮 4. เปลี่ยนโหมดมุมมองเป็น "กึ่งโปร่งใส (Hybrid)" ...');
  const hybridBtn = page.locator('#btn-ext-hybrid');
  await hybridBtn.click();
  await page.waitForTimeout(2500);

  console.log('🌐 5. ทดสอบสลับภาษา ไทย ↔ English ...');
  const langBtn = page.locator('#btn-lang');
  await langBtn.click();
  await page.waitForTimeout(2000);
  await langBtn.click();
  await page.waitForTimeout(1500);

  console.log('📂 6. ทดสอบพับแถบข้าง (Collapse Sidebar) เพื่อดูโมเดล 3D แบบเต็มจอ ...');
  const collapseBtn = page.locator('#btn-collapse-sidebar');
  await collapseBtn.click();
  await page.waitForTimeout(2500);

  console.log('📂 7. กางแถบข้างกลับมา ...');
  const expandBtn = page.locator('#btn-expand-sidebar');
  await expandBtn.click();
  await page.waitForTimeout(2500);

  console.log('✅ การทดสอบการใช้งานเสร็จสิ้นสมบูรณ์!');
  await page.waitForTimeout(1500);
  await browser.close();
}

runDemo().catch(err => {
  console.error('Demo error:', err);
  process.exit(1);
});
