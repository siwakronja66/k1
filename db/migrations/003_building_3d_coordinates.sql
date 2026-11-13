-- 003: 3D coordinates, rotation and color for dynamic building rendering and admin management
ALTER TABLE buildings
    ADD COLUMN center_x   DECIMAL(6,2) NOT NULL DEFAULT 0.00 AFTER depth,
    ADD COLUMN center_z   DECIMAL(6,2) NOT NULL DEFAULT 0.00 AFTER center_x,
    ADD COLUMN rot_y      DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER center_z,
    ADD COLUMN color      VARCHAR(16)  NOT NULL DEFAULT '#10b981' AFTER rot_y;

UPDATE buildings SET center_x = -1.50, center_z = 8.50,   rot_y = 0.00,  color = '#0284c7' WHERE id = '2F';
UPDATE buildings SET center_x = -3.20, center_z = -8.20,  rot_y = 0.00,  color = '#10b981' WHERE id = '4F';
UPDATE buildings SET center_x = -3.50, center_z = -19.50, rot_y = 0.00,  color = '#f59e0b' WHERE id = 'FDA';
UPDATE buildings SET center_x = 19.20, center_z = -13.50, rot_y = -0.32, color = '#2563eb' WHERE id = 'TTM';
