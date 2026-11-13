# CLAUDE.md (ssjmuk3d)

Public 3D floor plan + department directory + wayfinding for สสจ.มุกดาหาร, with a staff back-office. Public-facing (visitors, QR on doors, kiosk). Inherits `D:/www/CLAUDE.md` + `D:/www/.claude/` (rtk hook, caveman, skills).

## Layout
- `public/` web root (Apache DocumentRoot). `index.html` + `js/app.js` viewer, `admin/*.php` server-rendered back-office (one file per page, JS only in `admin/assets/`), `api/index.php` public JSON API (snapshot, search-log only), `sw.js` PWA, `data/snapshot.json` static fallback, `vendor/` built/vendored assets (generated, don't hand-edit), `assets/` photos + icon.
- `src/` PHP outside web root: `bootstrap.php` (env, PDO, session, CSRF, validation, audit), `handlers.php` (all routes).
- `db/` `schema.sql`, `seed.sql` (generated), `nav-seed.sql` (hand-written graph): applied only on a NEW MySQL volume. Every later schema change = new `db/migrations/NNN_snake.sql` (auto-run by `bin/migrate.php` on web start; never edit an applied one).
- `bin/` `migrate.php`, `create-admin.php`, `backup.sh` (run by the `backup` service, daily 02:00 -> `./backups`).
- `MANUAL.th.md`: the single Thai manual for humans (users, staff, admins, developers, roadmap). Update the matching section + date whenever behaviour, setup, data model, API or roadmap changes.
- `tools/` `extract-seed.mjs` (seed + snapshot.json from app.js data block + nav-seed.sql), `vendor.mjs` (copy libs/fonts from node_modules).
- `src-css/app.css` + `tailwind.config.cjs` -> `public/vendor/app.css`.

## Stack
- PHP 8.3 (Apache, no framework) + MySQL 8, Docker Compose (`web`, `db`), port `WEB_PORT` (8090).
- Three.js **r128** vendored: r128 API only. Tailwind 3 built (no CDN). Fonts/FA vendored. No runtime CDN.
- Commands: `npm run build` (vendor + css), `npm run seed`, `docker compose up -d --build`, `docker compose exec web php bin/create-admin.php <user>` (password on stdin).

## Data model
- `rooms` (physical, id printed in QR `?room=<id>`: never change ids) vs `departments` (org units) joined by `room_assignments` (valid_from/valid_to; current = from <= today < to).
- `services` keyword -> department: drives "search by what you came for".
- `nav_nodes`/`nav_edges` world coords; `is_accessible=0` on stairs (no lift). Room door nodes are computed client-side (2 nearest nodes on same building/floor), so admin room moves never break routes.
- `data_version` bumped on every admin write -> snapshot ETag (`"v<version>-<Ymd>"`, date because the bookings window moves daily).
- `bookings`: meeting-type rooms only, overlap check under `SELECT ... FOR UPDATE` on the room row; titles are public.
- `search_stats`: daily aggregates of normalised queries only (digits >= 4 -> `#`, emails stripped); no IP/user. `rate_limits`: fixed-window per-IP counters (`rate_limit()`), login 20/10min, search-log 60/10min.
- i18n: `I18N` dict + `t()` in `app.js`, `data-i18n` attributes in HTML; data columns `name_en`, `description_en`, `short_name_en`, `label_en` fall back to Thai when empty.
- Building geometry is hand-modelled per id in `app.js`; DB holds only labels + footprint for the 2D editor.
- `accessible` is a MySQL reserved word: column is `is_accessible`, alias needs backticks.

## Rules
- Public site: no IT infrastructure detail (hypervisor, DB tool, IPs) in any public text. Personal names/photos only with consent.
- Viewer: user data via `textContent` or `escapeHtml()`.
- Back-office pages: `admin_page()` -> `handle_post(fn, back)` (CSRF from `_csrf` field, PRG + flash) -> `page_start()` ... `page_end()`; every echo through `e()`; writes only via POST forms with `csrf_field()`; CSP `'self'`: no inline script/style/on* (JS in `public/admin/assets/`, passed to `page_start`). Admin-only pages check `is_admin()` AND the service calls `require_admin()`.
- All business logic + permission checks live in `src/services.php` (validate with `v_str/v_enum/v_int_or_null`, `can_edit_department`, every write -> `audit()` + `bump_data_version()`). Pages and API handlers never write SQL themselves.
- `client_ip()` trusts X-Forwarded-For only from `TRUSTED_PROXIES`. `notify_webhook()` (called by `audit()`) posts a non-sensitive summary to `NOTIFY_WEBHOOK_URL` if set.
- 3D: remove objects with `scene.remove` + `disposeObject3D()`. Pointer Events only; drag > `CLICK_SLOP` px never selects. Render loop is on-demand (`requestRender()`).
- Service worker: html/js/css network-first, fonts/images cache-first. Bump `VERSION` in `sw.js` when the shell file list changes.
- Windows shell: Thai in curl args is not UTF-8 -> send JSON from a file. Use `MSYS_NO_PATHCONV=1` for `docker compose exec` paths in Git Bash.

## Verify
Run `tests/` (see README "Tests") and the `ssjmuk3d-verify` skill (`.claude/skills/`) before calling anything done. `.claude/hooks/lint.mjs` syntax-checks edited JS/PHP/JSON (wire it in `.claude/settings.json`).

## Not done yet
See `MANUAL.th.md` section 7.1. Before production with a reverse proxy: make `client_ip()` honour `X-Forwarded-For` only from a trusted proxy IP (section 7.2). Top: real photos, on-site survey of nav coordinates, nav-graph editor in admin, automated tests in repo, Lao (needs native-speaker review).

## Environment notes
- A user PreToolUse hook blocks Bash commands containing destructive SQL keywords (e.g. `DELETE FROM`) even inside heredocs that only write code: use Edit/Write for such code; do not bypass with `CLAUDE_NO_DB_BACKUP=1` unless the user approves.
- `.env` is deny-listed for Read/Edit: ask the user to change it.
