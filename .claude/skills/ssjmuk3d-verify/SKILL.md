---
name: ssjmuk3d-verify
description: End-to-end check of the ssjmuk3d web app (public 3D viewer + admin + API) with Docker and Playwright MCP. Use before declaring any ssjmuk3d change done, or when asked to "verify", "test the app", "check mobile".
---

# Verify ssjmuk3d

Run from `D:/www/ssjmuk3d`. Report a pass/fail line per step; quote the shortest failing output.

## 1. Build + stack
- `npm run build` if `src-css/`, `tailwind.config.cjs`, or HTML/JS class names changed (Tailwind purges unused classes).
- `npm run seed` only if `db/nav-seed.sql` or the embedded data block in `public/js/app.js` changed. Regenerates `db/seed.sql` + `public/data/snapshot.json`.
- `docker compose up -d --build`. A changed `db/*.sql` only applies to a NEW volume: ask before `docker compose down -v` (destroys DB).
- Lint: `node --check` every changed `.js`; `MSYS_NO_PATHCONV=1 docker compose exec -T web php -l /var/www/app/<file>` every changed `.php`.

## 2. Automated suites (run first)
- `node tests/public_api.test.mjs` (snapshot, ETag, reachability, no infra text, search-log, 404/405, src/ not served)
- `node tests/admin_pages.test.mjs '<admin password>'` (every back-office page, CSRF, editor scope, XSS, booking overlap; cleans up)
- `MSYS_NO_PATHCONV=1 docker compose exec -T web php tests/client_ip_test.php`
- All must exit 0. Login is rate-limited per IP (20 / 10 min): repeated admin runs can lock you out until the window rolls.
- Manual curl: send JSON bodies from a UTF-8 file (`--data-binary @file`); Thai in shell args is not UTF-8 on Windows.

## 3. Public viewer (Playwright MCP)
Navigate fresh after a deploy: the service worker is network-first for html/js/css, but a page opened before the new SW activated still runs old code — reload once.
- Desktop 1536x770 and mobile 390x844 (`browser_resize` AFTER `browser_navigate`; navigation resets viewport).
- Console: only 404s for missing photos are acceptable.
- `?room=R441` selects that room. No horizontal overflow on mobile (`scrollWidth - innerWidth === 0`).
- Search a service word ("ร้านยา") finds R411.
- Wayfinding: every room reachable from `ent_front` (`buildNavGraph(false)` + `shortestPath`); accessible mode reaches floor-1 rooms only and shows the no-lift message otherwise; 20 draw/clear cycles keep `renderer.info.memory.geometries` flat.
- Touch: synthetic PointerEvents (pointerType touch, ids 1/2) orbit and pinch change `camTargetState`.
- Offline: `page.context().setOffline(true)` + reload still renders rooms + nav.
- Kiosk: `?kiosk=1` hides the staff link and does not rewrite the URL.
- Language: `#btn-lang` toggles TH/EN; detail title, route steps, placeholder change; choice persists (`localStorage ssj3d.lang`).
- Bookings: a booking in progress on R443 shows "กำลังใช้งาน" in detail + list; HTML in titles renders as text.

## 2b. Migrations / backup
- New `db/migrations/NNN_*.sql` applied: `docker compose exec web php bin/migrate.php` prints `applied` then `up to date` on rerun.
- `docker compose logs backup` shows `backup: wrote ...`; the dump lists all tables.
- Login is rate-limited per IP (20 per 10-minute window): heavy auth tests lock you out until the window rolls over.

## 4. Admin (Playwright MCP, http://localhost:8090/admin/)
- Needs an admin: `docker compose exec web php bin/create-admin.php <user>` (password on stdin). Never put passwords in URLs or commit them.
- Server-rendered PHP pages. Login via the form, open each menu page, drag a room on `rooms.php` (page reloads with flash "บันทึกตำแหน่งห้องแล้ว", audit.php shows `room.update`), `qr.php` renders one SVG per room, a `data-confirm` form opens a confirm dialog (dismiss it: nothing changes).
- Check PHP log: `docker compose logs web | grep -i "PHP Warning"` must be empty.
- Console must show no CSP violations. Mobile 390px: no horizontal overflow.

## 5. Clean up
Close the browser, delete `.playwright-mcp/`, remove any test users/data you created (or reset the local DB after asking).
