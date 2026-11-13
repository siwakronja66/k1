const https = require('https');
const fs = require('fs');
const { chromium } = require('playwright');

function fetchTile(z, x, y) {
    const url = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
            res.on('error', reject);
        });
    });
}

(async () => {
    try {
        const z = 19;
        const cx = 414659;
        const cy = 237711;
        console.log(`Fetching 3x3 tiles at z=${z} around (${cx}, ${cy})...`);

        const tiles = {};
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const x = cx + dx;
                const y = cy + dy;
                tiles[`${dx},${dy}`] = await fetchTile(z, x, y);
            }
        }
        console.log('Fetched 9 tiles, launching browser to stitch...');

        const browser = await chromium.launch();
        const page = await browser.newPage({ viewport: { width: 768, height: 768 } });
        await page.setContent('<canvas id="c" width="768" height="768" style="display:block;margin:0;padding:0;"></canvas>');
        await page.evaluate((tiles) => {
            return new Promise((resolve) => {
                const canvas = document.getElementById('c');
                const ctx = canvas.getContext('2d');
                let loaded = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const img = new Image();
                        const key = `${dx},${dy}`;
                        img.onload = () => {
                            const px = (dx + 1) * 256;
                            const py = (dy + 1) * 256;
                            ctx.drawImage(img, px, py);
                            loaded++;
                            if (loaded === 9) resolve();
                        };
                        img.src = 'data:image/jpeg;base64,' + tiles[key];
                    }
                }
            });
        }, tiles);

        const canvasElem = await page.$('#c');
        await canvasElem.screenshot({ path: 'public/assets/real_satellite_stitched.jpg' });
        await browser.close();
        console.log('SUCCESS: Stitched real satellite image saved to public/assets/real_satellite_stitched.jpg');
        process.exit(0);
    } catch (err) {
        console.error('Error in fetch:', err);
        process.exit(1);
    }
})();
