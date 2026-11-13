// 2D plan editor for rooms.php (admin only). Drag a room to move it, drag the yellow corner to resize.
// On release the hidden #move-form is filled and submitted (normal POST + CSRF, server validates bounds).
(() => {
    const svg = document.getElementById('plan');
    const form = document.getElementById('move-form');
    if (!svg || !form) return;
    const W = Number(svg.dataset.w), D = Number(svg.dataset.d);
    const snap = v => Math.round(v * 10) / 10;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const toSvg = (e) => {
        const p = svg.createSVGPoint();
        p.x = e.clientX; p.y = e.clientY;
        return p.matrixTransform(svg.getScreenCTM().inverse());
    };

    svg.querySelectorAll('.plan-room').forEach(g => {
        const body = g.querySelector('.plan-body');
        const label = g.querySelector('text');
        const handle = g.querySelector('.plan-handle');
        const r = { lx: +g.dataset.lx, lz: +g.dataset.lz, w: +g.dataset.w, d: +g.dataset.d };
        const draw = () => {
            body.setAttribute('x', r.lx - r.w / 2); body.setAttribute('y', r.lz - r.d / 2);
            body.setAttribute('width', r.w); body.setAttribute('height', r.d);
            label.setAttribute('x', r.lx); label.setAttribute('y', r.lz + 0.18);
            if (handle) { handle.setAttribute('x', r.lx + r.w / 2 - 0.6); handle.setAttribute('y', r.lz + r.d / 2 - 0.6); }
        };
        let mode = null, start = null, orig = null;
        const down = m => e => {
            e.stopPropagation();
            mode = m; start = toSvg(e); orig = { ...r };
            g.setPointerCapture(e.pointerId);
        };
        body.addEventListener('pointerdown', down('move'));
        if (handle) handle.addEventListener('pointerdown', down('resize'));
        g.addEventListener('pointermove', e => {
            if (!mode) return;
            const p = toSvg(e), dx = p.x - start.x, dz = p.y - start.y;
            if (mode === 'move') {
                r.lx = snap(clamp(orig.lx + dx, -W / 2 + r.w / 2, W / 2 - r.w / 2));
                r.lz = snap(clamp(orig.lz + dz, -D / 2 + r.d / 2, D / 2 - r.d / 2));
            } else {
                const left = orig.lx - orig.w / 2, top = orig.lz - orig.d / 2;
                r.w = snap(clamp(orig.w + dx, 1, W / 2 - left));
                r.d = snap(clamp(orig.d + dz, 1, D / 2 - top));
                r.lx = snap(left + r.w / 2); r.lz = snap(top + r.d / 2);
            }
            draw();
        });
        const up = () => {
            if (!mode) return;
            mode = null;
            if (r.lx === orig.lx && r.lz === orig.lz && r.w === orig.w && r.d === orig.d) return;
            const roomLabel = g.querySelector('title')?.textContent || g.dataset.room;
            if (!confirm(`ยืนยันการบันทึกตำแหน่ง/ขนาดใหม่ของห้อง "${roomLabel}" หรือไม่?\n• ตำแหน่ง x: ${r.lx} ม., z: ${r.lz} ม.\n• ขนาด: กว้าง ${r.w} ม. × ลึก ${r.d} ม.`)) {
                Object.assign(r, orig);
                draw();
                return;
            }
            form.room_id.value = g.dataset.room;
            form.lx.value = r.lx; form.lz.value = r.lz; form.w.value = r.w; form.d.value = r.d;
            form.submit();
        };
        g.addEventListener('pointerup', up);
        g.addEventListener('pointercancel', up);
    });
})();
