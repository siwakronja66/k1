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
    try {
        const z = 19;
        const originLat = 16.541450;
        const originLon = 104.724250;
        const { fx, fy } = latLonToTileFraction(originLat, originLon, z);
        const baseTileX = Math.floor(fx);
        const baseTileY = Math.floor(fy);

        const gridRadius = 2; // 5x5 tiles = 1280x1280 px
        const tiles = {};
        console.log('Fetching 5x5 tiles...');
        for (let dy = -gridRadius; dy <= gridRadius; dy++) {
            for (let dx = -gridRadius; dx <= gridRadius; dx++) {
                const tx = baseTileX + dx;
                const ty = baseTileY + dy;
                tiles[`${dx},${dy}`] = await fetchTile(z, tx, ty);
            }
        }
        console.log('All tiles fetched.');

        // Meters per pixel at lat 16.541450, zoom 19
        const mpp = (Math.cos(originLat * Math.PI / 180) * 40075016.686) / (256 * Math.pow(2, z));
        console.log(`Meters per pixel: ${mpp.toFixed(5)}`);

        // Target coverage: 130m width x 110m depth (North-South)
        const areaWidthM = 130;
        const areaHeightM = 110;
        const cropW = areaWidthM / mpp;
        const cropH = areaHeightM / mpp;

        const originPx = (fx - (baseTileX - gridRadius)) * 256;
        const originPy = (fy - (baseTileY - gridRadius)) * 256;

        const cropX = originPx - cropW / 2;
        const cropY = originPy - cropH / 2;

        console.log(`Crop rect: x=${cropX.toFixed(1)}, y=${cropY.toFixed(1)}, w=${cropW.toFixed(1)}, h=${cropH.toFixed(1)}`);

        const browser = await chromium.launch();
        const page = await browser.newPage({ viewport: { width: 2048, height: 2048 } });

        await page.setContent('<canvas id="out" width="2048" height="2048" style="display:block;margin:0;padding:0;"></canvas>');

        await page.evaluate(({ tiles, gridRadius, cropX, cropY, cropW, cropH, areaWidthM, areaHeightM }) => {
            return new Promise((resolve) => {
                // First draw the 5x5 tile grid onto an offscreen canvas
                const gridCanvas = document.createElement('canvas');
                gridCanvas.width = 1280;
                gridCanvas.height = 1280;
                const gctx = gridCanvas.getContext('2d');

                const tileCount = (gridRadius * 2 + 1) * (gridRadius * 2 + 1);
                let loaded = 0;

                for (let dy = -gridRadius; dy <= gridRadius; dy++) {
                    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
                        const img = new Image();
                        const key = `${dx},${dy}`;
                        img.onload = () => {
                            const px = (dx + gridRadius) * 256;
                            const py = (dy + gridRadius) * 256;
                            gctx.drawImage(img, px, py);
                            loaded++;
                            if (loaded === tileCount) {
                                // Now crop and draw to 2048x2048 output canvas
                                const outCanvas = document.getElementById('out');
                                const ctx = outCanvas.getContext('2d');

                                // Slight contrast and color enhancement
                                ctx.filter = 'contrast(1.08) saturate(1.15) brightness(1.02)';
                                ctx.drawImage(gridCanvas, cropX, cropY, cropW, cropH, 0, 0, 2048, 2048);
                                ctx.filter = 'none';

                                // Draw subtle overlay details (North arrow, scale, road label)
                                // 1. Subtle perimeter vignette
                                const grad = ctx.createRadialGradient(1024, 1024, 800, 1024, 1024, 1024);
                                grad.addColorStop(0, 'rgba(0,0,0,0)');
                                grad.addColorStop(1, 'rgba(15,23,42,0.5)');
                                ctx.fillStyle = grad;
                                ctx.fillRect(0, 0, 2048, 2048);

                                // 2. North Road Label (ถนนชาภูบาล) near top
                                ctx.save();
                                ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
                                ctx.beginPath();
                                ctx.roundRect(820, 28, 408, 46, 10);
                                ctx.fill();
                                ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
                                ctx.lineWidth = 2;
                                ctx.stroke();

                                ctx.font = 'bold 22px "Sarabun", sans-serif';
                                ctx.fillStyle = '#f8fafc';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText('🛣️ ถนนชาภูบาล (Chaphubal Rd.)', 1024, 51);
                                ctx.restore();

                                // 3. Compass Rose at top right
                                ctx.save();
                                const cx = 1940;
                                const cy = 100;
                                ctx.beginPath();
                                ctx.arc(cx, cy, 55, 0, Math.PI * 2);
                                ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
                                ctx.fill();
                                ctx.strokeStyle = '#38bdf8';
                                ctx.lineWidth = 2.5;
                                ctx.stroke();

                                // North needle (red)
                                ctx.beginPath();
                                ctx.moveTo(cx, cy - 42);
                                ctx.lineTo(cx - 14, cy);
                                ctx.lineTo(cx + 14, cy);
                                ctx.closePath();
                                ctx.fillStyle = '#ef4444';
                                ctx.fill();

                                // South needle (white)
                                ctx.beginPath();
                                ctx.moveTo(cx, cy + 42);
                                ctx.lineTo(cx - 14, cy);
                                ctx.lineTo(cx + 14, cy);
                                ctx.closePath();
                                ctx.fillStyle = '#f8fafc';
                                ctx.fill();

                                ctx.font = '900 24px sans-serif';
                                ctx.fillStyle = '#ef4444';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';
                                ctx.fillText('N', cx, cy - 46);

                                ctx.font = '600 12px "Sarabun", sans-serif';
                                ctx.fillStyle = '#38bdf8';
                                ctx.textBaseline = 'top';
                                ctx.fillText('สสจ.มุกดาหาร', cx, cy + 58);
                                ctx.restore();

                                // 4. Scale bar at bottom left
                                ctx.save();
                                const scalePx = (20 / areaWidthM) * 2048; // 20 meters in pixels
                                const sx = 70;
                                const sy = 1960;
                                ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
                                ctx.beginPath();
                                ctx.roundRect(sx - 20, sy - 40, scalePx + 40, 60, 8);
                                ctx.fill();

                                ctx.strokeStyle = '#f8fafc';
                                ctx.lineWidth = 4;
                                ctx.beginPath();
                                ctx.moveTo(sx, sy);
                                ctx.lineTo(sx + scalePx, sy);
                                ctx.moveTo(sx, sy - 10);
                                ctx.lineTo(sx, sy + 10);
                                ctx.moveTo(sx + scalePx, sy - 10);
                                ctx.lineTo(sx + scalePx, sy + 10);
                                ctx.stroke();

                                ctx.font = 'bold 20px "Sarabun", sans-serif';
                                ctx.fillStyle = '#38bdf8';
                                ctx.textAlign = 'center';
                                ctx.fillText('20 เมตร (Scale 1:1)', sx + scalePx / 2, sy - 14);
                                ctx.restore();

                                // 5. GPS Coordinates Stamp at bottom right
                                ctx.save();
                                ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
                                ctx.beginPath();
                                ctx.roundRect(1440, 1950, 540, 50, 8);
                                ctx.fill();
                                ctx.strokeStyle = '#10b981';
                                ctx.lineWidth = 1.5;
                                ctx.stroke();

                                ctx.font = '600 18px "Sarabun", sans-serif';
                                ctx.fillStyle = '#10b981';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText('🛰️ พิกัดดาวเทียม: 16.541450° N, 104.724250° E', 1710, 1975);
                                ctx.restore();

                                resolve();
                            }
                        };
                        img.src = 'data:image/jpeg;base64,' + tiles[key];
                    }
                }
            });
        }, { tiles, gridRadius, cropX, cropY, cropW, cropH, areaWidthM, areaHeightM });

        const canvasElem = await page.$('#out');
        await canvasElem.screenshot({ path: 'public/assets/satellite-4f.jpg', quality: 92, type: 'jpeg' });
        await browser.close();
        console.log('SUCCESS: Generated 2048x2048 real satellite image -> public/assets/satellite-4f.jpg');
    } catch (e) {
        console.error('Error generating texture:', e);
        process.exit(1);
    }
})();
