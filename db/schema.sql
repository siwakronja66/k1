-- ssjmuk3d schema (MySQL 8). Applied automatically on first container start (docker-entrypoint-initdb.d).
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS buildings (
    id            VARCHAR(16)  NOT NULL PRIMARY KEY,          -- '2F', '4F', 'FDA', 'TTM' or custom
    name          VARCHAR(200) NOT NULL,
    name_en       VARCHAR(200) NOT NULL DEFAULT '',
    short_name    VARCHAR(100) NOT NULL,
    short_name_en VARCHAR(100) NOT NULL DEFAULT '',
    floors        TINYINT UNSIGNED NOT NULL,
    width         DECIMAL(6,2) NOT NULL,                       -- footprint (m)
    depth         DECIMAL(6,2) NOT NULL,
    center_x      DECIMAL(6,2) NOT NULL DEFAULT 0.00,          -- 3D scene center X (m)
    center_z      DECIMAL(6,2) NOT NULL DEFAULT 0.00,          -- 3D scene center Z (m)
    rot_y         DECIMAL(5,2) NOT NULL DEFAULT 0.00,          -- 3D scene Y rotation (radians)
    color         VARCHAR(16)  NOT NULL DEFAULT '#10b981',     -- building accent color
    sort_order    SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Physical rooms. id is printed in QR codes (?room=<id>) so it must never change.
CREATE TABLE IF NOT EXISTS rooms (
    id          VARCHAR(16)  NOT NULL PRIMARY KEY,
    building_id VARCHAR(16)  NOT NULL,
    floor       TINYINT UNSIGNED NOT NULL,
    room_no     VARCHAR(20)  NOT NULL,
    label       VARCHAR(200) NOT NULL DEFAULT '',            -- shown when no department is assigned
    lx DECIMAL(6,2) NOT NULL, lz DECIMAL(6,2) NOT NULL,      -- metres, local to building center
    w  DECIMAL(6,2) NOT NULL, d  DECIMAL(6,2) NOT NULL,
    CONSTRAINT fk_rooms_building FOREIGN KEY (building_id) REFERENCES buildings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Organisational units. Independent of rooms so a move only changes room_assignments.
CREATE TABLE IF NOT EXISTS departments (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    head_title  VARCHAR(255) NOT NULL DEFAULT '',            -- position title; personal names only with consent
    phone_ext   VARCHAR(50)  NOT NULL DEFAULT '',
    description TEXT         NOT NULL,
    type        ENUM('service','admin','academic','meeting','executive','digital') NOT NULL DEFAULT 'admin',
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One department per room at a time. valid_to NULL = current.
CREATE TABLE IF NOT EXISTS room_assignments (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    room_id       VARCHAR(16)  NOT NULL,
    department_id INT UNSIGNED NOT NULL,
    valid_from    DATE NOT NULL,
    valid_to      DATE NULL,
    CONSTRAINT fk_ra_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_ra_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    INDEX idx_ra_current (room_id, valid_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- What visitors come for ("ต่อใบอนุญาตร้านยา") -> department. Used by public search.
CREATE TABLE IF NOT EXISTS services (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    keyword       VARCHAR(255) NOT NULL,
    department_id INT UNSIGNED NOT NULL,
    CONSTRAINT fk_svc_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wayfinding graph (world coordinates, metres).
CREATE TABLE IF NOT EXISTS nav_nodes (
    id          VARCHAR(32) NOT NULL PRIMARY KEY,
    building_id VARCHAR(16) NULL,
    floor       TINYINT UNSIGNED NOT NULL DEFAULT 1,
    x DECIMAL(6,2) NOT NULL, y DECIMAL(6,2) NOT NULL, z DECIMAL(6,2) NOT NULL,
    kind        ENUM('entrance','corridor','stair','bridge','gate','ramp','room','elevator') NOT NULL,
    label       VARCHAR(100) NOT NULL DEFAULT '',
    room_id     VARCHAR(16) NULL,                            -- kind='room': door of this room
    CONSTRAINT fk_nn_room FOREIGN KEY (room_id) REFERENCES rooms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nav_edges (
    from_id    VARCHAR(32) NOT NULL,
    to_id      VARCHAR(32) NOT NULL,
    is_accessible TINYINT(1) NOT NULL DEFAULT 1,               -- 0 = stairs only, excluded from wheelchair routes
    PRIMARY KEY (from_id, to_id),
    CONSTRAINT fk_ne_from FOREIGN KEY (from_id) REFERENCES nav_nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_ne_to   FOREIGN KEY (to_id)   REFERENCES nav_nodes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(64)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('admin','editor') NOT NULL DEFAULT 'editor',
    department_id INT UNSIGNED NULL,                         -- editor may only edit this department
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    failed_logins SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    locked_until  DATETIME NULL,
    last_login_at DATETIME NULL,
    CONSTRAINT fk_users_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NULL,
    username   VARCHAR(64) NOT NULL,
    action     VARCHAR(50) NOT NULL,                         -- e.g. department.update
    entity     VARCHAR(50) NOT NULL,
    entity_id  VARCHAR(50) NOT NULL,
    before_json JSON NULL,
    after_json  JSON NULL,
    ip         VARCHAR(45) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bumped on every admin write; snapshot ETag derives from it.
CREATE TABLE IF NOT EXISTS data_version (
    id      TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    version BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB;
INSERT IGNORE INTO data_version (id, version) VALUES (1, 1);
