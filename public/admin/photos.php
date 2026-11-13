<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();
if (!is_admin($user)) {
    flash('เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถจัดการรูปภาพได้', false);
    redirect('departments.php');
}

$cat = (string)($_GET['cat'] ?? 'all');
$validCats = ['all', 'spot', 'personnel', 'satellite', 'system', 'room', 'other'];
if (!in_array($cat, $validCats, true)) {
    $cat = 'all';
}
$back = 'photos.php' . ($cat !== 'all' ? '?cat=' . urlencode($cat) : '');

if (is_post()) {
    $action = (string)($_POST['action'] ?? '');
    handle_post(function () use ($user, $action) {
        if ($action === 'upload') {
            $photoKey = trim((string)($_POST['photo_key'] ?? ''));
            if ($photoKey === '__custom__') {
                $customKey = trim((string)($_POST['custom_key'] ?? ''));
                $photoKey = $customKey !== '' ? $customKey : 'custom_' . date('Ymd_His');
            }
            if ($photoKey === '') {
                throw new HttpError(400, 'กรุณาระบุรหัสรูปภาพหรือเลือกจุดที่ต้องการแทนที่');
            }
            $title = trim((string)($_POST['title'] ?? ''));
            $roomId = trim((string)($_POST['room_id'] ?? ''));
            $category = trim((string)($_POST['category'] ?? 'spot'));
            $file = $_FILES['photo'] ?? [];

            $res = photo_upload($user, $photoKey, $file, $title ?: null, $roomId ?: null, $category);
            return 'อัปโหลดรูปภาพ "' . ($res['file_name'] ?? $photoKey) . '" สำเร็จแล้ว';
        }
        if ($action === 'update') {
            $id = (int)($_POST['id'] ?? 0);
            photo_update($user, $id, $_POST);
            return 'แก้ไขข้อมูลรูปภาพเรียบร้อยแล้ว';
        }
        if ($action === 'delete') {
            $id = (int)($_POST['id'] ?? 0);
            photo_delete($user, $id);
            return 'ลบ / เคลียร์รูปภาพเรียบร้อยแล้ว';
        }
        throw new HttpError(400, 'คำสั่งไม่ถูกต้อง');
    }, $back);
}

$allPhotos = photo_list($user);
$photos = $cat === 'all' ? $allPhotos : array_values(array_filter($allPhotos, fn($p) => $p['category'] === $cat));
$rooms = room_list();

$catLabels = [
    'all'       => 'ทั้งหมด (' . count($allPhotos) . ')',
    'spot'      => 'จุดเทียบภาพ 3D (' . count(array_filter($allPhotos, fn($p) => $p['category'] === 'spot')) . ')',
    'personnel' => 'บุคลากร/ผู้บริหาร (' . count(array_filter($allPhotos, fn($p) => $p['category'] === 'personnel')) . ')',
    'system'    => 'ระบบ & โลโก้ (' . count(array_filter($allPhotos, fn($p) => $p['category'] === 'system')) . ')',
    'satellite' => 'แผนที่ดาวเทียม (' . count(array_filter($allPhotos, fn($p) => $p['category'] === 'satellite')) . ')',
    'room'      => 'รูปภาพห้อง (' . count(array_filter($allPhotos, fn($p) => $p['category'] === 'room')) . ')',
    'other'     => 'อื่นๆ (' . count(array_filter($allPhotos, fn($p) => $p['category'] === 'other')) . ')',
];

$catBadgeColors = [
    'spot'      => 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'personnel' => 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    'system'    => 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    'satellite' => 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    'room'      => 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    'other'     => 'bg-slate-500/20 text-slate-300 border-slate-500/40',
];

page_start('จัดการรูปภาพ', 'photos.php', $user, ['assets/photos.js']);
?>

<div class="space-y-6">
    <!-- Top Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-heading font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-camera-retro text-emerald-400"></i> จัดการรูปภาพ & จุดถ่ายภาพจริง
            </h1>
            <p class="text-xs text-slate-400 mt-1">
                อัปโหลดรูปภาพ ดูตัวอย่างภาพขยายบนหน้าเว็บ แก้ไขข้อมูลชื่อ/ห้อง และลบหรือเคลียร์รูปภาพได้ทันที
            </p>
        </div>
        <div class="flex items-center gap-2">
            <a href="../assets/README-รูปที่ต้องใส่.md" target="_blank" class="px-3 py-1.5 rounded-xl text-xs font-heading bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                <i class="fa-solid fa-circle-question"></i> รายการรูปมาตรฐาน
            </a>
        </div>
    </div>

    <!-- Upload Card -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <h2 class="text-sm font-heading font-bold text-slate-200 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-cloud-arrow-up text-emerald-400"></i> อัปโหลดรูปภาพใหม่ / เพิ่มรูปจุดตรวจ
        </h2>
        <form method="post" enctype="multipart/form-data" class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="upload">

            <div class="md:col-span-3">
                <label class="block text-xs font-heading text-slate-400 mb-1">เลือกจุดเป้าหมายที่จะแทนที่</label>
                <select name="photo_key" id="upload-target-key" class="w-full <?= INPUT_BASE ?> text-xs">
                    <optgroup label="จุดเทียบภาพ 3D (11 จุด)">
<?php foreach ($allPhotos as $ap): if ($ap['category'] === 'spot'): ?>
                        <option value="<?= e($ap['photo_key']) ?>"><?= e($ap['title']) ?> (<?= e($ap['file_name']) ?>)</option>
<?php endif; endforeach; ?>
                    </optgroup>
                    <optgroup label="รูปบุคคลและระบบ">
<?php foreach ($allPhotos as $ap): if (in_array($ap['category'], ['personnel', 'system', 'satellite'], true)): ?>
                        <option value="<?= e($ap['photo_key']) ?>"><?= e($ap['title']) ?> (<?= e($ap['file_name']) ?>)</option>
<?php endif; endforeach; ?>
                    </optgroup>
                    <optgroup label="กำหนดใหม่">
                        <option value="__custom__">+ เพิ่มรูปภาพใหม่ (กำหนดเอง)</option>
                    </optgroup>
                </select>
            </div>

            <div class="md:col-span-3">
                <label class="block text-xs font-heading text-slate-400 mb-1">ไฟล์รูปภาพ (JPG, PNG, WebP &le; 10MB)</label>
                <input type="file" name="photo" required accept="image/jpeg,image/png,image/webp"
                       class="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-heading file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer">
            </div>

            <div class="md:col-span-2">
                <label class="block text-xs font-heading text-slate-400 mb-1">ผูกกับห้อง (ไม่บังคับ)</label>
                <select name="room_id" class="w-full <?= INPUT_BASE ?> text-xs">
                    <option value="">— ไม่ผูกกับห้อง —</option>
<?php foreach ($rooms as $rm): ?>
                    <option value="<?= e($rm['id']) ?>">ห้อง <?= e($rm['room_no']) ?> (<?= e($rm['name'] ?: $rm['label']) ?>)</option>
<?php endforeach; ?>
                </select>
            </div>

            <div class="md:col-span-2">
                <label class="block text-xs font-heading text-slate-400 mb-1">หมวดหมู่</label>
                <select name="category" class="w-full <?= INPUT_BASE ?> text-xs">
                    <option value="spot">จุดเทียบภาพ 3D</option>
                    <option value="room">ภาพห้อง/แผนก</option>
                    <option value="personnel">บุคลากร</option>
                    <option value="satellite">ดาวเทียม</option>
                    <option value="system">ระบบ/โลโก้</option>
                    <option value="other">ทั่วไป</option>
                </select>
            </div>

            <div class="md:col-span-2">
                <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-semibold text-xs py-2 px-3 rounded-lg shadow transition flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-upload"></i> อัปโหลดรูปภาพ
                </button>
            </div>
        </form>
    </div>

    <!-- Category Tabs -->
    <div class="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2">
<?php foreach ($catLabels as $ck => $cl):
        $active = ($cat === $ck);
?>
        <a href="photos.php?cat=<?= urlencode($ck) ?>"
           class="px-3 py-1.5 rounded-xl text-xs font-heading font-medium transition <?= $active ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800' ?>">
            <?= e($cl) ?>
        </a>
<?php endforeach; ?>
    </div>

    <!-- Photos Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<?php if (empty($photos)): ?>
        <div class="col-span-full py-12 text-center text-slate-500 text-sm">
            <i class="fa-regular fa-image text-3xl mb-2 block"></i>
            ไม่พบรูปภาพในหมวดหมู่นี้
        </div>
<?php else: ?>
<?php foreach ($photos as $p):
        $assetUrl = '../assets/' . rawurlencode($p['file_name']);
        $catClass = $catBadgeColors[$p['category']] ?? 'bg-slate-700 text-slate-300';
        $sizeKb = $p['actual_size'] > 0 ? round($p['actual_size'] / 1024, 1) : 0;
        $sizeDisplay = $sizeKb > 1024 ? round($sizeKb / 1024, 2) . ' MB' : $sizeKb . ' KB';
        $metaText = ($p['exists'] ? "ขนาด: $sizeDisplay" : 'ยังไม่มีไฟล์') . ($p['width'] > 0 ? " • มิติ: {$p['width']} × {$p['height']} px" : '');
        $editJson = json_encode([
            'id' => (int)$p['id'],
            'photo_key' => $p['photo_key'],
            'title' => $p['title'],
            'title_en' => $p['title_en'] ?? '',
            'room_id' => $p['room_id'] ?? '',
            'category' => $p['category'],
            'file_name' => $p['file_name']
        ], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
?>
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 transition shadow-sm group">
            <!-- Thumbnail Box (Click to preview on page) -->
            <div class="photo-thumb-box relative bg-slate-950 h-44 overflow-hidden border-b border-slate-800 cursor-pointer block select-none group/thumb"
                 data-preview-src="<?= $p['exists'] ? e($assetUrl) : '' ?>"
                 data-preview-title="<?= e($p['title']) ?>"
                 data-preview-meta="<?= e($metaText) ?>"
                 title="<?= $p['exists'] ? 'คลิกเพื่อดูรูปภาพขนาดใหญ่บนหน้านี้' : '' ?>">
<?php if ($p['exists']): ?>
                <img src="<?= e($assetUrl) ?>?v=<?= strtotime($p['updated_at']) ?>" alt="<?= e($p['title']) ?>"
                     class="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300 block"
                     loading="lazy">
                <button type="button"
                   data-preview-src="<?= e($assetUrl) ?>"
                   data-preview-title="<?= e($p['title']) ?>"
                   data-preview-meta="<?= e($metaText) ?>"
                   class="photo-thumb-btn bg-slate-900/90 hover:bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-700/80 shadow flex items-center gap-1.5 transition cursor-pointer">
                    <i class="fa-solid fa-expand"></i> ดูรูป
                </button>
<?php else: ?>
                <div class="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <i class="fa-solid fa-triangle-exclamation text-rose-400 text-2xl mb-1"></i>
                    <p class="text-xs text-rose-300 font-heading">ยังไม่มีไฟล์ใน public/assets/</p>
                    <code class="text-[10px] text-slate-400 block mt-0.5"><?= e($p['file_name']) ?></code>
                </div>
<?php endif; ?>

                <!-- Category badge on thumbnail -->
                <span class="photo-thumb-badge text-[10px] font-heading font-semibold px-2 py-0.5 rounded border <?= $catClass ?> backdrop-blur-sm bg-slate-900/90 select-none">
                    <?= e($p['category']) ?>
                </span>
            </div>

            <!-- Card Info -->
            <div class="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                    <div class="flex items-start justify-between gap-2">
                        <h3 class="font-heading font-bold text-sm text-white leading-snug">
                            <?= e($p['title']) ?>
                        </h3>
                        <!-- Edit Button (Opens Edit Modal) -->
                        <button type="button" data-edit-photo='<?= $editJson ?>'
                                class="text-slate-400 hover:text-emerald-400 text-xs px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700/60 transition flex items-center gap-1 shrink-0"
                                title="แก้ไขชื่อ, หมวดหมู่, หรือผูกห้อง">
                            <i class="fa-solid fa-pen-to-square"></i> แก้ไข
                        </button>
                    </div>

<?php if (!empty($p['title_en'])): ?>
                    <p class="text-[11px] text-slate-400 mt-0.5"><?= e($p['title_en']) ?></p>
<?php endif; ?>

                    <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                        <span class="font-mono text-[11px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                            <?= e($p['file_name']) ?>
                        </span>
<?php if ($p['room_no']): ?>
                        <span class="text-slate-300">
                            <i class="fa-solid fa-door-open mr-1 text-slate-500"></i>ห้อง <?= e($p['room_no']) ?>
                        </span>
<?php endif; ?>
                    </div>

                    <div class="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
<?php if ($p['exists']): ?>
                        <span><i class="fa-solid fa-hard-drive mr-1"></i><?= e($sizeDisplay) ?></span>
<?php if ($p['width'] > 0): ?>
                        <span><i class="fa-solid fa-expand mr-1"></i><?= (int)$p['width'] ?> &times; <?= (int)$p['height'] ?> px</span>
<?php endif; ?>
<?php else: ?>
                        <span class="text-rose-400"><i class="fa-solid fa-circle-xmark mr-1"></i>ไม่พบไฟล์</span>
<?php endif; ?>
                    </div>
                </div>

                <!-- Bottom Actions: Upload Replace & Delete -->
                <div class="pt-2 border-t border-slate-800/80 space-y-2">
                    <!-- Quick Replace Upload Form (Standalone Form) -->
                    <form method="post" enctype="multipart/form-data" class="flex items-center gap-1.5">
                        <?= csrf_field() ?>
                        <input type="hidden" name="action" value="upload">
                        <input type="hidden" name="photo_key" value="<?= e($p['photo_key']) ?>">
                        <input type="hidden" name="category" value="<?= e($p['category']) ?>">
                        <input type="file" name="photo" required accept="image/jpeg,image/png,image/webp"
                               class="flex-1 text-[11px] text-slate-400 file:mr-1.5 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-heading file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer">
                        <button type="submit" class="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 px-2 py-1 rounded text-xs font-heading transition" title="อัปโหลดแทนที่รูปนี้">
                            <i class="fa-solid fa-cloud-arrow-up mr-1"></i> แทนที่
                        </button>
                    </form>

                    <!-- Separate Delete / Clear Form (Clean, No File Input) -->
                    <div class="flex items-center justify-end">
                        <form method="post" action="photos.php" data-confirm="ยืนยันการลบหรือเคลียร์ไฟล์รูปภาพ '<?= e($p['title']) ?>' ใช่หรือไม่?">
                            <?= csrf_field() ?>
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">
                            <button type="submit"
                                    class="bg-rose-950/40 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 hover:border-rose-700 px-2.5 py-1 rounded text-xs font-heading transition flex items-center gap-1">
                                <i class="fa-solid fa-trash-can"></i>
                                <?= in_array($p['category'], ['system', 'satellite'], true) || str_starts_with($p['photo_key'], 'spot_') ? 'ลบ/เคลียร์ไฟล์' : 'ลบรูปภาพ' ?>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
<?php endforeach; ?>
<?php endif; ?>
    </div>
</div>

<!-- ========================================================================= -->
<!-- 1. LIGHTBOX PREVIEW MODAL (ดูรูปขนาดใหญ่ในหน้านี้ทันที)                     -->
<!-- ========================================================================= -->
<div id="photo-lightbox-modal" class="photo-modal-overlay fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md items-center justify-center p-4">
    <div class="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden flex flex-col shadow-2xl">
        <!-- Modal Top Bar -->
        <div class="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div>
                <h3 id="lightbox-title" class="font-heading font-bold text-white text-base leading-snug">ภาพตัวอย่าง</h3>
                <p id="lightbox-meta" class="text-xs text-slate-400 mt-0.5"></p>
            </div>
            <button id="lightbox-close-btn" type="button" class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer">
                <i class="fa-solid fa-xmark text-base"></i>
            </button>
        </div>
        <!-- Modal Image Body -->
        <div class="p-4 flex-1 flex items-center justify-center bg-slate-950/60 overflow-auto">
            <img id="lightbox-image" src="" alt="พรีวิวรูปภาพ" class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg">
        </div>
    </div>
</div>

<!-- ========================================================================= -->
<!-- 2. EDIT PHOTO MODAL (แก้ไขชื่อ, ชื่ออังกฤษ, ห้องที่ผูก, หมวดหมู่)         -->
<!-- ========================================================================= -->
<div id="photo-edit-modal" class="photo-modal-overlay fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm items-center justify-center p-4">
    <div class="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 class="font-heading font-bold text-white text-base flex items-center gap-2">
                <i class="fa-solid fa-pen-to-square text-emerald-400"></i> แก้ไขข้อมูลรูปภาพ
            </h3>
            <button id="edit-modal-close-btn" type="button" class="text-slate-400 hover:text-white p-1">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <form method="post" action="photos.php" class="p-4 space-y-3.5">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="update">
            <input type="hidden" name="id" id="edit-id" value="">

            <div>
                <label class="block text-xs font-heading text-slate-400 mb-1">ชื่อรูปภาพ (ภาษาไทย)</label>
                <input type="text" name="title" id="edit-title" required class="w-full <?= INPUT_BASE ?> text-xs text-white">
            </div>

            <div>
                <label class="block text-xs font-heading text-slate-400 mb-1">ชื่อรูปภาพ (ภาษาอังกฤษ - ไม่บังคับ)</label>
                <input type="text" name="title_en" id="edit-title-en" class="w-full <?= INPUT_BASE ?> text-xs text-white">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-heading text-slate-400 mb-1">ผูกกับห้อง</label>
                    <select name="room_id" id="edit-room-id" class="w-full <?= INPUT_BASE ?> text-xs">
                        <option value="">— ไม่ผูกกับห้อง —</option>
<?php foreach ($rooms as $rm): ?>
                        <option value="<?= e($rm['id']) ?>">ห้อง <?= e($rm['room_no']) ?> (<?= e($rm['name'] ?: $rm['label']) ?>)</option>
<?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-heading text-slate-400 mb-1">หมวดหมู่</label>
                    <select name="category" id="edit-category" class="w-full <?= INPUT_BASE ?> text-xs">
                        <option value="spot">จุดเทียบภาพ 3D</option>
                        <option value="room">ภาพห้อง/แผนก</option>
                        <option value="personnel">บุคลากร</option>
                        <option value="satellite">ดาวเทียม</option>
                        <option value="system">ระบบ/โลโก้</option>
                        <option value="other">ทั่วไป</option>
                    </select>
                </div>
            </div>

            <div class="pt-1 text-[11px] text-slate-400">
                <span>ชื่อไฟล์ปัจจุบัน: </span>
                <code id="edit-filename-display" class="font-mono text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded"></code>
            </div>

            <div class="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button type="button" id="edit-modal-cancel-btn" class="px-3 py-1.5 rounded-lg text-xs font-heading bg-slate-800 hover:bg-slate-700 text-slate-300">
                    ยกเลิก
                </button>
                <button type="submit" class="px-4 py-1.5 rounded-lg text-xs font-heading font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow">
                    <i class="fa-solid fa-check mr-1"></i> บันทึกการแก้ไข
                </button>
            </div>
        </form>
    </div>
</div>

<?php page_end(); ?>
