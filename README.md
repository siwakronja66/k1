# ผังอาคาร 3 มิติ สสจ.มุกดาหาร

> **คู่มือฉบับเต็มภาษาไทย (ผู้ใช้ · เจ้าหน้าที่ · ผู้ดูแลระบบ · นักพัฒนา · วิธีพัฒนาต่อ): [MANUAL.th.md](MANUAL.th.md)**

Public 3D floor plan, department search (by department or by service, e.g. "ร้านยา"), turn-by-turn wayfinding (incl. step-free mode), meeting-room status + booking, Thai/English, kiosk mode, offline PWA, anonymous search stats, and a staff back-office (PHP 8.3 + MySQL 8). Schema changes ship as `db/migrations/*.sql` (auto-applied on start); the `backup` service dumps the DB nightly to `./backups`.

## Run

```bash
cp .env.example .env          # set strong DB_PASS / MYSQL_ROOT_PASSWORD; COOKIE_SECURE=0 only for http://localhost
docker compose up -d --build  # http://localhost:8090  (admin: /admin/)
docker compose exec web php bin/create-admin.php admin   # type password (>= 10 chars), Enter
```

First start creates the schema and seed data (`db/*.sql`). These files run only on an empty DB volume.

Local frontend work without rebuilding the image: `npm ci && npm run build` (fills `public/vendor/`, which the dev bind-mount serves).

## Production

- Put it behind HTTPS (reverse proxy) and keep `COOKIE_SECURE=1`.
- Remove the dev bind-mounts under `web.volumes` in `docker-compose.yml`.
- Restrict `/admin/` to the internal network or VPN at the proxy, and set `TRUSTED_PROXIES` to the proxy IP.
- Back up the `db_data` volume (`mysqldump`) on a schedule.

## URLs

| URL | Use |
|---|---|
| `/?room=R441` | Opens a room (printed on door QR codes; generate them in admin > QR) |
| `/?kiosk=1` | Lobby touch screen: no staff link, resets after 2 min idle |
| `/admin/` | Staff back-office: server-rendered PHP pages (`public/admin/*.php`, logic in `src/services.php`) |
| `/api/v1/snapshot` | Public read-only data for the 3D viewer (ETag cached) |

## Tests

```bash
node tests/public_api.test.mjs
node tests/admin_pages.test.mjs '<admin password>'      # local/dev only: creates and cleans its own test data
docker compose exec -T web php tests/client_ip_test.php
```

## Roles

- **admin**: everything, including room assignment, plan editing, users, audit log.
- **editor**: edits only their own department's text and service keywords.

## Before go-live

- Add real photos to `public/assets/` (filenames referenced in `public/index.html`).
- Walk the site and correct stair/door coordinates in `db/nav-seed.sql` (currently approximated from the 3D model).
- Get consent for any personal name/photo shown publicly.
