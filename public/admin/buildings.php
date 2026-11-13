<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();
if (!is_admin($user)) {
    throw new HttpError(403, 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการอาคารได้');
}

if (is_post()) {
    $action = (string)($_POST['action'] ?? '');
    $id = trim((string)($_POST['id'] ?? ''));
    handle_post(function () use ($user, $action, $id) {
        switch ($action) {
            case 'create':
                $newId = building_create($user, $_POST);
                return "เพิ่มอาคาร '$newId' สำเร็จ";
            case 'update':
                building_update($user, $id, $_POST);
                return "บันทึกการแก้ไขอาคาร '$id' แล้ว";
            case 'move':
                $before = building_row($id) ?? throw new HttpError(404, 'ไม่พบอาคาร');
                building_update($user, $id, array_merge($before, [
                    'center_x' => (float)$_POST['center_x'],
                    'center_z' => (float)$_POST['center_z'],
                    'width'    => (float)$_POST['width'],
                    'depth'    => (float)$_POST['depth'],
                    'rot_y'    => isset($_POST['rot_y']) ? (float)$_POST['rot_y'] : (float)($before['rot_y'] ?? 0.0)
                ]));
                return "บันทึกตำแหน่ง ขนาด และมุมหมุนของอาคาร '$id' เรียบร้อย";
            case 'delete':
                building_delete($user, $id);
                return "ลบอาคาร '$id' เรียบร้อย";
        }
        throw new HttpError(400, 'คำสั่งไม่ถูกต้อง');
    }, 'buildings.php');
}

$buildings = building_list();
$roomCounts = db()->query('SELECT building_id, COUNT(*) AS cnt FROM rooms GROUP BY building_id')->fetchAll(PDO::FETCH_KEY_PAIR);

$editId = isset($_GET['edit']) ? trim((string)$_GET['edit']) : null;
$creating = isset($_GET['new']);
$edit = null;
if ($editId !== null) {
    foreach ($buildings as $b) {
        if ($b['id'] === $editId) {
            $edit = $b;
            break;
        }
    }
}

/**
 * Shared SVG Campus Environment Renderer (100% mirrors the 3D scene & user circulation sketch)
 */
function render_site_plan_background_svg(bool $isForm = false): string {
    $p = $isForm ? 'form-' : 'site-';
    ob_start();
?>
    <!-- Defs: Markers & Patterns -->
    <defs>
        <marker id="<?= $p ?>arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#22c55e" />
        </marker>
        <marker id="<?= $p ?>arrow-yellow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#facc15" />
        </marker>
    </defs>

    <!-- 0. Base Compound Background Canvas -->
    <rect x="-35" y="-30" width="70" height="58" fill="#090d16"/>

    <!-- 1. Real Satellite Aerial Imagery Layer (Toggled via button / opacity slider) -->
    <image id="<?= $p ?>satellite-img"
           href="../assets/satellite-4f.jpg"
           x="-65" y="-55" width="130" height="110"
           preserveAspectRatio="none"
           opacity="0.65"
           class="transition-opacity duration-300 pointer-events-none" />

    <!-- 2. Grid lines every 5m & Axes -->
    <g id="<?= $p ?>grid-layer" opacity="0.32">
        <?php for ($gx = -30; $gx <= 30; $gx += 5): ?>
            <line x1="<?= $gx ?>" y1="-28" x2="<?= $gx ?>" y2="26" stroke="#334155" stroke-width="0.08" stroke-dasharray="0.3,0.3"/>
        <?php endfor; ?>
        <?php for ($gz = -25; $gz <= 25; $gz += 5): ?>
            <line x1="-33" y1="<?= $gz ?>" x2="33" y2="<?= $gz ?>" stroke="#334155" stroke-width="0.08" stroke-dasharray="0.3,0.3"/>
        <?php endfor; ?>
        <!-- Center Origin axes (0, 0) -->
        <line x1="-33" y1="0" x2="33" y2="0" stroke="#475569" stroke-width="0.14"/>
        <line x1="0" y1="-28" x2="0" y2="26" stroke="#475569" stroke-width="0.14"/>
    </g>

    <!-- 3. REAL CAMPUS ROAD NETWORK (Asphalt #1e293b, Edge lines #f8fafc, Centerlines #facc15) -->
    <g id="<?= $p ?>roads-layer">
        <!-- South Public Road (ถนนพิทักษ์พนมเขต) Z = 33.0 (edge at Z = 28.5) -->
        <rect x="-35" y="28.5" width="70" height="4.5" fill="#1e293b" opacity="0.95"/>
        <line x1="-35" y1="28.5" x2="35" y2="28.5" stroke="#f8fafc" stroke-width="0.14"/>

        <!-- North Public Road (ถนนชาภูบาล) Z = -25.5, width 7.5 -->
        <rect x="-35" y="-29.25" width="70" height="7.5" fill="#1e293b" opacity="0.95"/>
        <line x1="-35" y1="-25.5" x2="35" y2="-25.5" stroke="#facc15" stroke-width="0.14" stroke-dasharray="1.2,1.2"/>
        <line x1="-35" y1="-21.8" x2="35" y2="-21.8" stroke="#f8fafc" stroke-width="0.12"/>

        <!-- West Entrance Road (X = -17.0 to -10.0, Z = 22.0 to 28.5) -->
        <rect x="-17.0" y="22.0" width="7.0" height="6.5" fill="#1e293b" opacity="0.95"/>
        <line x1="-17.0" y1="22.0" x2="-17.0" y2="28.5" stroke="#f8fafc" stroke-width="0.14"/>
        <line x1="-10.0" y1="22.0" x2="-10.0" y2="28.5" stroke="#f8fafc" stroke-width="0.14"/>

        <!-- Front Driveway of Building 2F (Z = 14.8 to 22.0, X = -24.0 to 12.5) -->
        <rect x="-24.0" y="14.8" width="36.5" height="7.2" fill="#1e293b" opacity="0.95"/>
        <line x1="-24.0" y1="14.8" x2="12.5" y2="14.8" stroke="#f8fafc" stroke-width="0.14"/>
        <line x1="-24.0" y1="22.0" x2="-9.8" y2="22.0" stroke="#f8fafc" stroke-width="0.14"/>
        <line x1="6.5" y1="22.0" x2="12.5" y2="22.0" stroke="#f8fafc" stroke-width="0.14"/>
        <line x1="-24.0" y1="18.4" x2="12.5" y2="18.4" stroke="#facc15" stroke-width="0.14" stroke-dasharray="1.2,1.2"/>

        <!-- Zebra Pedestrian Crosswalk (X = -2.5 to 0.5, Z = 14.8 to 22.0) -->
        <g opacity="0.8">
            <?php for ($cz = 15.2; $cz <= 21.6; $cz += 1.0): ?>
                <rect x="-2.5" y="<?= $cz ?>" width="3.0" height="0.45" fill="#ffffff"/>
            <?php endfor; ?>
        </g>

        <!-- East Driveway & Dead-End Parking Lot (X = 6.6 to 13.4, Z = -19.5 to 22.0) -->
        <rect x="6.6" y="-19.5" width="6.8" height="41.5" fill="#1e293b" opacity="0.95"/>
        <line x1="13.4" y1="-19.5" x2="13.4" y2="22.0" stroke="#f8fafc" stroke-width="0.14"/>
        <!-- Dead-end red marker at north end of east drive -->
        <line x1="6.6" y1="-19.5" x2="13.4" y2="-19.5" stroke="#ef4444" stroke-width="0.25" stroke-dasharray="0.6,0.3"/>

        <!-- Yellow Parking Bays on East Lot (X: 6.6 to 9.8, Z: -2.0 to -19.5) -->
        <line x1="9.8" y1="-2.0" x2="9.8" y2="-19.5" stroke="#facc15" stroke-width="0.12"/>
        <?php foreach ([-2.0, -6.5, -11.0, -15.5, -19.5] as $py): ?>
            <line x1="6.6" y1="<?= $py ?>" x2="9.8" y2="<?= $py ?>" stroke="#facc15" stroke-width="0.12"/>
        <?php endforeach; ?>

        <!-- Courtyard Road under Skybridge (Z = -4.0 to 4.0, X = -10.0 to 10.0) -->
        <rect x="-10.0" y="-4.0" width="20.0" height="8.0" fill="#1e293b" opacity="0.95"/>
        <line x1="-10.0" y1="4.0" x2="6.6" y2="4.0" stroke="#64748b" stroke-width="0.08" stroke-dasharray="0.4,0.4"/>
        <line x1="-10.0" y1="-4.0" x2="6.6" y2="-4.0" stroke="#64748b" stroke-width="0.08" stroke-dasharray="0.4,0.4"/>

        <!-- Drive-Through Corridor under Building 4F (X = -11.6 to -4.4, Z = -22.0 to -4.0) -->
        <rect x="-11.6" y="-22.0" width="7.2" height="18.0" fill="#0f172a" opacity="0.98"/>
        <!-- Road strip through underbelly -->
        <rect x="-11.0" y="-22.0" width="6.0" height="18.0" fill="#1e293b" opacity="0.95"/>
        <line x1="-11.0" y1="-22.0" x2="-11.0" y2="-4.0" stroke="#f8fafc" stroke-width="0.12"/>
        <line x1="-5.0" y1="-22.0" x2="-5.0" y2="-4.0" stroke="#f8fafc" stroke-width="0.12"/>
        <!-- Stop line before entering ถนนชาภูบาล -->
        <line x1="-11.0" y1="-21.8" x2="-5.0" y2="-21.8" stroke="#f8fafc" stroke-width="0.25"/>
    </g>

    <!-- 4. RED-WHITE CURB ISLAND & LAWN (X: -9.8 to 6.5, Z: 22.0 to 28.5) -->
    <g id="<?= $p ?>lawn-curb-island">
        <!-- Lawn Area -->
        <rect x="-9.8" y="22.0" width="16.3" height="6.5" rx="0.4" fill="#14532d" fill-opacity="0.85" stroke="#f8fafc" stroke-width="0.1"/>
        <!-- Red-White striped border curb -->
        <rect x="-9.8" y="22.0" width="16.3" height="6.5" rx="0.4" fill="none" stroke="#dc2626" stroke-width="0.25" stroke-dasharray="1.2,1.2"/>
        <!-- Flagpole (🚩 เสาธงชาติ) -->
        <circle cx="-1.6" cy="25.2" r="0.6" fill="#facc15" stroke="#000" stroke-width="0.08"/>
        <text x="-1.6" y="25.5" font-size="0.6" fill="#000" font-weight="bold" text-anchor="middle">🚩</text>
        <text x="-1.6" y="26.8" font-size="0.6" fill="#facc15" font-weight="bold" text-anchor="middle">เสาธงชาติ</text>
    </g>

    <!-- 5. SKYBRIDGE 2F-4F (5.2m wide, X: -4.9 to 0.3, Z: -4.0 to 3.4) -->
    <g id="<?= $p ?>skybridge-layer">
        <rect x="-4.9" y="-4.0" width="5.2" height="7.4" rx="0.3"
              fill="#047857" fill-opacity="0.35" stroke="#10b981" stroke-width="0.14" stroke-dasharray="0.6,0.3"/>
        <text x="-2.3" y="0.2" font-size="0.75" fill="#6ee7b7" font-weight="bold" text-anchor="middle">ทางเชื่อมชั้น 2</text>
        <text x="-2.3" y="1.2" font-size="0.5" fill="#a7f3d0" text-anchor="middle">(กว้าง 5.2 ม. รถลอดผ่านได้)</text>
    </g>

    <!-- 6. RED PERIMETER FENCES & GATES (เส้นสีแดงตามภาพสเก็ตช์ของผู้ใช้) -->
    <g id="<?= $p ?>fences-layer">
        <!-- West Perimeter Fence (X = -24.5, Z: -21.8 to 28.5) -->
        <line x1="-24.5" y1="-21.8" x2="-24.5" y2="28.5" stroke="#ef4444" stroke-width="0.3" stroke-linecap="round"/>
        <text x="-25.0" y="3.0" font-size="0.65" fill="#f87171" font-weight="bold" text-anchor="middle" transform="rotate(-90 -25.0 3.0)">รั้วทิศตะวันตก</text>

        <!-- North Perimeter Fence (Z = -21.8, X: -24.5 to 24.5, with North Exit Gate at X: -11.5 to -4.5) -->
        <line x1="-24.5" y1="-21.8" x2="-11.5" y2="-21.8" stroke="#ef4444" stroke-width="0.3" stroke-linecap="round"/>
        <!-- North Gate Opening (ขับลอดใต้ตึก 4 ชั้น ทะลุออก ถ.ชาภูบาล) -->
        <line x1="-11.5" y1="-21.8" x2="-4.5" y2="-21.8" stroke="#22c55e" stroke-width="0.25" stroke-dasharray="0.5,0.4"/>
        <text x="-8.0" y="-22.6" font-size="0.75" fill="#4ade80" font-weight="bold" text-anchor="middle">ประตูออก ถ.ชาภูบาล ▶</text>
        <!-- East side of North Fence is 100% CLOSED (ลานจอดรถด้านตะวันออกเป็นทางตัน) -->
        <line x1="-4.5" y1="-21.8" x2="24.5" y2="-21.8" stroke="#ef4444" stroke-width="0.3" stroke-linecap="round"/>

        <!-- South Perimeter Fence (Z = 28.5, with SW Entrance Gate at X: -17.0 to -10.0) -->
        <line x1="-24.5" y1="28.5" x2="-17.0" y2="28.5" stroke="#ef4444" stroke-width="0.3" stroke-linecap="round"/>
        <!-- Main SW Entrance Gate Opening -->
        <line x1="-17.0" y1="28.5" x2="-10.0" y2="28.5" stroke="#22c55e" stroke-width="0.25" stroke-dasharray="0.5,0.4"/>
        <text x="-13.5" y="29.7" font-size="0.75" fill="#4ade80" font-weight="bold" text-anchor="middle">▲ ทางเข้าหลัก สสจ.</text>
        <line x1="-10.0" y1="28.5" x2="24.5" y2="28.5" stroke="#ef4444" stroke-width="0.3" stroke-linecap="round"/>

        <!-- East Boundary (X = 24.5) -->
        <line x1="24.5" y1="-21.8" x2="24.5" y2="28.5" stroke="#ef4444" stroke-width="0.3" stroke-dasharray="0.8,0.4"/>
    </g>

    <!-- 7. GREEN CIRCULATION ARROWS (ตามเส้นทางเดินรถจริงของผู้ใช้) -->
    <g id="<?= $p ?>circulation-layer" opacity="0.9">
        <!-- Arrow 1: Enter from SW Gate driving North into front apron -->
        <path d="M -13.5 27.5 L -13.5 19.5" stroke="#22c55e" stroke-width="0.35" fill="none" marker-end="url(#<?= $p ?>arrow-green)" stroke-dasharray="0.8,0.4"/>
        <!-- Arrow 2: Turn East along Front Road -->
        <path d="M -12.0 17.5 L 8.0 17.5" stroke="#22c55e" stroke-width="0.35" fill="none" marker-end="url(#<?= $p ?>arrow-green)" stroke-dasharray="0.8,0.4"/>
        <!-- Arrow 3: Turn North into East Parking driveway -->
        <path d="M 10.0 16.0 L 10.0 3.0" stroke="#22c55e" stroke-width="0.35" fill="none" marker-end="url(#<?= $p ?>arrow-green)" stroke-dasharray="0.8,0.4"/>
        <!-- Text for East Parking (ที่จอดรถ ทางตัน) -->
        <text x="10.0" y="-12.0" font-size="0.65" fill="#facc15" font-weight="bold" text-anchor="middle">ที่จอดรถ (ทางตัน)</text>
        <!-- Arrow 4: Turn West into Courtyard Road under Skybridge -->
        <path d="M 9.0 0.0 L -6.0 0.0" stroke="#22c55e" stroke-width="0.35" fill="none" marker-end="url(#<?= $p ?>arrow-green)" stroke-dasharray="0.8,0.4"/>
        <!-- Arrow 5: Turn North into Under-4F Driveway -->
        <path d="M -8.0 -2.0 L -8.0 -19.5" stroke="#22c55e" stroke-width="0.4" fill="none" marker-end="url(#<?= $p ?>arrow-green)" stroke-dasharray="0.8,0.4"/>
        <!-- Text for Under-4F Driveway -->
        <text x="-8.0" y="-12.0" font-size="0.65" fill="#4ade80" font-weight="bold" text-anchor="middle">ทางลอดใต้ตึก 4F</text>
    </g>

    <!-- 8. Boundary Landmark Labels -->
    <g id="<?= $p ?>landmarks-layer" pointer-events="none">
        <text x="0" y="-27.0" font-size="0.9" fill="#94a3b8" text-anchor="middle" font-weight="bold">▲ ทิศเหนือ (ถนนชาภูบาล)</text>
        <text x="0" y="32.0" font-size="0.9" fill="#94a3b8" text-anchor="middle" font-weight="bold">▼ ทิศใต้ (ถนนพิทักษ์พนมเขต)</text>
        <text x="-33.5" y="0" font-size="0.75" fill="#64748b" text-anchor="start" transform="rotate(-90 -33.5 0)">◀ ทิศตะวันตก</text>
        <text x="33.5" y="0" font-size="0.75" fill="#64748b" text-anchor="start" transform="rotate(90 33.5 0)">ทิศตะวันออก ▶</text>
    </g>
<?php
    return ob_get_clean();
}

page_start('จัดการอาคาร', 'buildings.php', $user, ['assets/site-plan.js']);

if ($edit || $creating):
    $b = $edit ?? [
        'id' => '',
        'name' => '',
        'name_en' => '',
        'short_name' => '',
        'short_name_en' => '',
        'floors' => 1,
        'width' => 16.0,
        'depth' => 10.0,
        'center_x' => 0.0,
        'center_z' => 0.0,
        'rot_y' => 0.0,
        'color' => '#10b981',
        'sort_order' => count($buildings)
    ];
    $actionType = $edit ? 'update' : 'create';
    $confirmMsg = $edit ? 'ยืนยันการบันทึกการแก้ไขอาคาร ' . $b['short_name'] . ' ใช่หรือไม่?' : 'ยืนยันการเพิ่มอาคารใหม่ลงในระบบและแผนผัง 3D ใช่หรือไม่?';
?>
<!-- Dual Column: Form (Left) & Live Placement Map (Right) -->
<div class="grid lg:grid-cols-12 gap-6 items-start">
    <!-- Left Column: Building Details Form -->
    <div class="lg:col-span-6 space-y-4">
        <form id="bld-edit-form" method="post" action="buildings.php"
              data-confirm="<?= e($confirmMsg) ?>"
              class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="<?= $actionType ?>">

            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                    <h1 class="font-heading font-bold text-xl text-white flex items-center gap-2">
                        <i class="fa-solid <?= $edit ? 'fa-pen-to-square text-sky-400' : 'fa-plus-circle text-emerald-400' ?>"></i>
                        <?= $edit ? 'แก้ไขข้อมูลอาคาร' : 'เพิ่มอาคารใหม่' ?>
                    </h1>
                    <p class="text-xs text-slate-400 mt-0.5">
                        <?= $edit ? 'ข้อมูลอาคารจะอัปเดตโมเดล 3D และผังห้องทันที' : 'กรอกข้อมูลและเลือกตำแหน่งวางอาคารบนแผนผังด้านขวา' ?>
                    </p>
                </div>
                <a href="buildings.php" class="px-3.5 py-1.5 rounded-xl text-xs font-heading font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition">
                    <i class="fa-solid fa-arrow-left"></i> กลับ
                </a>
            </div>

            <!-- รหัสและชื่อย่ออาคาร -->
            <div class="grid sm:grid-cols-3 gap-3">
                <label class="block text-sm text-slate-300">รหัสอาคาร (ID) <span class="text-rose-400">*</span>
                    <input id="input-bld-id" name="id" required maxlength="16" pattern="[A-Za-z0-9_-]{1,16}"
                           value="<?= e($b['id']) ?>" <?= $edit ? 'readonly class="mt-1 ' . INPUT_CLS . ' opacity-60 cursor-not-allowed"' : 'placeholder="เช่น BLD3, OSSC" class="mt-1 ' . INPUT_CLS . '"' ?>>
                    <span class="text-[10px] text-slate-400">ภาษาอังกฤษตัวพิมพ์ใหญ่ / ตัวเลข (แก้ไขไม่ได้หลังสร้าง)</span>
                </label>
                <label class="block text-sm text-slate-300 sm:col-span-2">ชื่อย่ออาคาร (Short Name) <span class="text-rose-400">*</span>
                    <input id="input-bld-short" name="short_name" required maxlength="100" value="<?= e($b['short_name']) ?>" placeholder="เช่น อาคาร 3, โรงอาหาร, อาคารพัสดุ" class="mt-1 <?= INPUT_CLS ?>">
                    <span class="text-[10px] text-slate-400">แสดงในป้ายหมุด 3D และเมนูเลือกอาคาร</span>
                </label>
            </div>

            <!-- ชื่อเต็มไทยและอังกฤษ -->
            <div class="grid sm:grid-cols-2 gap-3">
                <label class="block text-sm text-slate-300">ชื่อเต็มอาคาร (ไทย) <span class="text-rose-400">*</span>
                    <input name="name" required maxlength="200" value="<?= e($b['name']) ?>" placeholder="เช่น อาคารอำนวยการและสนับสนุนบริการ" class="mt-1 <?= INPUT_CLS ?>">
                </label>
                <label class="block text-sm text-slate-300">ชื่อย่อภาษาอังกฤษ (English Short Name)
                    <input name="short_name_en" maxlength="100" lang="en" value="<?= e($b['short_name_en']) ?>" placeholder="e.g. Building 3" class="mt-1 <?= INPUT_CLS ?>">
                </label>
            </div>

            <label class="block text-sm text-slate-300">ชื่อเต็มภาษาอังกฤษ (English Name)
                <input name="name_en" maxlength="200" lang="en" value="<?= e($b['name_en']) ?>" placeholder="e.g. Administration & Support Building" class="mt-1 <?= INPUT_CLS ?>">
            </label>

            <!-- ขนาดและความสูง -->
            <div class="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <div class="flex items-center justify-between">
                    <h2 class="text-xs font-heading font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-ruler-combined"></i> ขนาดและจำนวนชั้น (Dimensions)
                    </h2>
                    <span class="text-[11px] text-slate-400">กรอบบนแผนที่จะย่อ-ขยายตามทันที</span>
                </div>
                <div class="grid sm:grid-cols-3 gap-3">
                    <label class="block text-sm text-slate-300">จำนวนชั้น (Floors) <span class="text-rose-400">*</span>
                        <input id="input-bld-floors" type="number" name="floors" required min="1" max="10" value="<?= (int)$b['floors'] ?>" class="mt-1 <?= INPUT_CLS ?>">
                        <span class="text-[10px] text-slate-400">1 - 10 ชั้น</span>
                    </label>
                    <label class="block text-sm text-slate-300">ความกว้าง Width (เมตร) <span class="text-rose-400">*</span>
                        <input id="input-bld-w" type="number" step="0.5" name="width" required min="2" max="100" value="<?= (float)$b['width'] ?>" class="mt-1 <?= INPUT_CLS ?>">
                        <span class="text-[10px] text-slate-400">ขนาดแนวนอน (แกน X)</span>
                    </label>
                    <label class="block text-sm text-slate-300">ความลึก Depth (เมตร) <span class="text-rose-400">*</span>
                        <input id="input-bld-d" type="number" step="0.5" name="depth" required min="2" max="100" value="<?= (float)$b['depth'] ?>" class="mt-1 <?= INPUT_CLS ?>">
                        <span class="text-[10px] text-slate-400">ขนาดแนวตั้ง (แกน Z)</span>
                    </label>
                </div>
            </div>

            <!-- ตำแหน่ง 3D ในฉาก -->
            <div class="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <div class="flex items-center justify-between">
                    <h2 class="text-xs font-heading font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fa-solid fa-location-crosshairs"></i> ตำแหน่ง 3D บนแผนผัง (Coordinates)
                    </h2>
                    <span class="text-[11px] text-sky-300">คลิกหรือลากบนแผนที่เพื่อเปลี่ยนได้</span>
                </div>
                <div class="grid sm:grid-cols-3 gap-3">
                    <label class="block text-sm text-slate-300">พิกัด X กึ่งกลาง (Center X) <span class="text-rose-400">*</span>
                        <input id="input-bld-cx" type="number" step="0.1" name="center_x" required min="-100" max="100" value="<?= (float)$b['center_x'] ?>" class="mt-1 <?= INPUT_CLS ?>">
                        <span class="text-[10px] text-slate-400">- ซ้าย (ตก) / + ขวา (ออก)</span>
                    </label>
                    <label class="block text-sm text-slate-300">พิกัด Z กึ่งกลาง (Center Z) <span class="text-rose-400">*</span>
                        <input id="input-bld-cz" type="number" step="0.1" name="center_z" required min="-100" max="100" value="<?= (float)$b['center_z'] ?>" class="mt-1 <?= INPUT_CLS ?>">
                        <span class="text-[10px] text-slate-400">- หลัง (เหนือ) / + หน้า (ใต้)</span>
                    </label>
                    <div>
                        <label class="block text-sm text-slate-300">มุมหมุนอาคาร (Rot Y)
                            <input id="input-bld-rot" type="number" step="0.05" name="rot_y" required min="-6.28" max="6.28" value="<?= (float)$b['rot_y'] ?>" class="mt-1 <?= INPUT_CLS ?>">
                        </label>
                        <span class="text-[10px] text-slate-400 block mt-0.5" id="form-rot-deg-text">0.0° (หันหน้าทิศใต้)</span>
                    </div>
                </div>

                <!-- Quick Rotation Snaps for Form -->
                <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <span class="text-[11px] font-heading font-semibold text-slate-300 flex items-center gap-1">
                        <i class="fa-solid fa-rotate text-emerald-400"></i> หมุนองศาด่วน (คลิกหมุนตึก):
                    </span>
                    <div class="flex flex-wrap gap-1.5 text-xs">
                        <button type="button" class="btn-form-rot-snap px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" data-deg="0">0° (ใต้)</button>
                        <button type="button" class="btn-form-rot-snap px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" data-deg="90">90° (ตก)</button>
                        <button type="button" class="btn-form-rot-snap px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" data-deg="180">180° (เหนือ)</button>
                        <button type="button" class="btn-form-rot-snap px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" data-deg="270">270° (ออก)</button>
                        <span class="text-slate-600 self-center">|</span>
                        <button type="button" class="btn-form-rot-step px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700" data-delta="-15">⟲ -15°</button>
                        <button type="button" class="btn-form-rot-step px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700" data-delta="15">⟳ +15°</button>
                    </div>
                </div>

                <!-- Real-world GPS Coordinates (Google Maps Link & Lat/Lon) -->
                <div class="mt-2 pt-3 border-t border-slate-800/80 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-heading font-semibold text-emerald-400 flex items-center gap-1.5">
                            <i class="fa-solid fa-satellite-dish"></i> เชื่อมโยงพิกัดดาวเทียม GPS จริง (Google Maps):
                        </span>
                        <a id="btn-open-gmaps" href="https://www.google.com/maps/search/?api=1&query=16.541450,104.724250" target="_blank" rel="noopener noreferrer"
                           class="text-[11px] text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 transition">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> ดูตำแหน่งบน Google Maps
                        </a>
                    </div>
                    <div class="grid sm:grid-cols-2 gap-2 text-xs">
                        <label class="block text-slate-300">ละติจูดจริง (Latitude N)
                            <input id="input-gps-lat" type="number" step="0.000001" placeholder="16.541450" class="mt-1 <?= INPUT_CLS ?> font-mono text-emerald-300">
                        </label>
                        <label class="block text-slate-300">ลองจิจูดจริง (Longitude E)
                            <input id="input-gps-lon" type="number" step="0.000001" placeholder="104.724250" class="mt-1 <?= INPUT_CLS ?> font-mono text-emerald-300">
                        </label>
                    </div>
                    <div class="flex flex-wrap gap-2 pt-1">
                        <button type="button" id="btn-gps-to-xy" class="flex-1 py-2 px-3 rounded-lg text-xs font-heading font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition active:scale-95">
                            <i class="fa-solid fa-location-dot"></i> นำพิกัด GPS ไปวางตำแหน่งตึก
                        </button>
                        <button type="button" id="btn-xy-to-gps" class="py-2 px-3 rounded-lg text-xs font-heading bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95">
                            คำนวณ GPS จากตำแหน่งผัง
                        </button>
                    </div>
                    <p class="text-[10px] text-slate-400 leading-tight">
                        * พิกัดอ้างอิงศูนย์กลาง สสจ.มุกดาหาร: 16.541450° N, 104.724250° E (แปลง 1 เมตร = ~0.000009 องศา)
                    </p>
                </div>
                <div class="grid sm:grid-cols-2 gap-3 pt-1">
                    <label class="block text-sm text-slate-300">โทนสีอาคาร / สีขอบ (Color)
                        <div class="flex items-center gap-2 mt-1">
                            <input id="bld-color-picker" type="color" name="color_picker" value="<?= e($b['color']) ?>"
                                   class="w-10 h-10 rounded-lg cursor-pointer bg-slate-800 border border-slate-700 p-0.5">
                            <input id="color-input" type="text" name="color" required pattern="^#[0-9a-fA-F]{6}$"
                                   value="<?= e($b['color']) ?>" class="flex-1 <?= INPUT_CLS ?>">
                        </div>
                    </label>
                    <label class="block text-sm text-slate-300">ลำดับการแสดงผล (Sort Order)
                        <input type="number" name="sort_order" value="<?= (int)$b['sort_order'] ?>" class="mt-1 <?= INPUT_CLS ?>">
                        <span class="text-[10px] text-slate-400">ค่าน้อยอยู่ก่อน</span>
                    </label>
                </div>
            </div>

            <!-- Big Submit Button -->
            <div class="pt-2 flex flex-wrap items-center gap-3">
                <button type="submit" class="flex-1 py-3.5 px-6 rounded-xl font-heading font-bold text-base text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition active:scale-[0.98]">
                    <i class="fa-solid fa-floppy-disk text-lg"></i>
                    <span><?= $edit ? 'บันทึกการแก้ไขอาคาร' : 'บันทึกและสร้างอาคารใหม่' ?></span>
                </button>
                <a href="buildings.php" class="px-5 py-3.5 rounded-xl font-heading font-medium text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition">
                    ยกเลิก
                </a>
            </div>
        </form>
    </div>

    <!-- Right Column: Interactive Placement Map -->
    <div class="lg:col-span-6">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky top-4 shadow-xl space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 class="font-heading font-bold text-base text-white flex items-center gap-2">
                        <i class="fa-solid fa-map-location-dot text-emerald-400 text-lg"></i>
                        แผนที่จัดวางตำแหน่ง (คลิกหรือลากเพื่อวาง)
                    </h2>
                    <p class="text-xs text-slate-400 mt-0.5">
                        คลิกบนผัง หรือลากกล่องสีส้ม <span class="text-amber-400 font-semibold">📍 ตำแหน่งที่จะวาง</span> เพื่อจัดวางอาคาร
                    </p>
                </div>
                <!-- Layer Controls Toolbar -->
                <div class="flex items-center gap-2 text-xs">
                    <button type="button" id="btn-form-toggle-sat" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition" title="เปิด/ปิดภาพถ่ายดาวเทียม">
                        <i class="fa-solid fa-satellite text-emerald-400"></i> ดาวเทียม
                    </button>
                    <input type="range" id="input-form-sat-opacity" min="10" max="100" value="65" class="w-16 h-1.5 bg-slate-700 rounded-lg cursor-pointer" title="ปรับความโปร่งใสภาพดาวเทียม">
                </div>
            </div>

            <!-- SVG Map -->
            <div class="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2 flex items-center justify-center">
                <svg id="form-site-plan" viewBox="-35 -30 70 58" class="w-full h-auto max-h-[440px] touch-none select-none" role="img" aria-label="แผนที่จัดวางตำแหน่งอาคาร">
                    <?= render_site_plan_background_svg(true) ?>

                    <!-- Existing Buildings (Muted background references) -->
                    <?php foreach ($buildings as $ob):
                        if ($edit && $ob['id'] === $b['id']) continue; // skip the one currently being edited
                        $ow = (float)$ob['width'];
                        $od = (float)$ob['depth'];
                        $ocx = (float)$ob['center_x'];
                        $ocz = (float)$ob['center_z'];
                        $orot = (float)($ob['rot_y'] ?? 0.0);
                        $odeg = round(rad2deg($orot), 1);
                    ?>
                    <g opacity="0.45" transform="rotate(<?= $odeg ?>, <?= $ocx ?>, <?= $ocz ?>)">
                        <rect x="<?= $ocx - $ow / 2 ?>" y="<?= $ocz - $od / 2 ?>" width="<?= $ow ?>" height="<?= $od ?>" rx="0.4"
                              fill="#1e293b" stroke="#64748b" stroke-width="0.15"/>
                        <text x="<?= $ocx ?>" y="<?= $ocz + 0.3 ?>" font-size="0.75" fill="#94a3b8" text-anchor="middle" font-weight="bold"><?= e($ob['short_name']) ?></text>
                    </g>
                    <?php endforeach; ?>

                    <!-- Crosshair guide lines for Preview Building -->
                    <line id="preview-cross-x" x1="-33" y1="<?= (float)$b['center_z'] ?>" x2="33" y2="<?= (float)$b['center_z'] ?>" stroke="#f59e0b" stroke-width="0.1" stroke-dasharray="0.4,0.3" opacity="0.6"/>
                    <line id="preview-cross-z" x1="<?= (float)$b['center_x'] ?>" y1="-28" x2="<?= (float)$b['center_x'] ?>" y2="26" stroke="#f59e0b" stroke-width="0.1" stroke-dasharray="0.4,0.3" opacity="0.6"/>

                    <!-- The Building Being Created / Edited -->
                    <?php
                    $initRotDeg = round(rad2deg((float)$b['rot_y']), 1);
                    $initCx = (float)$b['center_x'];
                    $initCz = (float)$b['center_z'];
                    $initW = (float)$b['width'];
                    $initD = (float)$b['depth'];
                    $initBx = $initCx - $initW / 2;
                    $initBz = $initCz - $initD / 2;
                    ?>
                    <g id="preview-building" class="cursor-move"
                       transform="rotate(<?= $initRotDeg ?>, <?= $initCx ?>, <?= $initCz ?>)">
                        <rect id="preview-body"
                              x="<?= $initBx ?>"
                              y="<?= $initBz ?>"
                              width="<?= $initW ?>" height="<?= $initD ?>" rx="0.5"
                              fill="<?= e($b['color'] ?: '#f59e0b') ?>" fill-opacity="0.88" stroke="#fef08a" stroke-width="0.3"/>
                        <!-- Front Face Line & Arrow (indicates which way building faces) -->
                        <line id="preview-front-line" x1="<?= $initBx ?>" y1="<?= $initBz + $initD ?>" x2="<?= $initBx + $initW ?>" y2="<?= $initBz + $initD ?>"
                              stroke="#facc15" stroke-width="0.35"/>
                        <polygon id="preview-front-arrow"
                                 points="<?= $initCx - 0.6 ?>,<?= $initBz + $initD ?> <?= $initCx + 0.6 ?>,<?= $initBz + $initD ?> <?= $initCx ?>,<?= $initBz + $initD + 0.9 ?>"
                                 fill="#facc15"/>
                        <text id="preview-label" x="<?= $initCx ?>" y="<?= $initCz + 0.3 ?>"
                              font-size="0.85" font-weight="bold" fill="#ffffff" text-anchor="middle" pointer-events="none">
                            📍 ตำแหน่งอาคารนี้
                        </text>
                    </g>
                </svg>
            </div>

            <!-- Quick Placement Presets -->
            <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span class="text-xs font-heading font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                    <i class="fa-solid fa-wand-magic-sparkles text-amber-400"></i> จุดวางสำเร็จรูป (คลิกเพื่อย้ายตึกไปทันที):
                </span>
                <div class="grid grid-cols-2 gap-2 text-xs font-heading">
                    <button type="button" class="btn-preset py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-left transition border border-slate-700 flex items-center gap-1.5" data-x="0" data-z="0">
                        <span>🌿 ลานกลาง (0, 0)</span>
                    </button>
                    <button type="button" class="btn-preset py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-left transition border border-slate-700 flex items-center gap-1.5" data-x="-8.5" data-z="8.0">
                        <span>🏢 ลานหน้า (ตึก 2 ชั้น)</span>
                    </button>
                    <button type="button" class="btn-preset py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-left transition border border-slate-700 flex items-center gap-1.5" data-x="-3.0" data-z="-8.0">
                        <span>🏢 ตึก 4 ชั้น & ทางลอด</span>
                    </button>
                    <button type="button" class="btn-preset py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-left transition border border-slate-700 flex items-center gap-1.5" data-x="26.5" data-z="-14.5">
                        <span>🌿 ฝั่งตะวันออก (แพทย์แผนไทย)</span>
                    </button>
                </div>
            </div>

            <!-- Big Nudge Controls -->
            <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-heading font-semibold text-slate-300 flex items-center gap-1">
                        <i class="fa-solid fa-arrows-up-down-left-right text-sky-400"></i> ปุ่มเลื่อนตำแหน่งละเอียด:
                    </span>
                    <div class="flex gap-1" id="form-step-group">
                        <button type="button" class="btn-form-step px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700 font-medium" data-step="0.1">0.1 ม.</button>
                        <button type="button" class="btn-form-step px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700 font-medium" data-step="0.5">0.5 ม.</button>
                        <button type="button" class="btn-form-step px-2.5 py-1 rounded-lg text-xs bg-emerald-600 text-white font-bold border border-emerald-500" data-step="1.0">1.0 ม.</button>
                        <button type="button" class="btn-form-step px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700 font-medium" data-step="2.0">2.0 ม.</button>
                    </div>
                </div>

                <!-- Big D-Pad Arrow Buttons -->
                <div class="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
                    <div></div>
                    <button type="button" id="btn-form-up" class="h-12 rounded-xl bg-slate-800 hover:bg-sky-600 text-white font-bold text-sm flex flex-col items-center justify-center shadow transition border border-slate-700 active:scale-95" title="เลื่อนไปทางทิศเหนือ (ถ.ชาภูบาล)">
                        <i class="fa-solid fa-chevron-up text-base"></i>
                        <span class="text-[10px] text-slate-300 font-normal">เหนือ</span>
                    </button>
                    <div></div>

                    <button type="button" id="btn-form-left" class="h-12 rounded-xl bg-slate-800 hover:bg-sky-600 text-white font-bold text-sm flex flex-col items-center justify-center shadow transition border border-slate-700 active:scale-95" title="เลื่อนไปทางทิศตะวันตก (ซ้าย)">
                        <i class="fa-solid fa-chevron-left text-base"></i>
                        <span class="text-[10px] text-slate-300 font-normal">ตก</span>
                    </button>
                    <div class="h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                        <i class="fa-solid fa-compass text-lg"></i>
                    </div>
                    <button type="button" id="btn-form-right" class="h-12 rounded-xl bg-slate-800 hover:bg-sky-600 text-white font-bold text-sm flex flex-col items-center justify-center shadow transition border border-slate-700 active:scale-95" title="เลื่อนไปทางทิศตะวันออก (ขวา)">
                        <i class="fa-solid fa-chevron-right text-base"></i>
                        <span class="text-[10px] text-slate-300 font-normal">ออก</span>
                    </button>

                    <div></div>
                    <button type="button" id="btn-form-down" class="h-12 rounded-xl bg-slate-800 hover:bg-sky-600 text-white font-bold text-sm flex flex-col items-center justify-center shadow transition border border-slate-700 active:scale-95" title="เลื่อนไปทางทิศใต้ (หน้า สสจ.)">
                        <i class="fa-solid fa-chevron-down text-base"></i>
                        <span class="text-[10px] text-slate-300 font-normal">ใต้</span>
                    </button>
                    <div></div>
                </div>
                <p class="text-center text-[10px] text-slate-400">💡 ใช้ปุ่มลูกศร ↑ ↓ ← → บนคีย์บอร์ดเพื่อเลื่อนตำแหน่งได้</p>
            </div>
        </div>
    </div>
</div>

<?php else: ?>
<!-- ========================================================================= -->
<!-- MAIN PAGE: CAMPUS MAP & BUILDING MANAGEMENT                               -->
<!-- ========================================================================= -->
<div class="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div>
        <h1 class="font-heading font-bold text-xl text-white flex items-center gap-2">
            <i class="fa-solid fa-building text-emerald-400"></i>
            จัดการอาคารและแผนผัง 3D (<?= count($buildings) ?> อาคาร)
        </h1>
        <p class="text-xs text-slate-400 mt-0.5">
            ปรับย้ายตำแหน่ง หมุนองศา ขยายขนาด หรือสร้างอาคารใหม่ในแผนผังสำนักงานสาธารณสุขจังหวัดมุกดาหาร
        </p>
    </div>
    <div class="flex items-center gap-2">
        <a href="../index.html" target="_blank" class="py-2.5 px-4 rounded-xl font-heading font-medium text-xs text-sky-300 bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 flex items-center gap-1.5 transition">
            <i class="fa-solid fa-cube text-emerald-400"></i> เปิดดู 3D หน้าบ้าน <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
        <a href="buildings.php?new=1" class="py-2.5 px-5 rounded-xl font-heading font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition active:scale-[0.98]">
            <i class="fa-solid fa-plus-circle text-base"></i>
            <span>+ เพิ่มอาคารใหม่</span>
        </a>
    </div>
</div>

<!-- Simple 3-Step Guide Banner -->
<div class="grid sm:grid-cols-3 gap-2.5 mb-4 text-xs font-heading">
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
        <span class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/40">1</span>
        <span class="text-slate-300"><b>เลือกอาคาร</b> จากดรอปดาวน์ หรือคลิกที่ตึกบนผัง</span>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
        <span class="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 border border-sky-500/40">2</span>
        <span class="text-slate-300"><b>เลื่อน / หมุนองศา / ย่อ-ขยาย</b> ด้วยปุ่ม D-Pad หรือลาก</span>
    </div>
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
        <span class="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-amber-500/40">3</span>
        <span class="text-slate-300">กดปุ่มเขียว <b>"บันทึกตำแหน่งและขนาด"</b></span>
    </div>
</div>

<!-- Interactive 2D Campus Site Map & Quick Controls -->
<div class="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
    <!-- Big Building Selector Dropdown & Save Notice -->
    <div class="flex flex-wrap items-center gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 mb-4 shadow-inner">
        <label for="site-building-select" class="text-sm font-heading font-bold text-emerald-400 flex items-center gap-2 shrink-0">
            <i class="fa-solid fa-hand-pointer"></i> เลือกอาคารที่ต้องการปรับตำแหน่ง:
        </label>
        <select id="site-building-select" class="flex-1 min-w-[260px] bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm font-heading font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            <?php foreach ($buildings as $x): ?>
                <option value="<?= e($x['id']) ?>" data-x="<?= (float)$x['center_x'] ?>" data-z="<?= (float)$x['center_z'] ?>" data-w="<?= (float)$x['width'] ?>" data-d="<?= (float)$x['depth'] ?>" data-rot="<?= (float)($x['rot_y'] ?? 0.0) ?>">
                    <?= e($x['short_name']) ?> (<?= e($x['name']) ?>) — <?= (int)$x['floors'] ?> ชั้น [<?= (float)$x['width'] ?>×<?= (float)$x['depth'] ?> ม.]
                </option>
            <?php endforeach; ?>
        </select>
        <div id="site-save-notice" class="hidden text-xs text-amber-300 font-heading bg-amber-950/90 border border-amber-500/60 px-3 py-1.5 rounded-lg animate-pulse">
            ⚠️ มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
        </div>
    </div>

    <!-- Hidden form for move submission -->
    <form id="site-move-form" method="post" action="buildings.php" class="hidden">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="move">
        <input type="hidden" name="id">
        <input type="hidden" name="center_x">
        <input type="hidden" name="center_z">
        <input type="hidden" name="width">
        <input type="hidden" name="depth">
        <input type="hidden" name="rot_y">
    </form>

    <div class="grid lg:grid-cols-12 gap-5">
        <!-- SVG Map Column (7 cols on lg) -->
        <div class="lg:col-span-7 flex flex-col space-y-2">
            <!-- Map Toolbar (Satellite Toggle, Opacity Slider, Circulation Toggle) -->
            <div class="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div class="flex items-center gap-2">
                    <button type="button" id="btn-site-toggle-sat" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition" title="เปิด/ปิดภาพถ่ายดาวเทียม">
                        <i class="fa-solid fa-satellite text-emerald-400"></i>
                        <span>ภาพดาวเทียม</span>
                    </button>
                    <div class="flex items-center gap-1.5 text-slate-400 text-[11px]" title="ปรับความโปร่งใสภาพดาวเทียม">
                        <span>ความชัด:</span>
                        <input type="range" id="input-site-sat-opacity" min="10" max="100" value="65" class="w-16 h-1.5 bg-slate-700 rounded-lg cursor-pointer">
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <button type="button" id="btn-site-toggle-circ" class="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 flex items-center gap-1.5 transition" title="แสดง/ซ่อนเส้นทางเดินรถ">
                        <i class="fa-solid fa-route"></i>
                        <span>เส้นทางเดินรถ</span>
                    </button>
                    <a id="btn-site-view-3d" href="../index.html" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-500/40 hover:bg-sky-900 flex items-center gap-1 transition" title="เปิดดูมุมมอง 3D ของอาคารนี้">
                        <i class="fa-solid fa-eye"></i> ดู 3D
                    </a>
                </div>
            </div>

            <!-- SVG Map Canvas -->
            <div class="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                <svg id="site-plan" viewBox="-35 -30 70 58" class="w-full h-auto max-h-[520px] touch-none select-none" role="img" aria-label="ผังรวม สสจ.มุกดาหาร">
                    <?= render_site_plan_background_svg(false) ?>

                    <!-- Dynamic Guide Crosshairs for Active Building -->
                    <line id="site-guide-x" x1="-33" y1="0" x2="33" y2="0" stroke="#facc15" stroke-width="0.1" stroke-dasharray="0.4,0.3" opacity="0.6" class="hidden"/>
                    <line id="site-guide-z" x1="0" y1="-28" x2="0" y2="26" stroke="#facc15" stroke-width="0.1" stroke-dasharray="0.4,0.3" opacity="0.6" class="hidden"/>

                    <!-- Buildings -->
                    <?php foreach ($buildings as $b):
                        $w = (float)$b['width'];
                        $d = (float)$b['depth'];
                        $cx = (float)$b['center_x'];
                        $cz = (float)$b['center_z'];
                        $rotY = (float)($b['rot_y'] ?? 0.0);
                        $rotDeg = round(rad2deg($rotY), 1);
                        $bx = $cx - $w / 2;
                        $bz = $cz - $d / 2;
                        $col = $b['color'] ?: '#10b981';
                    ?>
                    <g class="site-building cursor-move" data-id="<?= e($b['id']) ?>" data-name="<?= e($b['short_name']) ?>"
                       data-x="<?= $cx ?>" data-z="<?= $cz ?>" data-w="<?= $w ?>" data-d="<?= $d ?>" data-rot="<?= $rotY ?>"
                       transform="rotate(<?= $rotDeg ?>, <?= $cx ?>, <?= $cz ?>)">
                        <title><?= e($b['short_name']) ?> (คลิกเพื่อเลือก / ลากเพื่อย้าย)</title>

                        <!-- Selection Ring (Golden dashed outline) -->
                        <rect class="bld-ring" x="<?= $bx - 0.5 ?>" y="<?= $bz - 0.5 ?>" width="<?= $w + 1.0 ?>" height="<?= $d + 1.0 ?>"
                              rx="0.7" fill="none" stroke="#facc15" stroke-width="0.35" stroke-dasharray="0.8,0.4" style="display:none;"/>

                        <!-- Building Body -->
                        <rect class="bld-body" x="<?= $bx ?>" y="<?= $bz ?>" width="<?= $w ?>" height="<?= $d ?>" rx="0.5"
                              fill="<?= e($col) ?>" fill-opacity="0.88" stroke="#ffffff" stroke-width="0.25"/>

                        <!-- Front Orientation Line & Arrow -->
                        <line class="bld-front-line" x1="<?= $bx ?>" y1="<?= $bz + $d ?>" x2="<?= $bx + $w ?>" y2="<?= $bz + $d ?>"
                              stroke="#facc15" stroke-width="0.35"/>
                        <polygon class="bld-front-arrow"
                                 points="<?= $cx - 0.6 ?>,<?= $bz + $d ?> <?= $cx + 0.6 ?>,<?= $bz + $d ?> <?= $cx ?>,<?= $bz + $d + 0.9 ?>"
                                 fill="#facc15"/>

                        <!-- Building Labels -->
                        <text class="bld-label" x="<?= $cx ?>" y="<?= $cz - 0.3 ?>" font-size="0.88" font-weight="bold" fill="#ffffff" text-anchor="middle" pointer-events="none">
                            <?= e($b['short_name']) ?>
                        </text>
                        <text class="bld-sub" x="<?= $cx ?>" y="<?= $cz + 0.8 ?>" font-size="0.58" fill="#e2e8f0" text-anchor="middle" pointer-events="none">
                            <?= $w ?>×<?= $d ?> ม. (<?= (int)$b['floors'] ?> ชั้น)
                        </text>

                        <!-- Resize Handle -->
                        <rect class="bld-handle cursor-nwse-resize" x="<?= $bx + $w - 1.2 ?>" y="<?= $bz + $d - 1.2 ?>" width="1.2" height="1.2"
                              rx="0.2" fill="#facc15" stroke="#000000" stroke-width="0.1" style="display:none;"/>
                    </g>
                    <?php endforeach; ?>

                    <!-- Active Building Floating Pin -->
                    <g id="site-active-pin" class="hidden pointer-events-none">
                        <polygon points="-0.6,-1.8 0.6,-1.8 0,-0.6" fill="#facc15"/>
                        <circle cx="0" cy="-2.2" r="0.6" fill="#facc15" stroke="#000000" stroke-width="0.1"/>
                        <text id="site-active-pin-text" x="0" y="-3.1" font-size="0.75" font-weight="bold" fill="#facc15" text-anchor="middle">📍 กำลังปรับอาคารนี้</text>
                    </g>
                </svg>
            </div>
        </div>

        <!-- Quick Adjust Controls Column (5 cols on lg) -->
        <div class="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
                <!-- Selected Building Info Card -->
                <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-3 shadow-sm">
                    <span class="text-[10px] text-slate-400 font-heading uppercase tracking-wider block mb-1">
                        อาคารที่กำลังปรับตำแหน่ง:
                    </span>
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 truncate">
                            <span id="site-sel-name" class="font-heading font-bold text-white text-base truncate">—</span>
                            <span id="site-sel-badge" class="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded font-bold"></span>
                        </div>
                    </div>
                </div>

                <!-- Choose active building quick pills -->
                <div class="mb-3">
                    <span class="text-xs text-slate-400 block mb-1.5 font-medium">สลับเลือกอาคารด่วน:</span>
                    <div class="flex flex-wrap gap-1.5">
                        <?php foreach ($buildings as $b): ?>
                        <button type="button" class="btn-bld-pill px-2.5 py-1.5 rounded-lg text-xs font-heading font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5" data-id="<?= e($b['id']) ?>">
                            <span class="w-2.5 h-2.5 rounded-full" style="background-color: <?= e($b['color'] ?: '#10b981') ?>;"></span>
                            <span><?= e($b['short_name']) ?></span>
                        </button>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Position & Dimension Readouts -->
                <div class="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-2">
                    <div>
                        <span class="text-slate-400 block text-[11px] mb-0.5">พิกัด 3D กึ่งกลาง:</span>
                        <span id="site-sel-pos" class="font-mono text-emerald-400 font-bold text-sm">-</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px] mb-0.5">ขนาดอาคาร (กว้าง×ลึก):</span>
                        <span id="site-sel-dim" class="font-mono text-sky-400 font-bold text-sm">-</span>
                    </div>
                </div>

                <!-- Rotation & Real GPS Readouts -->
                <div class="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-3 rounded-xl border border-slate-800 mb-3">
                    <div>
                        <span class="text-slate-400 block text-[11px] mb-0.5">มุมหมุนรอบแกน Y:</span>
                        <span id="site-sel-rot" class="font-mono text-amber-300 font-bold text-sm">0.0° (0.00 rad)</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[11px] mb-0.5">พิกัด GPS จริง:</span>
                        <a id="site-sel-gmaps-link" href="https://www.google.com/maps/search/?api=1&query=16.541450,104.724250" target="_blank" rel="noopener noreferrer" class="font-mono text-emerald-300 hover:underline flex items-center gap-1 text-[11px] truncate">
                            <span id="site-sel-gps">-</span>
                            <i class="fa-solid fa-arrow-up-right-from-square text-[9px] text-sky-400"></i>
                        </a>
                    </div>
                </div>

                <!-- Step Size Toggle (Big Buttons) -->
                <div class="flex items-center justify-between mb-3 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80">
                    <span class="text-xs text-slate-300 font-heading font-medium">ระยะปรับต่อคลิก:</span>
                    <div class="flex gap-1">
                        <button type="button" class="btn-site-step px-2.5 py-1 rounded-lg text-xs font-heading bg-slate-800 text-slate-300 border border-slate-700 font-medium" data-step="0.1">0.1 ม.</button>
                        <button type="button" class="btn-site-step px-2.5 py-1 rounded-lg text-xs font-heading bg-slate-800 text-slate-300 border border-slate-700 font-medium" data-step="0.5">0.5 ม.</button>
                        <button type="button" class="btn-site-step px-2.5 py-1 rounded-lg text-xs font-heading bg-emerald-600 text-white font-bold border border-emerald-500" data-step="1.0">1.0 ม.</button>
                        <button type="button" class="btn-site-step px-2.5 py-1 rounded-lg text-xs font-heading bg-slate-800 text-slate-300 border border-slate-700 font-medium" data-step="2.0">2.0 ม.</button>
                    </div>
                </div>

                <!-- Big Nudge D-Pad (Position adjustment) -->
                <div class="mb-4">
                    <span class="text-xs text-slate-300 block mb-2 font-heading font-semibold flex items-center gap-1.5">
                        <i class="fa-solid fa-arrows-up-down-left-right text-sky-400"></i> เลื่อนตำแหน่ง (ปุ่มใหญ่ 4 ทิศ):
                    </span>
                    <div class="grid grid-cols-3 gap-2 max-w-[220px] mx-auto text-center">
                        <div></div>
                        <button type="button" id="btn-nudge-up" class="h-12 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white border border-slate-700 shadow-md flex flex-col items-center justify-center transition active:scale-95" title="เลื่อนขึ้นทางทิศเหนือ (ถ.ชาภูบาล)">
                            <i class="fa-solid fa-chevron-up text-base"></i>
                            <span class="text-[10px] font-normal">เหนือ</span>
                        </button>
                        <div></div>

                        <button type="button" id="btn-nudge-left" class="h-12 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white border border-slate-700 shadow-md flex flex-col items-center justify-center transition active:scale-95" title="เลื่อนไปทางทิศตะวันตก (ซ้าย)">
                            <i class="fa-solid fa-chevron-left text-base"></i>
                            <span class="text-[10px] font-normal">ตก</span>
                        </button>
                        <div class="h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                            <i class="fa-solid fa-compass text-lg"></i>
                        </div>
                        <button type="button" id="btn-nudge-right" class="h-12 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white border border-slate-700 shadow-md flex flex-col items-center justify-center transition active:scale-95" title="เลื่อนไปทางทิศตะวันออก (ขวา)">
                            <i class="fa-solid fa-chevron-right text-base"></i>
                            <span class="text-[10px] font-normal">ออก</span>
                        </button>

                        <div></div>
                        <button type="button" id="btn-nudge-down" class="h-12 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white border border-slate-700 shadow-md flex flex-col items-center justify-center transition active:scale-95" title="เลื่อนลงทางทิศใต้ (หน้า สสจ.)">
                            <i class="fa-solid fa-chevron-down text-base"></i>
                            <span class="text-[10px] font-normal">ใต้</span>
                        </button>
                        <div></div>
                    </div>
                    <p class="text-center text-[10px] text-slate-400 mt-1">💡 กดปุ่มลูกศร ↑ ↓ ← → บนคีย์บอร์ดเลื่อนได้ทันที (Shift เลื่อนเร็ว 5 เท่า)</p>
                </div>

                <!-- Rotation Controls (NEW: Cardinal snaps and step rotation) -->
                <div class="mb-4 bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
                    <span class="text-xs text-slate-300 block font-heading font-semibold flex items-center gap-1.5">
                        <i class="fa-solid fa-rotate text-amber-400"></i> หมุนองศาอาคาร (Rotation):
                    </span>
                    <div class="grid grid-cols-4 gap-1.5 text-xs font-heading">
                        <button type="button" class="btn-rot-cardinal py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95" data-deg="0">
                            0° (ใต้)
                        </button>
                        <button type="button" class="btn-rot-cardinal py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95" data-deg="90">
                            90° (ตก)
                        </button>
                        <button type="button" class="btn-rot-cardinal py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95" data-deg="180">
                            180° (เหนือ)
                        </button>
                        <button type="button" class="btn-rot-cardinal py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95" data-deg="270">
                            270° (ออก)
                        </button>
                    </div>
                    <div class="grid grid-cols-4 gap-1.5 text-xs font-heading pt-1">
                        <button type="button" class="btn-rot-step py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 active:scale-95" data-delta="-15">⟲ -15°</button>
                        <button type="button" class="btn-rot-step py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 active:scale-95" data-delta="15">⟳ +15°</button>
                        <button type="button" class="btn-rot-step py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 active:scale-95" data-delta="-5">⟲ -5°</button>
                        <button type="button" class="btn-rot-step py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 active:scale-95" data-delta="5">⟳ +5°</button>
                    </div>
                </div>

                <!-- Dimension Buttons (+ / - Width, Depth) -->
                <div>
                    <span class="text-xs text-slate-300 block mb-2 font-heading font-semibold flex items-center gap-1.5">
                        <i class="fa-solid fa-expand text-emerald-400"></i> ปรับขนาดอาคาร (ย่อ / ขยาย):
                    </span>
                    <div class="grid grid-cols-2 gap-2.5">
                        <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                            <span class="text-[11px] text-slate-400 block mb-1.5 font-medium">กว้าง (Width)</span>
                            <div class="flex gap-1.5">
                                <button type="button" id="btn-size-w-dec" class="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-rose-300 font-bold border border-slate-700 active:scale-95">- ลด</button>
                                <button type="button" id="btn-size-w-inc" class="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 font-bold border border-slate-700 active:scale-95">+ ขยาย</button>
                            </div>
                        </div>
                        <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                            <span class="text-[11px] text-slate-400 block mb-1.5 font-medium">ลึก (Depth)</span>
                            <div class="flex gap-1.5">
                                <button type="button" id="btn-size-d-dec" class="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-rose-300 font-bold border border-slate-700 active:scale-95">- ลด</button>
                                <button type="button" id="btn-size-d-inc" class="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 font-bold border border-slate-700 active:scale-95">+ ขยาย</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Presets -->
                <div class="mt-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <span class="text-[11px] text-slate-400 font-medium block">จัดตำแหน่งด่วน:</span>
                    <div class="grid grid-cols-2 gap-1.5 text-xs font-heading">
                        <button type="button" class="btn-main-preset py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left" data-x="0" data-z="0">
                            🌿 กึ่งกลางลาน (0, 0)
                        </button>
                        <button type="button" class="btn-main-preset py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left" data-x="-8.5" data-z="8.0">
                            🏢 ลานหน้า (2F)
                        </button>
                        <button type="button" class="btn-main-preset py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left" data-x="-3.0" data-z="-8.0">
                            🏢 ตึกหลัง (4F)
                        </button>
                        <button type="button" class="btn-main-preset py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-left" data-x="26.5" data-z="-14.5">
                            🌿 แพทย์แผนไทย
                        </button>
                    </div>
                </div>
            </div>

            <!-- Action Buttons: Save & Reset -->
            <div class="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <button type="button" id="btn-site-save" disabled
                        class="w-full py-3.5 rounded-xl font-heading font-bold text-sm text-white opacity-50 cursor-not-allowed bg-slate-700 transition flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]">
                    <i class="fa-solid fa-floppy-disk text-base"></i>
                    <span>💾 บันทึกตำแหน่ง ขนาด และมุมหมุน</span>
                </button>
                <button type="button" id="btn-site-reset" class="hidden w-full py-2.5 rounded-xl font-heading font-medium text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center gap-1.5 border border-slate-700">
                    <i class="fa-solid fa-rotate-left"></i> คืนค่าเดิม
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Building List Cards Grid -->
<div class="grid md:grid-cols-2 gap-4">
<?php foreach ($buildings as $b):
    $cnt = (int)($roomCounts[$b['id']] ?? 0);
    $rotY = (float)($b['rot_y'] ?? 0.0);
    $rotDeg = round(rad2deg($rotY), 1);
?>
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
        <div>
            <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2.5">
                    <span class="w-4 h-4 rounded-full border border-white/20 shrink-0" style="background-color: <?= e($b['color']) ?>;"></span>
                    <span class="font-heading font-bold text-base text-white"><?= e($b['short_name']) ?></span>
                    <span class="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700"><?= e($b['id']) ?></span>
                </div>
                <span class="text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <?= (int)$b['floors'] ?> ชั้น
                </span>
            </div>
            <p class="text-xs text-slate-300 font-heading mb-3 line-clamp-1"><?= e($b['name']) ?></p>

            <div class="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-3">
                <div>
                    <span class="text-slate-500">ขนาด:</span>
                    <span class="text-slate-200 font-medium"><?= (float)$b['width'] ?> × <?= (float)$b['depth'] ?> ม.</span>
                </div>
                <div>
                    <span class="text-slate-500">พิกัด 3D:</span>
                    <span class="text-slate-200 font-medium">X:<?= (float)$b['center_x'] ?>, Z:<?= (float)$b['center_z'] ?></span>
                </div>
                <div>
                    <span class="text-slate-500">ห้องในอาคาร:</span>
                    <a href="rooms.php?b=<?= rawurlencode($b['id']) ?>" class="text-emerald-400 font-medium hover:underline"><?= $cnt ?> ห้อง</a>
                </div>
                <div>
                    <span class="text-slate-500">การหมุนรอบแกน Y:</span>
                    <span class="text-amber-300 font-medium"><?= $rotDeg ?>° (<?= $rotY ?> rad)</span>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <div class="flex items-center gap-2">
                <button type="button" class="btn-card-select px-3 py-2 rounded-xl text-xs font-heading font-medium bg-slate-800 text-sky-300 border border-slate-700 hover:bg-slate-700 flex items-center gap-1.5 transition" data-id="<?= e($b['id']) ?>">
                    <i class="fa-solid fa-location-crosshairs"></i> ปรับในผัง
                </button>
                <a href="rooms.php?b=<?= rawurlencode($b['id']) ?>" class="px-3 py-2 rounded-xl text-xs font-heading font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80 flex items-center gap-1.5 transition">
                    <i class="fa-solid fa-table-cells"></i> ผังห้อง
                </a>
                <a href="buildings.php?edit=<?= rawurlencode($b['id']) ?>" class="px-3 py-2 rounded-xl text-xs font-heading font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center gap-1.5 transition">
                    <i class="fa-solid fa-pen-to-square"></i> แก้ไข
                </a>
            </div>

            <?php if ($cnt === 0): ?>
            <form method="post" action="buildings.php" data-confirm="⚠️ ยืนยันการลบอาคาร &quot;<?= e($b['short_name']) ?>&quot; (<?= e($b['id']) ?>) ออกจากระบบหรือไม่?">
                <?= csrf_field() ?>
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" value="<?= e($b['id']) ?>">
                <button type="submit" class="px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/60 hover:text-rose-300 flex items-center gap-1.5 transition">
                    <i class="fa-solid fa-trash"></i> ลบ
                </button>
            </form>
            <?php else: ?>
            <span class="text-[11px] text-slate-500" title="มีห้องใช้งานอยู่ ไม่สามารถลบได้">ลบไม่ได้ (มี <?= $cnt ?> ห้อง)</span>
            <?php endif; ?>
        </div>
    </div>
<?php endforeach; ?>
</div>
<?php endif; ?>

<?php
page_end();
