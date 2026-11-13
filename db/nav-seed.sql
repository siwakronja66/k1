-- Wayfinding graph (world coords, metres; y = walking height: F1 0.6, F2 4.2, F3 7.8, F4 11.4).
-- APPROXIMATE: derived from the 3D model, not surveyed. Stair and door positions must be checked on site.
-- Room door nodes are NOT stored: the client links each room to the nearest node on its building/floor,
-- so moving a room in admin never breaks routing.
-- accessible = 0 on stairs: no lift in the compound, so wheelchair routes reach floor 1 only.
SET NAMES utf8mb4;

INSERT INTO nav_nodes (id, building_id, floor, x, y, z, kind, label) VALUES
-- outdoor / compound
('ent_front',   NULL, 1,  -8.5, 0.6,  17.0, 'entrance', 'ทางเข้าหน้าสำนักงาน'),
('yard_front',  NULL, 1,  -8.5, 0.6,  14.5, 'corridor', 'ลานหน้าตึก 2 ชั้น'),
('drive_mid_w', NULL, 1,  -8.0, 0.6,   0.0, 'corridor', 'ลานกลางระหว่างอาคาร'),
('drive_mid_c', NULL, 1,  -2.2, 0.6,   0.0, 'corridor', 'ใต้ทางเชื่อมชั้น 2'),
('drive_mid_e', NULL, 1,  10.0, 0.6,   0.0, 'corridor', 'ลานกลางฝั่งตะวันออก'),
('east_drive',  NULL, 1,  13.5, 0.6,  -8.0, 'corridor', 'ถนนข้างฝั่งตะวันออก'),
('yard_back',   NULL, 1,   8.0, 0.6, -15.0, 'corridor', 'ลานหลังตึก 4 ชั้น'),
('east_drive_n',NULL, 1,  13.5, 0.6, -15.0, 'corridor', 'ถนนข้างฝั่งตะวันออก (เหนือ)'),
('gate_back',   NULL, 1,  13.5, 0.6, -23.5, 'gate',     'ประตูหลัง ถนนชาภูบาล'),
-- front building (2F)
('b2_f1_w', '2F', 1,  -8.5, 0.6, 12.6, 'corridor', 'ตึกหน้า ชั้น 1 ทางเดินฝั่งตะวันตก'),
('b2_f1_c', '2F', 1,  -2.2, 0.6, 12.6, 'corridor', 'ตึกหน้า ชั้น 1 ทางเดินกลาง'),
('b2_f1_e', '2F', 1,   7.5, 0.6, 12.6, 'corridor', 'ตึกหน้า ชั้น 1 ทางเดินฝั่งตะวันออก'),
('b2_f1_s', '2F', 1, -12.6, 0.6, 12.6, 'stair',    'บันไดตึกหน้า ชั้น 1'),
('b2_f1_n', '2F', 1,  -2.2, 0.6,  4.3, 'entrance', 'ประตูหลังตึกหน้า (ลานกลาง)'),
('b2_f2_w', '2F', 2,  -8.5, 4.2, 12.6, 'corridor', 'ตึกหน้า ชั้น 2 ทางเดินฝั่งตะวันตก'),
('b2_f2_c', '2F', 2,  -2.2, 4.2, 12.6, 'corridor', 'ตึกหน้า ชั้น 2 ทางเดินกลาง'),
('b2_f2_e', '2F', 2,   7.5, 4.2, 12.6, 'corridor', 'ตึกหน้า ชั้น 2 ทางเดินฝั่งตะวันออก'),
('b2_f2_s', '2F', 2, -12.6, 4.2, 12.6, 'stair',    'บันไดตึกหน้า ชั้น 2'),
-- skybridge (floor 2)
('bridge_s', NULL, 2, -2.2, 4.2,  3.9, 'bridge', 'ทางเชื่อมชั้น 2 (ฝั่งตึกหน้า)'),
('bridge_n', NULL, 2, -2.2, 4.2, -3.4, 'bridge', 'ทางเชื่อมชั้น 2 (ฝั่งตึกหลัง)'),
-- back building (4F)
('b4_f1_w',  '4F', 1, -10.0, 0.6,  -3.6, 'corridor', 'ตึกหลัง ชั้น 1 ฝั่งตะวันตก (ใต้ถุน)'),
('b4_f1_c',  '4F', 1,  -2.2, 0.6,  -3.6, 'corridor', 'ตึกหลัง ชั้น 1 กลาง'),
('b4_f1_e',  '4F', 1,   6.5, 0.6,  -3.6, 'corridor', 'ตึกหลัง ชั้น 1 ฝั่งตะวันออก'),
('b4_f1_bk', '4F', 1,   6.0, 0.6, -14.0, 'entrance', 'ประตูหลัง OSSC (กันสาดขาว)'),
('b4_f1_s',  '4F', 1, -14.5, 0.6,  -3.6, 'stair',    'บันไดตึกหลัง ชั้น 1'),
('b4_f2_w',  '4F', 2, -10.0, 4.2,  -3.6, 'corridor', 'ตึกหลัง ชั้น 2 ฝั่งตะวันตก'),
('b4_f2_c',  '4F', 2,  -2.2, 4.2,  -3.6, 'corridor', 'ตึกหลัง ชั้น 2 กลาง'),
('b4_f2_e',  '4F', 2,   6.5, 4.2,  -3.6, 'corridor', 'ตึกหลัง ชั้น 2 ฝั่งตะวันออก'),
('b4_f2_s',  '4F', 2, -14.5, 4.2,  -3.6, 'stair',    'บันไดตึกหลัง ชั้น 2'),
('b4_f3_w',  '4F', 3, -10.0, 7.8,  -3.6, 'corridor', 'ตึกหลัง ชั้น 3 ฝั่งตะวันตก'),
('b4_f3_c',  '4F', 3,  -2.2, 7.8,  -3.6, 'corridor', 'ตึกหลัง ชั้น 3 กลาง'),
('b4_f3_e',  '4F', 3,   6.5, 7.8,  -3.6, 'corridor', 'ตึกหลัง ชั้น 3 ฝั่งตะวันออก'),
('b4_f3_s',  '4F', 3, -14.5, 7.8,  -3.6, 'stair',    'บันไดตึกหลัง ชั้น 3'),
('b4_f4_w',  '4F', 4, -10.0, 11.4, -3.6, 'corridor', 'ตึกหลัง ชั้น 4 ฝั่งตะวันตก'),
('b4_f4_c',  '4F', 4,  -2.2, 11.4, -3.6, 'corridor', 'ตึกหลัง ชั้น 4 กลาง'),
('b4_f4_e',  '4F', 4,   6.5, 11.4, -3.6, 'corridor', 'ตึกหลัง ชั้น 4 ฝั่งตะวันออก'),
('b4_f4_s',  '4F', 4, -14.5, 11.4, -3.6, 'stair',    'บันไดตึกหลัง ชั้น 4'),
-- elevator (Building 4F, serves all 4 floors, accessible for wheelchairs)
('b4_f1_lift', '4F', 1, 7.5, 0.6, -3.6, 'elevator', 'ลิฟต์ตึกหลัง ชั้น 1'),
('b4_f2_lift', '4F', 2, 7.5, 4.2, -3.6, 'elevator', 'ลิฟต์ตึกหลัง ชั้น 2'),
('b4_f3_lift', '4F', 3, 7.5, 7.8, -3.6, 'elevator', 'ลิฟต์ตึกหลัง ชั้น 3'),
('b4_f4_lift', '4F', 4, 7.5, 11.4, -3.6, 'elevator', 'ลิฟต์ตึกหลัง ชั้น 4'),
-- OSSC annex + Thai traditional medicine clinic
('fda_front', 'FDA', 1, -3.5, 0.6, -16.0, 'entrance', 'หน้าศูนย์ OSSC'),
('ttm_door',  'TTM', 1, 15.8, 0.6, -11.5, 'entrance', 'ทางเข้าคลินิกแพทย์แผนไทย');

INSERT INTO nav_edges (from_id, to_id, is_accessible) VALUES
-- compound
('ent_front','yard_front',1), ('yard_front','b2_f1_w',1),
('drive_mid_w','drive_mid_c',1), ('drive_mid_c','drive_mid_e',1), ('drive_mid_e','east_drive',1),
('east_drive','east_drive_n',1), ('east_drive_n','gate_back',1), ('east_drive_n','yard_back',1),
('yard_back','fda_front',1), ('yard_back','b4_f1_bk',1), ('east_drive','ttm_door',1),
-- front building
('b2_f1_s','b2_f1_w',1), ('b2_f1_w','b2_f1_c',1), ('b2_f1_c','b2_f1_e',1), ('b2_f1_c','b2_f1_n',1), ('b2_f1_n','drive_mid_c',1),
('b2_f2_s','b2_f2_w',1), ('b2_f2_w','b2_f2_c',1), ('b2_f2_c','b2_f2_e',1),
('b2_f1_s','b2_f2_s',0),
('b2_f2_c','bridge_s',1), ('bridge_s','bridge_n',1), ('bridge_n','b4_f2_c',1),
-- back building
('drive_mid_w','b4_f1_w',1), ('drive_mid_c','b4_f1_c',1), ('drive_mid_e','b4_f1_e',1),
('b4_f1_s','b4_f1_w',1), ('b4_f1_w','b4_f1_c',1), ('b4_f1_c','b4_f1_e',1),
('b4_f2_s','b4_f2_w',1), ('b4_f2_w','b4_f2_c',1), ('b4_f2_c','b4_f2_e',1),
('b4_f3_s','b4_f3_w',1), ('b4_f3_w','b4_f3_c',1), ('b4_f3_c','b4_f3_e',1),
('b4_f4_s','b4_f4_w',1), ('b4_f4_w','b4_f4_c',1), ('b4_f4_c','b4_f4_e',1),
('b4_f1_s','b4_f2_s',0), ('b4_f2_s','b4_f3_s',0), ('b4_f3_s','b4_f4_s',0),
-- elevator connections (accessible: 1)
('b4_f1_e','b4_f1_lift',1), ('b4_f2_e','b4_f2_lift',1), ('b4_f3_e','b4_f3_lift',1), ('b4_f4_e','b4_f4_lift',1),
('b4_f1_lift','b4_f2_lift',1), ('b4_f2_lift','b4_f3_lift',1), ('b4_f3_lift','b4_f4_lift',1);
