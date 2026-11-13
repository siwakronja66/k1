-- 004: Add elevator nodes and edges to Building 4F for multi-floor wayfinding and wheelchair accessibility
ALTER TABLE nav_nodes MODIFY COLUMN kind ENUM('entrance','corridor','stair','bridge','gate','ramp','room','elevator') NOT NULL;

INSERT INTO nav_nodes (id, building_id, floor, x, y, z, kind, label, label_en) VALUES
('b4_f1_lift', '4F', 1, 7.5, 0.6, -3.6, 'elevator', 'ลิฟต์ตึกหลัง ชั้น 1', 'rear building elevator (Floor 1)'),
('b4_f2_lift', '4F', 2, 7.5, 4.2, -3.6, 'elevator', 'ลิฟต์ตึกหลัง ชั้น 2', 'rear building elevator (Floor 2)'),
('b4_f3_lift', '4F', 3, 7.5, 7.8, -3.6, 'elevator', 'ลิฟต์ตึกหลัง ชั้น 3', 'rear building elevator (Floor 3)'),
('b4_f4_lift', '4F', 4, 7.5, 11.4, -3.6, 'elevator', 'ลิฟต์ตึกหลัง ชั้น 4', 'rear building elevator (Floor 4)')
ON DUPLICATE KEY UPDATE label = VALUES(label), label_en = VALUES(label_en);

INSERT INTO nav_edges (from_id, to_id, is_accessible) VALUES
('b4_f1_e', 'b4_f1_lift', 1),
('b4_f2_e', 'b4_f2_lift', 1),
('b4_f3_e', 'b4_f3_lift', 1),
('b4_f4_e', 'b4_f4_lift', 1),
('b4_f1_lift', 'b4_f2_lift', 1),
('b4_f2_lift', 'b4_f3_lift', 1),
('b4_f3_lift', 'b4_f4_lift', 1)
ON DUPLICATE KEY UPDATE is_accessible = 1;

UPDATE data_version SET version = version + 1 WHERE id = 1;
