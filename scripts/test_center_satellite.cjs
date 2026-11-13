const https = require('https');
const fs = require('fs');
const { chromium } = require('playwright');

function latLonToTileFraction(lat, lon, zoom) {
    const latRad = lat * Math.PI / 180;
    const n = Math.pow(2, zoom);
    const fx = (lon + 180.0) / 360.0 * n;
    const fy = (1.0 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2.0 * n;
    return { fx, fy };
}

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
    const z = 19;
    const originLat = 16.541450;
    const originLon = 104.724250;
    const { fx, fy } = latLonToTileFraction(originLat, originLon, z);
    
    // We want a 4x4 or 5x5 grid of tiles centered around (fx, fy)
    const baseTileX = Math.floor(fx);
    const baseTileY = Math.floor(fy);
    
    console.log(`Origin tile fraction: fx=${fx}, fy=${fy}. Base tile: ${baseTileX}, ${baseTileY}`);

    const gridRadius = 2; // -2 to +2 => 5x5 tiles = 1280x1280 px
    const tiles = {};
    for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        for (let dx = -gridRadius; dx <= gridRadius; dx++) {
            const tx = baseTileX + dx;
            const ty = baseTileY + dy;
            tiles[`${dx},${dy}`] = await fetchTile(z, tx, ty);
        }
    }
    console.log('Fetched 25 tiles (5x5 grid)');

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await page.setContent('<canvas id="c" width="1280" height="1280" style="display:block;margin:0;padding:0;"></canvas>');

    await page.evaluate(({ tiles, gridRadius, fx, fy, baseTileX, baseTileY }) => {
        return new Promise((resolve) => {
            const canvas = document.getElementById('c');
            const ctx = canvas.getContext('2d');
            const tileCount = (gridRadius * 2 + 1) * (gridRadius * 2 + 1);
            let loaded = 0;

            for (let dy = -gridRadius; dy <= gridRadius; dy++) {
                for (let dx = -gridRadius; dx <= gridRadius; dx++) {
                    const img = new Image();
                    const key = `${dx},${dy}`;
                    img.onload = () => {
                        const px = (dx + gridRadius) * 256;
                        const py = (dy + gridRadius) * 256;
                        ctx.drawImage(img, px, py);
                        loaded++;
                        if (loaded === tileCount) {
                            // Draw center pin
                            const originPx = (fx - (baseTileX - gridRadius)) * 256;
                            const originPy = (fy - (baseTileY - gridRadius)) * 256;
                            
                            ctx.beginPath();
                            ctx.arc(originPx, originPy, 8, 0, Math.PI * 2);
                            ctx.fillStyle = '#ef4444';
                            ctx.fill();
                            ctx.lineWidth = 3;
                            ctx.strokeStyle = '#ffffff';
                            ctx.stroke();

                            // Crosshair
                            ctx.strokeStyle = '#ef4444';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(originPx - 25, originPy);
                            ctx.lineTo(originPx + 25, originPy);
                            ctx.moveTo(originPx, originPy - 25);
                            ctx.lineTo(originPx, originPy + 25);
                            ctx.stroke();

                            resolve({ originPx, originPy });
                        }
                    };
                    img.src = 'data:image/jpeg;base64,' + tiles[key];
                }
            }
        });
    }, { tiles, gridRadius, fx, fy, baseTileX, baseTileY });

    const canvasElem = await page.$('#c');
    await canvasElem.screenshot({ path: 'public/assets/satellite_5x5_center.jpg' });
    await browser.close();
    console.log('Saved 5x5 center image to public/assets/satellite_5x5_center.jpg');
})();
