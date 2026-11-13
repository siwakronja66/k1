// 2D Campus Site Plan & Building Placement Interactive Controller (Admin only)
// 100% CSP compliant: All event listeners bound via addEventListener (NO inline onclick/onsubmit).
(() => {
    const snap = (v, step = 0.5) => Math.round(v / step) * step;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const degToRad = (deg) => deg * Math.PI / 180;
    const radToDeg = (rad) => rad * 180 / Math.PI;

    // Normalize angle to range [-PI, PI]
    const normalizeRad = (rad) => {
        let r = rad % (2 * Math.PI);
        if (r > Math.PI) r -= 2 * Math.PI;
        if (r < -Math.PI) r += 2 * Math.PI;
        return +r.toFixed(4);
    };

    const getDirectionText = (rad) => {
        const deg = (radToDeg(rad) + 360) % 360;
        if (deg >= 337.5 || deg < 22.5) return 'หันหน้าทิศใต้ (South)';
        if (deg >= 22.5 && deg < 67.5) return 'หันหน้าทิศตะวันตกเฉียงใต้ (SW)';
        if (deg >= 67.5 && deg < 112.5) return 'หันหน้าทิศตะวันตก (West)';
        if (deg >= 112.5 && deg < 157.5) return 'หันหน้าทิศตะวันตกเฉียงเหนือ (NW)';
        if (deg >= 157.5 && deg < 202.5) return 'หันหน้าทิศเหนือ (North)';
        if (deg >= 202.5 && deg < 247.5) return 'หันหน้าทิศตะวันออกเฉียงเหนือ (NE)';
        if (deg >= 247.5 && deg < 292.5) return 'หันหน้าทิศตะวันออก (East)';
        return 'หันหน้าทิศตะวันออกเฉียงใต้ (SE)';
    };

    // =========================================================================
    // GEODESY CONSTANTS & CONVERTER (สสจ.มุกดาหาร)
    // Campus Center Origin (0, 0) = 16.541450° N, 104.724250° E
    // =========================================================================
    const CAMPUS_ORIGIN_LAT = 16.541450;
    const CAMPUS_ORIGIN_LON = 104.724250;
    const METERS_PER_DEG_LAT = 111320;
    const METERS_PER_DEG_LON = 111320 * Math.cos(CAMPUS_ORIGIN_LAT * Math.PI / 180);

    const xyToGps = (x, z) => ({
        lat: +(CAMPUS_ORIGIN_LAT - z / METERS_PER_DEG_LAT).toFixed(6),
        lon: +(CAMPUS_ORIGIN_LON + x / METERS_PER_DEG_LON).toFixed(6)
    });

    const gpsToXy = (lat, lon) => ({
        x: +((lon - CAMPUS_ORIGIN_LON) * METERS_PER_DEG_LON).toFixed(1),
        z: +-((lat - CAMPUS_ORIGIN_LAT) * METERS_PER_DEG_LAT).toFixed(1)
    });

    // =========================================================================
    // MODE 1: Form Placement Map (Create/Edit page)
    // =========================================================================
    const formSvg = document.getElementById('form-site-plan');
    if (formSvg) {
        const inputCx = document.getElementById('input-bld-cx');
        const inputCz = document.getElementById('input-bld-cz');
        const inputW = document.getElementById('input-bld-w');
        const inputD = document.getElementById('input-bld-d');
        const inputRot = document.getElementById('input-bld-rot');
        const formRotDegText = document.getElementById('form-rot-deg-text');
        const colorPicker = document.getElementById('bld-color-picker');
        const colorInput = document.getElementById('color-input');
        const inputGpsLat = document.getElementById('input-gps-lat');
        const inputGpsLon = document.getElementById('input-gps-lon');
        const btnOpenGmaps = document.getElementById('btn-open-gmaps');
        const btnGpsToXy = document.getElementById('btn-gps-to-xy');
        const btnXyToGps = document.getElementById('btn-xy-to-gps');

        const btnToggleSat = document.getElementById('btn-form-toggle-sat');
        const inputSatOpacity = document.getElementById('input-form-sat-opacity');
        const satImg = document.getElementById('form-satellite-img');

        const previewGroup = document.getElementById('preview-building');
        const previewBody = document.getElementById('preview-body');
        const previewLabel = document.getElementById('preview-label');
        const previewFrontLine = document.getElementById('preview-front-line');
        const previewFrontArrow = document.getElementById('preview-front-arrow');
        const previewCrossX = document.getElementById('preview-cross-x');
        const previewCrossZ = document.getElementById('preview-cross-z');

        let formStep = 1.0;

        // Satellite layer toggle and opacity
        let satVisible = true;
        btnToggleSat?.addEventListener('click', () => {
            satVisible = !satVisible;
            if (satImg) satImg.style.display = satVisible ? 'block' : 'none';
            btnToggleSat.classList.toggle('bg-emerald-600', satVisible);
            btnToggleSat.classList.toggle('text-white', satVisible);
            btnToggleSat.classList.toggle('bg-slate-800', !satVisible);
            btnToggleSat.classList.toggle('text-slate-300', !satVisible);
        });

        inputSatOpacity?.addEventListener('input', () => {
            if (satImg) {
                satImg.setAttribute('opacity', (parseFloat(inputSatOpacity.value) / 100).toFixed(2));
            }
        });

        const toFormSvg = (e) => {
            const p = formSvg.createSVGPoint();
            p.x = e.clientX;
            p.y = e.clientY;
            return p.matrixTransform(formSvg.getScreenCTM().inverse());
        };

        const updateFormPreview = () => {
            const cx = parseFloat(inputCx?.value || '0') || 0;
            const cz = parseFloat(inputCz?.value || '0') || 0;
            const w = Math.max(2, parseFloat(inputW?.value || '16') || 16);
            const d = Math.max(2, parseFloat(inputD?.value || '10') || 10);
            const rotY = parseFloat(inputRot?.value || '0') || 0;
            const col = colorInput?.value || '#10b981';

            const bx = cx - w / 2;
            const bz = cz - d / 2;
            const rotDeg = roundDeg(radToDeg(rotY));

            if (previewBody) {
                previewBody.setAttribute('x', bx);
                previewBody.setAttribute('y', bz);
                previewBody.setAttribute('width', w);
                previewBody.setAttribute('height', d);
                previewBody.setAttribute('fill', col);
            }
            if (previewFrontLine) {
                previewFrontLine.setAttribute('x1', bx);
                previewFrontLine.setAttribute('y1', bz + d);
                previewFrontLine.setAttribute('x2', bx + w);
                previewFrontLine.setAttribute('y2', bz + d);
            }
            if (previewFrontArrow) {
                previewFrontArrow.setAttribute('points', `${cx - 0.6},${bz + d} ${cx + 0.6},${bz + d} ${cx},${bz + d + 0.9}`);
            }
            if (previewLabel) {
                previewLabel.setAttribute('x', cx);
                previewLabel.setAttribute('y', cz + 0.3);
            }
            if (previewGroup) {
                previewGroup.setAttribute('transform', `rotate(${rotDeg}, ${cx}, ${cz})`);
            }
            if (previewCrossX) {
                previewCrossX.setAttribute('x1', -33);
                previewCrossX.setAttribute('x2', 33);
                previewCrossX.setAttribute('y1', cz);
                previewCrossX.setAttribute('y2', cz);
            }
            if (previewCrossZ) {
                previewCrossZ.setAttribute('x1', cx);
                previewCrossZ.setAttribute('x2', cx);
                previewCrossZ.setAttribute('y1', -28);
                previewCrossZ.setAttribute('y2', 26);
            }

            // Sync Rotation text
            if (formRotDegText) {
                formRotDegText.textContent = `${rotDeg.toFixed(1)}° (${rotY.toFixed(2)} rad) — ${getDirectionText(rotY)}`;
            }

            // Sync Real-world GPS
            const gps = xyToGps(cx, cz);
            if (inputGpsLat && document.activeElement !== inputGpsLat) inputGpsLat.value = gps.lat;
            if (inputGpsLon && document.activeElement !== inputGpsLon) inputGpsLon.value = gps.lon;
            if (btnOpenGmaps) {
                btnOpenGmaps.href = `https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lon}`;
            }
        };

        function roundDeg(deg) {
            return Math.round(deg * 10) / 10;
        }

        // GPS to XY and XY to GPS buttons
        btnGpsToXy?.addEventListener('click', () => {
            const lat = parseFloat(inputGpsLat?.value);
            const lon = parseFloat(inputGpsLon?.value);
            if (!isNaN(lat) && !isNaN(lon)) {
                const xy = gpsToXy(lat, lon);
                if (inputCx) inputCx.value = xy.x;
                if (inputCz) inputCz.value = xy.z;
                updateFormPreview();
            }
        });

        btnXyToGps?.addEventListener('click', () => {
            const cx = parseFloat(inputCx?.value || '0') || 0;
            const cz = parseFloat(inputCz?.value || '0') || 0;
            const gps = xyToGps(cx, cz);
            if (inputGpsLat) inputGpsLat.value = gps.lat;
            if (inputGpsLon) inputGpsLon.value = gps.lon;
            if (btnOpenGmaps) {
                btnOpenGmaps.href = `https://www.google.com/maps/search/?api=1&query=${gps.lat},${gps.lon}`;
            }
        });

        // Two-way sync: Form inputs -> Map preview
        [inputCx, inputCz, inputW, inputD, inputRot, colorInput].forEach(inp => {
            if (inp) inp.addEventListener('input', updateFormPreview);
        });

        // Rotation Snap buttons in Form
        document.querySelectorAll('.btn-form-rot-snap').forEach(btn => {
            btn.addEventListener('click', () => {
                const deg = parseFloat(btn.dataset.deg) || 0;
                if (inputRot) inputRot.value = normalizeRad(degToRad(deg));
                updateFormPreview();
            });
        });

        // Rotation Step buttons in Form
        document.querySelectorAll('.btn-form-rot-step').forEach(btn => {
            btn.addEventListener('click', () => {
                const delta = parseFloat(btn.dataset.delta) || 0;
                const cur = parseFloat(inputRot?.value || '0') || 0;
                if (inputRot) inputRot.value = normalizeRad(cur + degToRad(delta));
                updateFormPreview();
            });
        });

        // Color picker sync
        if (colorPicker && colorInput) {
            colorPicker.addEventListener('input', () => {
                colorInput.value = colorPicker.value;
                updateFormPreview();
            });
            colorInput.addEventListener('input', () => {
                if (/^#[0-9a-fA-F]{6}$/.test(colorInput.value)) {
                    colorPicker.value = colorInput.value;
                    updateFormPreview();
                }
            });
        }

        // Click anywhere on map to reposition building
        formSvg.addEventListener('click', (e) => {
            // Ignore if clicking on interactive controls
            if (e.target.closest('button, input, a')) return;
            const p = toFormSvg(e);
            const w = parseFloat(inputW?.value || '16') || 16;
            const d = parseFloat(inputD?.value || '10') || 10;
            const newX = snap(clamp(p.x, -33 + w / 2, 33 - w / 2), formStep);
            const newZ = snap(clamp(p.y, -28 + d / 2, 25 - d / 2), formStep);

            if (inputCx) inputCx.value = newX;
            if (inputCz) inputCz.value = newZ;
            updateFormPreview();
        });

        // Drag-and-drop on preview building
        if (previewGroup) {
            let dragging = false;
            let start = null;
            let orig = null;

            previewGroup.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                dragging = true;
                start = toFormSvg(e);
                orig = {
                    cx: parseFloat(inputCx?.value || '0') || 0,
                    cz: parseFloat(inputCz?.value || '0') || 0
                };
                previewGroup.setPointerCapture(e.pointerId);
            });

            previewGroup.addEventListener('pointermove', (e) => {
                if (!dragging) return;
                const p = toFormSvg(e);
                const dx = p.x - start.x;
                const dz = p.y - start.y;
                const w = parseFloat(inputW?.value || '16') || 16;
                const d = parseFloat(inputD?.value || '10') || 10;

                const newX = snap(clamp(orig.cx + dx, -33 + w / 2, 33 - w / 2), formStep);
                const newZ = snap(clamp(orig.cz + dz, -28 + d / 2, 25 - d / 2), formStep);

                if (inputCx) inputCx.value = newX;
                if (inputCz) inputCz.value = newZ;
                updateFormPreview();
            });

            const endDrag = () => { dragging = false; };
            previewGroup.addEventListener('pointerup', endDrag);
            previewGroup.addEventListener('pointercancel', endDrag);
        }

        // Quick Preset Buttons
        document.querySelectorAll('.btn-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const px = parseFloat(btn.dataset.x);
                const pz = parseFloat(btn.dataset.z);
                if (inputCx) inputCx.value = px;
                if (inputCz) inputCz.value = pz;
                updateFormPreview();
            });
        });

        // Step Size for Form Nudge
        document.querySelectorAll('.btn-form-step').forEach(btn => {
            btn.addEventListener('click', () => {
                formStep = parseFloat(btn.dataset.step) || 1.0;
                document.querySelectorAll('.btn-form-step').forEach(b => {
                    b.classList.remove('bg-emerald-600', 'text-white', 'font-bold');
                    b.classList.add('bg-slate-800', 'text-slate-300');
                });
                btn.classList.add('bg-emerald-600', 'text-white', 'font-bold');
                btn.classList.remove('bg-slate-800', 'text-slate-300');
            });
        });

        // D-Pad for Form Nudge
        const nudgeForm = (dx, dz) => {
            const w = parseFloat(inputW?.value || '16') || 16;
            const d = parseFloat(inputD?.value || '10') || 10;
            const curX = parseFloat(inputCx?.value || '0') || 0;
            const curZ = parseFloat(inputCz?.value || '0') || 0;

            const newX = snap(clamp(curX + dx * formStep, -33 + w / 2, 33 - w / 2), formStep);
            const newZ = snap(clamp(curZ + dz * formStep, -28 + d / 2, 25 - d / 2), formStep);

            if (inputCx) inputCx.value = newX;
            if (inputCz) inputCz.value = newZ;
            updateFormPreview();
        };

        document.getElementById('btn-form-up')?.addEventListener('click', () => nudgeForm(0, -1));
        document.getElementById('btn-form-down')?.addEventListener('click', () => nudgeForm(0, 1));
        document.getElementById('btn-form-left')?.addEventListener('click', () => nudgeForm(-1, 0));
        document.getElementById('btn-form-right')?.addEventListener('click', () => nudgeForm(1, 0));

        // Keyboard arrow listener for form page
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
            const mult = e.shiftKey ? 5 : 1;
            if (e.key === 'ArrowUp') { e.preventDefault(); nudgeForm(0, -mult); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); nudgeForm(0, mult); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeForm(-mult, 0); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); nudgeForm(mult, 0); }
        });

        // Initial preview render
        updateFormPreview();
    }

    // =========================================================================
    // MODE 2: Main Campus Site Plan Editor (List & Layout page)
    // =========================================================================
    const mainSvg = document.getElementById('site-plan');
    const moveForm = document.getElementById('site-move-form');
    if (!mainSvg || !moveForm) return;

    const toMainSvg = (e) => {
        const p = mainSvg.createSVGPoint();
        p.x = e.clientX;
        p.y = e.clientY;
        return p.matrixTransform(mainSvg.getScreenCTM().inverse());
    };

    const buildings = {};
    let selectedId = null;
    let mainStep = 1.0;

    // UI elements
    const selDropdown = document.getElementById('site-building-select');
    const selNameEl = document.getElementById('site-sel-name');
    const selBadgeEl = document.getElementById('site-sel-badge');
    const selPosEl = document.getElementById('site-sel-pos');
    const selDimEl = document.getElementById('site-sel-dim');
    const selRotEl = document.getElementById('site-sel-rot');
    const selGpsEl = document.getElementById('site-sel-gps');
    const selGmapsLink = document.getElementById('site-sel-gmaps-link');
    const btnSaveEl = document.getElementById('btn-site-save');
    const btnResetEl = document.getElementById('btn-site-reset');
    const saveNoticeEl = document.getElementById('site-save-notice');
    const activePin = document.getElementById('site-active-pin');
    const activePinText = document.getElementById('site-active-pin-text');
    const guideX = document.getElementById('site-guide-x');
    const guideZ = document.getElementById('site-guide-z');

    // Layer toolbar elements
    const btnToggleSat = document.getElementById('btn-site-toggle-sat');
    const inputSatOpacity = document.getElementById('input-site-sat-opacity');
    const satImg = document.getElementById('site-satellite-img');
    const btnToggleCirc = document.getElementById('btn-site-toggle-circ');
    const circLayer = document.getElementById('site-circulation-layer');
    const btnView3D = document.getElementById('btn-site-view-3d');

    // Satellite layer visibility & opacity
    let satVisible = true;
    btnToggleSat?.addEventListener('click', () => {
        satVisible = !satVisible;
        if (satImg) satImg.style.display = satVisible ? 'block' : 'none';
        btnToggleSat.classList.toggle('bg-emerald-600', satVisible);
        btnToggleSat.classList.toggle('text-white', satVisible);
        btnToggleSat.classList.toggle('bg-slate-800', !satVisible);
        btnToggleSat.classList.toggle('text-slate-200', !satVisible);
    });

    inputSatOpacity?.addEventListener('input', () => {
        if (satImg) {
            satImg.setAttribute('opacity', (parseFloat(inputSatOpacity.value) / 100).toFixed(2));
        }
    });

    // Circulation layer toggle
    let circVisible = true;
    btnToggleCirc?.addEventListener('click', () => {
        circVisible = !circVisible;
        if (circLayer) circLayer.style.display = circVisible ? 'block' : 'none';
        btnToggleCirc.classList.toggle('bg-emerald-950/80', circVisible);
        btnToggleCirc.classList.toggle('text-emerald-300', circVisible);
        btnToggleCirc.classList.toggle('bg-slate-800', !circVisible);
        btnToggleCirc.classList.toggle('text-slate-400', !circVisible);
    });

    // Collect buildings from SVG
    mainSvg.querySelectorAll('.site-building').forEach(g => {
        const id = g.dataset.id;
        const b = {
            id,
            name: g.dataset.name || id,
            cx: parseFloat(g.dataset.x),
            cz: parseFloat(g.dataset.z),
            w: parseFloat(g.dataset.w),
            d: parseFloat(g.dataset.d),
            rotY: parseFloat(g.dataset.rot || '0'),
            origCx: parseFloat(g.dataset.x),
            origCz: parseFloat(g.dataset.z),
            origW: parseFloat(g.dataset.w),
            origD: parseFloat(g.dataset.d),
            origRotY: parseFloat(g.dataset.rot || '0'),
            group: g,
            body: g.querySelector('.bld-body'),
            label: g.querySelector('.bld-label'),
            sub: g.querySelector('.bld-sub'),
            handle: g.querySelector('.bld-handle'),
            ring: g.querySelector('.bld-ring'),
            frontLine: g.querySelector('.bld-front-line'),
            frontArrow: g.querySelector('.bld-front-arrow')
        };
        buildings[id] = b;

        if (!selectedId) {
            selectedId = id;
        }
    });

    const drawBuilding = (b) => {
        const bx = b.cx - b.w / 2;
        const bz = b.cz - b.d / 2;
        const deg = Math.round(radToDeg(b.rotY) * 10) / 10;

        if (b.body) {
            b.body.setAttribute('x', bx);
            b.body.setAttribute('y', bz);
            b.body.setAttribute('width', b.w);
            b.body.setAttribute('height', b.d);
        }
        if (b.ring) {
            b.ring.setAttribute('x', bx - 0.5);
            b.ring.setAttribute('y', bz - 0.5);
            b.ring.setAttribute('width', b.w + 1.0);
            b.ring.setAttribute('height', b.d + 1.0);
        }
        if (b.frontLine) {
            b.frontLine.setAttribute('x1', bx);
            b.frontLine.setAttribute('y1', bz + b.d);
            b.frontLine.setAttribute('x2', bx + b.w);
            b.frontLine.setAttribute('y2', bz + b.d);
        }
        if (b.frontArrow) {
            b.frontArrow.setAttribute('points', `${b.cx - 0.6},${bz + b.d} ${b.cx + 0.6},${bz + b.d} ${b.cx},${bz + b.d + 0.9}`);
        }
        if (b.label) {
            b.label.setAttribute('x', b.cx);
            b.label.setAttribute('y', b.cz - (b.sub ? 0.3 : 0));
        }
        if (b.sub) {
            b.sub.setAttribute('x', b.cx);
            b.sub.setAttribute('y', b.cz + 0.8);
            b.sub.textContent = `${b.w}×${b.d} ม. (X:${b.cx}, Z:${b.cz})`;
        }
        if (b.handle) {
            b.handle.setAttribute('x', bx + b.w - 1.2);
            b.handle.setAttribute('y', bz + b.d - 1.2);
        }
        if (b.group) {
            b.group.setAttribute('transform', `rotate(${deg}, ${b.cx}, ${b.cz})`);
        }
    };

    const hasChanges = (b) => {
        return (
            b.cx !== b.origCx ||
            b.cz !== b.origCz ||
            b.w !== b.origW ||
            b.d !== b.origD ||
            Math.abs(b.rotY - b.origRotY) > 0.001
        );
    };

    const updateUI = () => {
        const b = buildings[selectedId];
        if (!b) return;

        // Update rings and handles
        Object.values(buildings).forEach(item => {
            const isSel = (item.id === selectedId);
            if (item.ring) item.ring.style.display = isSel ? 'block' : 'none';
            if (item.handle) item.handle.style.display = isSel ? 'block' : 'none';
        });

        // Floating pin & guide lines
        if (activePin) {
            activePin.setAttribute('transform', `translate(${b.cx}, ${b.cz - b.d / 2 - 1.5})`);
            activePin.classList.remove('hidden');
        }
        if (activePinText) {
            activePinText.textContent = `📍 กำลังเลือก: ${b.name}`;
        }
        if (guideX) {
            guideX.setAttribute('x1', -33);
            guideX.setAttribute('x2', 33);
            guideX.setAttribute('y1', b.cz);
            guideX.setAttribute('y2', b.cz);
            guideX.classList.remove('hidden');
        }
        if (guideZ) {
            guideZ.setAttribute('x1', b.cx);
            guideZ.setAttribute('x2', b.cx);
            guideZ.setAttribute('y1', -28);
            guideZ.setAttribute('y2', 26);
            guideZ.classList.remove('hidden');
        }

        // Sync dropdown
        if (selDropdown && selDropdown.value !== selectedId) {
            selDropdown.value = selectedId;
        }

        // Text readouts
        if (selNameEl) selNameEl.textContent = b.name;
        if (selBadgeEl) selBadgeEl.textContent = b.id;
        if (selPosEl) selPosEl.textContent = `X: ${b.cx} ม. | Z: ${b.cz} ม.`;
        if (selDimEl) selDimEl.textContent = `${b.w} × ${b.d} ม.`;

        // Rotation readout
        const deg = Math.round(radToDeg(b.rotY) * 10) / 10;
        if (selRotEl) {
            selRotEl.textContent = `${deg.toFixed(1)}° (${b.rotY.toFixed(2)} rad) — ${getDirectionText(b.rotY)}`;
        }

        // Real-world GPS
        const bGps = xyToGps(b.cx, b.cz);
        if (selGpsEl) selGpsEl.textContent = `${bGps.lat}° N, ${bGps.lon}° E`;
        if (selGmapsLink) selGmapsLink.href = `https://www.google.com/maps/search/?api=1&query=${bGps.lat},${bGps.lon}`;

        // 3D Live Viewer link
        if (btnView3D) {
            btnView3D.href = `../index.html?view=bld&id=${encodeURIComponent(b.id)}`;
        }

        // Pill buttons active state
        document.querySelectorAll('.btn-bld-pill').forEach(pill => {
            if (pill.dataset.id === selectedId) {
                pill.classList.add('bg-emerald-600', 'text-white', 'border-emerald-400');
                pill.classList.remove('bg-slate-800', 'text-slate-300', 'border-slate-700');
            } else {
                pill.classList.remove('bg-emerald-600', 'text-white', 'border-emerald-400');
                pill.classList.add('bg-slate-800', 'text-slate-300', 'border-slate-700');
            }
        });

        // Save & Reset buttons
        const changed = hasChanges(b);
        if (btnSaveEl) {
            btnSaveEl.disabled = !changed;
            if (changed) {
                btnSaveEl.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-slate-700');
                btnSaveEl.classList.add('bg-emerald-600', 'hover:bg-emerald-500', 'shadow-xl', 'animate-pulse');
            } else {
                btnSaveEl.classList.add('opacity-50', 'cursor-not-allowed', 'bg-slate-700');
                btnSaveEl.classList.remove('bg-emerald-600', 'hover:bg-emerald-500', 'shadow-xl', 'animate-pulse');
            }
        }
        if (btnResetEl) {
            btnResetEl.disabled = !changed;
            btnResetEl.classList.toggle('hidden', !changed);
        }
        if (saveNoticeEl) {
            saveNoticeEl.classList.toggle('hidden', !changed);
        }
    };

    const selectBuilding = (id) => {
        if (!buildings[id]) return;
        selectedId = id;
        updateUI();
    };

    // Dropdown change listener
    selDropdown?.addEventListener('change', () => {
        selectBuilding(selDropdown.value);
    });

    // Pill buttons click listeners
    document.querySelectorAll('.btn-bld-pill').forEach(pill => {
        pill.addEventListener('click', () => selectBuilding(pill.dataset.id));
    });

    // Building Cards "ปรับในผัง" button click listeners
    document.querySelectorAll('.btn-card-select').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            selectBuilding(id);
            mainSvg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    // Step buttons
    document.querySelectorAll('.btn-site-step').forEach(btn => {
        btn.addEventListener('click', () => {
            mainStep = parseFloat(btn.dataset.step) || 1.0;
            document.querySelectorAll('.btn-site-step').forEach(b => {
                b.classList.remove('bg-emerald-600', 'text-white', 'font-bold');
                b.classList.add('bg-slate-800', 'text-slate-300');
            });
            btn.classList.add('bg-emerald-600', 'text-white', 'font-bold');
            btn.classList.remove('bg-slate-800', 'text-slate-300');
        });
    });

    // Nudge D-Pad
    const nudge = (dx, dz) => {
        const b = buildings[selectedId];
        if (!b) return;
        b.cx = snap(clamp(b.cx + dx * mainStep, -32 + b.w / 2, 32 - b.w / 2), mainStep);
        b.cz = snap(clamp(b.cz + dz * mainStep, -28 + b.d / 2, 24 - b.d / 2), mainStep);
        drawBuilding(b);
        updateUI();
    };

    document.getElementById('btn-nudge-up')?.addEventListener('click', () => nudge(0, -1));
    document.getElementById('btn-nudge-down')?.addEventListener('click', () => nudge(0, 1));
    document.getElementById('btn-nudge-left')?.addEventListener('click', () => nudge(-1, 0));
    document.getElementById('btn-nudge-right')?.addEventListener('click', () => nudge(1, 0));

    // Keyboard Shortcuts for Main Site Plan
    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
        const mult = e.shiftKey ? 5 : 1;
        if (e.key === 'ArrowUp') { e.preventDefault(); nudge(0, -mult); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); nudge(0, mult); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-mult, 0); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); nudge(mult, 0); }
        else if (e.key === '[' || e.key === 'q' || e.key === 'Q') {
            e.preventDefault();
            rotateBuilding(-5);
        } else if (e.key === ']' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
            rotateBuilding(5);
        }
    });

    // Rotation Functions
    const setBuildingRotationDeg = (deg) => {
        const b = buildings[selectedId];
        if (!b) return;
        b.rotY = normalizeRad(degToRad(deg));
        drawBuilding(b);
        updateUI();
    };

    const rotateBuilding = (deltaDeg) => {
        const b = buildings[selectedId];
        if (!b) return;
        b.rotY = normalizeRad(b.rotY + degToRad(deltaDeg));
        drawBuilding(b);
        updateUI();
    };

    // Cardinal Snap Buttons
    document.querySelectorAll('.btn-rot-cardinal').forEach(btn => {
        btn.addEventListener('click', () => {
            const deg = parseFloat(btn.dataset.deg) || 0;
            setBuildingRotationDeg(deg);
        });
    });

    // Step Nudge Rotation Buttons
    document.querySelectorAll('.btn-rot-step').forEach(btn => {
        btn.addEventListener('click', () => {
            const delta = parseFloat(btn.dataset.delta) || 0;
            rotateBuilding(delta);
        });
    });

    // Size (+ / -)
    const resize = (dw, dd) => {
        const b = buildings[selectedId];
        if (!b) return;
        b.w = snap(clamp(b.w + dw * mainStep, 3, 60), mainStep);
        b.d = snap(clamp(b.d + dd * mainStep, 3, 50), mainStep);
        drawBuilding(b);
        updateUI();
    };

    document.getElementById('btn-size-w-dec')?.addEventListener('click', () => resize(-1, 0));
    document.getElementById('btn-size-w-inc')?.addEventListener('click', () => resize(1, 0));
    document.getElementById('btn-size-d-dec')?.addEventListener('click', () => resize(0, -1));
    document.getElementById('btn-size-d-inc')?.addEventListener('click', () => resize(0, 1));

    // Preset alignment buttons in main page
    document.querySelectorAll('.btn-main-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const b = buildings[selectedId];
            if (!b) return;
            const px = parseFloat(btn.dataset.x);
            const pz = parseFloat(btn.dataset.z);
            b.cx = snap(px, mainStep);
            b.cz = snap(pz, mainStep);
            drawBuilding(b);
            updateUI();
        });
    });

    // Reset button
    btnResetEl?.addEventListener('click', () => {
        const b = buildings[selectedId];
        if (!b || !hasChanges(b)) return;
        if (!confirm(`ต้องการยกเลิกการแก้ไขและคืนค่าเดิมของอาคาร "${b.name}" (${b.id}) ใช่หรือไม่?`)) {
            return;
        }
        b.cx = b.origCx;
        b.cz = b.origCz;
        b.w = b.origW;
        b.d = b.origD;
        b.rotY = b.origRotY;
        drawBuilding(b);
        updateUI();
    });

    // Save button
    btnSaveEl?.addEventListener('click', () => {
        const b = buildings[selectedId];
        if (!b || !hasChanges(b)) return;

        const deg = (Math.round(radToDeg(b.rotY) * 10) / 10).toFixed(1);
        const msg = `ยืนยันการบันทึกตำแหน่ง ขนาด และการหมุนของอาคาร "${b.name}" (${b.id})?\n\n` +
                    `• พิกัดกึ่งกลาง: X = ${b.cx} ม., Z = ${b.cz} ม.\n` +
                    `• ขนาดอาคาร: กว้าง ${b.w} ม. × ลึก ${b.d} ม.\n` +
                    `• มุมหมุนอาคาร: ${deg}° (${b.rotY.toFixed(2)} rad)\n\n` +
                    `(ระบบจะอัปเดตโมเดล 3D หน้าบ้านทันที)`;

        if (!confirm(msg)) {
            return;
        }

        moveForm.id.value = b.id;
        moveForm.center_x.value = b.cx;
        moveForm.center_z.value = b.cz;
        moveForm.width.value = b.w;
        moveForm.depth.value = b.d;
        moveForm.rot_y.value = b.rotY;
        moveForm.submit();
    });

    // Drag and Drop for all buildings on Main Map
    Object.values(buildings).forEach(b => {
        const g = b.group;
        let mode = null;
        let start = null;
        let orig = null;

        const down = m => e => {
            e.stopPropagation();
            selectBuilding(b.id);
            mode = m;
            start = toMainSvg(e);
            orig = { cx: b.cx, cz: b.cz, w: b.w, d: b.d };
            g.setPointerCapture(e.pointerId);
        };

        b.body?.addEventListener('pointerdown', down('move'));
        b.handle?.addEventListener('pointerdown', down('resize'));

        g.addEventListener('pointermove', e => {
            if (!mode) return;
            const p = toMainSvg(e);
            const dx = p.x - start.x;
            const dz = p.y - start.y;

            if (mode === 'move') {
                b.cx = snap(clamp(orig.cx + dx, -32 + b.w / 2, 32 - b.w / 2), mainStep);
                b.cz = snap(clamp(orig.cz + dz, -28 + b.d / 2, 24 - b.d / 2), mainStep);
            } else if (mode === 'resize') {
                const left = orig.cx - orig.w / 2;
                const top = orig.cz - orig.d / 2;
                b.w = snap(clamp(orig.w + dx, 3, 34 - left), mainStep);
                b.d = snap(clamp(orig.d + dz, 3, 25 - top), mainStep);
                b.cx = snap(left + b.w / 2, mainStep);
                b.cz = snap(top + b.d / 2, mainStep);
            }

            drawBuilding(b);
            updateUI();
        });

        const up = () => {
            if (!mode) return;
            mode = null;
            updateUI();
        };

        g.addEventListener('pointerup', up);
        g.addEventListener('pointercancel', up);
    });

    // Initial render
    updateUI();
})();
