-- 005: Photo management and upload support
CREATE TABLE IF NOT EXISTS photos (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    photo_key     VARCHAR(64)  NOT NULL UNIQUE,
    title         VARCHAR(255) NOT NULL,
    title_en      VARCHAR(255) NOT NULL DEFAULT '',
    category      ENUM('spot', 'personnel', 'satellite', 'system', 'room', 'other') NOT NULL DEFAULT 'spot',
    file_name     VARCHAR(255) NOT NULL,
    file_size     INT UNSIGNED NOT NULL DEFAULT 0,
    mime_type     VARCHAR(64)  NOT NULL DEFAULT 'image/jpeg',
    width         INT UNSIGNED NOT NULL DEFAULT 0,
    height        INT UNSIGNED NOT NULL DEFAULT 0,
    room_id       VARCHAR(16)  NULL,
    spot_index    TINYINT UNSIGNED NULL,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_photos_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    INDEX idx_photos_category (category),
    INDEX idx_photos_room (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO photos (photo_key, title, title_en, category, file_name, room_id, spot_index) VALUES
('logo-moph', 'ตรากระทรวงสาธารณสุข', 'Ministry of Public Health Logo', 'system', 'logo MOPH.png', NULL, NULL),
('dr-narong', 'นพ.ณรงค์ จันทร์แก้ว (นพ.สสจ.มุกดาหาร)', 'Dr. Narong Chankaeo', 'personnel', 'dr-Narong3.png', 'R431', NULL),
('satellite-4f', 'ภาพถ่ายดาวเทียมบริเวณสำนักงาน', 'Satellite Campus Map', 'satellite', 'satellite-4f.jpg', NULL, NULL),
('spot_0', 'จุดที่ 1: ตึก 4F เต็มตึก & ใต้ถุนจอดรถตู้', 'Spot 1: Building 4F facade', 'spot', '20854.jpg', 'R411', 0),
('spot_1', 'จุดที่ 2: ป้าย OSSC & ประตูรั้วสำนักงาน', 'Spot 2: OSSC Sign & Gate', 'spot', '20863.jpg', 'R411', 1),
('spot_2', 'จุดที่ 3: ซุ้ม OSSC & รั้วดื่มไม่ขับ', 'Spot 3: OSSC Canopy', 'spot', '20855.jpg', 'R411', 2),
('spot_3', 'จุดที่ 4: สะพานทางเชื่อมชั้น 2 & ป้ายเลี้ยว', 'Spot 4: Floor 2 Skybridge', 'spot', '20847.jpg', 'R222', 3),
('spot_4', 'จุดที่ 5: เสาเขียวตึก 4F & ทางเดินกลาง', 'Spot 5: 4F Green Columns', 'spot', '20858.jpg', 'R412', 4),
('spot_5', 'จุดที่ 6: ทางออกหลัง & ขวัญศิริฯ', 'Spot 6: Rear Exit Road', 'spot', '20846.jpg', NULL, 5),
('spot_6', 'จุดที่ 7: หน้าต่าง 3 ช่อง & ประตูขาว', 'Spot 7: 4F Side Windows', 'spot', '20261109_163722.jpg', 'R412', 6),
('spot_7', 'จุดที่ 8: คลินิกบริการแพทย์แผนไทย', 'Spot 8: Thai Medicine Clinic', 'spot', '20261109_163704.jpg', 'RTTM1', 7),
('spot_8', 'จุดที่ 9: โฉมหน้าตึกหน้า 2 ชั้น & ซุ้มมุข', 'Spot 9: Front Building 2F Facade', 'spot', 'f122.jpg', 'R211', 8),
('spot_9', 'จุดที่ 10: หอพระ & ลานจอดรถ', 'Spot 10: Shrine & Parking', 'spot', 'f12.jpg', NULL, 9),
('spot_10', 'จุดที่ 11: ปีกอาคาร & ม้านั่งสวน', 'Spot 11: West Wing & Garden Benches', 'spot', 'f1.jpg', 'R213', 10)
ON DUPLICATE KEY UPDATE title = VALUES(title), title_en = VALUES(title_en), file_name = VALUES(file_name);

UPDATE data_version SET version = version + 1 WHERE id = 1;
