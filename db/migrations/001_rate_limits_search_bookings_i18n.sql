-- 001: per-IP rate limiting, anonymous search statistics, meeting-room bookings, English labels.

-- Fixed-window counters. bucket e.g. 'login:203.0.113.5', 'search:203.0.113.5'.
CREATE TABLE IF NOT EXISTS rate_limits (
    bucket       VARCHAR(100) NOT NULL,
    window_start DATETIME     NOT NULL,
    hits         INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (bucket, window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Aggregated per day: no IP, no timestamp per search, no user link (PDPA: not personal data).
-- query_norm is lower-cased, trimmed, digit runs >= 4 replaced by '#' (phone / ID numbers).
CREATE TABLE IF NOT EXISTS search_stats (
    day          DATE         NOT NULL,
    query_norm   VARCHAR(100) NOT NULL,
    hits         INT UNSIGNED NOT NULL DEFAULT 0,
    zero_results INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (day, query_norm)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    room_id       VARCHAR(16)  NOT NULL,
    title         VARCHAR(200) NOT NULL,
    department_id INT UNSIGNED NULL,                 -- organiser (optional)
    starts_at     DATETIME     NOT NULL,
    ends_at       DATETIME     NOT NULL,
    created_by    INT UNSIGNED NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bk_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_bk_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_bk_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_bk_room_time (room_id, starts_at, ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE departments
    ADD COLUMN name_en        VARCHAR(255) NOT NULL DEFAULT '' AFTER name,
    ADD COLUMN description_en TEXT NULL AFTER description;

ALTER TABLE buildings
    ADD COLUMN name_en       VARCHAR(200) NOT NULL DEFAULT '' AFTER name,
    ADD COLUMN short_name_en VARCHAR(100) NOT NULL DEFAULT '' AFTER short_name;

UPDATE buildings SET name_en = 'Building 1 (2-storey front, blue)',          short_name_en = 'Front building (2F)'   WHERE id = '2F';
UPDATE buildings SET name_en = 'Building 2 (4-storey rear, white-green)',    short_name_en = 'Rear building (4F)'    WHERE id = '4F';
UPDATE buildings SET name_en = 'One Stop Service Center (rear annex)',       short_name_en = 'OSSC (Chaphubal Rd)'   WHERE id = 'FDA';
UPDATE buildings SET name_en = 'Thai Traditional Medicine Clinic',           short_name_en = 'Thai Medicine Clinic'  WHERE id = 'TTM';

-- English names for the seeded departments (by current room). Editable in admin afterwards.
UPDATE departments d JOIN room_assignments ra ON ra.department_id = d.id AND ra.valid_to IS NULL
SET d.name_en = CASE ra.room_id
    WHEN 'R211' THEN 'Information desk & Central correspondence'
    WHEN 'R212' THEN 'General Administration (Finance & Accounting)'
    WHEN 'R213' THEN 'Procurement & Asset Management'
    WHEN 'R221' THEN 'Health Education & Public Relations'
    WHEN 'R222' THEN 'Legal Affairs (Public Health Law)'
    WHEN 'R223' THEN 'TO BE NUMBER ONE Meeting Room & Internal Audit'
    WHEN 'R411' THEN 'One Stop Service Center (Health Products, OSSC)'
    WHEN 'R412' THEN 'Health Insurance & Dental Public Health'
    WHEN 'R421' THEN 'Health Promotion (Maternal-Child / Elderly)'
    WHEN 'R422' THEN 'Communicable Disease Control & Epidemiology'
    WHEN 'R423' THEN 'NCDs, Mental Health & Substance Abuse'
    WHEN 'R431' THEN 'Office of the Provincial Chief Medical Officer'
    WHEN 'R432' THEN 'Executive Secretariat & Deputy Chief Medical Officers'
    WHEN 'R433' THEN 'Strategy Development & Human Resources'
    WHEN 'R434' THEN 'Service Quality Development'
    WHEN 'R441' THEN 'Digital Health'
    WHEN 'R442' THEN 'Environmental & Occupational Health'
    WHEN 'R443' THEN 'Main Meeting Room, 4th floor'
    WHEN 'RTTM1' THEN 'Thai Traditional Medicine Clinic'
    ELSE d.name_en END;
