#!/bin/sh
# Runs inside the `backup` service (mysql:8.0 image). Dumps once at start, then daily at 02:00 Asia/Bangkok.
# Files: /backups/ssjmuk3d-YYYYmmdd-HHMM.sql.gz, older than 14 days are deleted.
set -eu

dump() {
    ts=$(date +%Y%m%d-%H%M)
    out="/backups/${DB_NAME}-${ts}.sql.gz"
    if mysqldump -h db -uroot --single-transaction --routines --no-tablespaces "$DB_NAME" | gzip > "$out.tmp"; then
        mv "$out.tmp" "$out"
        echo "backup: wrote $out"
    else
        rm -f "$out.tmp"
        echo "backup: FAILED at $ts" >&2
    fi
    find /backups -name "${DB_NAME}-*.sql.gz" -mtime +14 -delete
}

dump
while true; do
    now=$(date +%s)
    next=$(date -d "tomorrow 02:00" +%s 2>/dev/null || echo $((now + 86400)))
    sleep $((next - now))
    dump
done
