-- 002: English labels for wayfinding nodes (shown in route steps when language = EN).
ALTER TABLE nav_nodes ADD COLUMN label_en VARCHAR(100) NOT NULL DEFAULT '' AFTER label;

UPDATE nav_nodes SET label_en = CASE id
    WHEN 'ent_front'    THEN 'the main entrance'
    WHEN 'yard_front'   THEN 'the front yard'
    WHEN 'drive_mid_w'  THEN 'the central courtyard'
    WHEN 'drive_mid_c'  THEN 'the area under the floor-2 bridge'
    WHEN 'drive_mid_e'  THEN 'the east courtyard'
    WHEN 'east_drive'   THEN 'the east driveway'
    WHEN 'yard_back'    THEN 'the yard behind the rear building'
    WHEN 'east_drive_n' THEN 'the east driveway (north)'
    WHEN 'gate_back'    THEN 'the back gate (Chaphubal Rd)'
    WHEN 'b2_f1_n'      THEN 'the back door of the front building'
    WHEN 'b4_f1_bk'     THEN 'the OSSC back door (white canopy)'
    WHEN 'fda_front'    THEN 'the OSSC annex entrance'
    WHEN 'ttm_door'     THEN 'the Thai medicine clinic entrance'
    WHEN 'bridge_s'     THEN 'the floor-2 bridge (front side)'
    WHEN 'bridge_n'     THEN 'the floor-2 bridge (rear side)'
    ELSE label_en END;
