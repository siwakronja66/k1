const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

    // Read logo MOPH.png as base64
    const logoBase64 = fs.readFileSync('public/assets/logo MOPH.png').toString('base64');
    const logoDataUrl = 'data:image/png;base64,' + logoBase64;

    // 1. Generate bld1MainSignboard (2048x256)
    await page.setContent(`
        <canvas id="mainSign" width="2048" height="256" style="display:block;"></canvas>
    `);
    await page.evaluate((logoDataUrl) => {
        return new Promise(resolve => {
            const canvas = document.getElementById('mainSign');
            const ctx = canvas.getContext('2d');

            // White metallic fascia background
            const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
            bgGrad.addColorStop(0, '#ffffff');
            bgGrad.addColorStop(1, '#f1f5f9');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 2048, 256);

            // Subtle border
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 6;
            ctx.strokeRect(3, 3, 2042, 250);

            // Draw MOPH Logo on the right
            const logo = new Image();
            logo.onload = () => {
                ctx.drawImage(logo, 1820, 28, 200, 200);

                // Text in Royal Deep Blue
                ctx.fillStyle = '#0369a1';
                ctx.font = 'bold 98px "Sarabun", "TH Sarabun New", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('สำนักงานสาธารณสุขจังหวัดมุกดาหาร', 940, 128);

                resolve();
            };
            logo.src = logoDataUrl;
        });
    }, logoDataUrl);
    await page.locator('#mainSign').screenshot({ path: 'public/assets/bld1_main_sign.png' });
    console.log('Saved public/assets/bld1_main_sign.png with MOPH logo');

    await browser.close();
})();
