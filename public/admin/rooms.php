<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();
$buildings = building_list();
$bldIds = array_column($buildings, 'id');
$b = in_array($_GET['b'] ?? '', $bldIds, true) ? $_GET['b'] : ($bldIds[1] ?? $bldIds[0]);
$bld = $buildings[array_search($b, $bldIds, true)];
$f = max(1, min($bld['floors'], (int)($_GET['f'] ?? 1)));
$back = 'rooms.php?b=' . rawurlencode($b) . '&f=' . $f;

if (is_post()) {
    $roomId = (string)($_POST['room_id'] ?? '');
    $action = (string)($_POST['action'] ?? '');
    handle_post(function () use ($user, $roomId, $action) {
        if ($action === 'create') {
            $newId = room_create($user, $_POST);
            return "เพิ่มห้อง '$newId' สำเร็จ";
        }
        if ($action === 'delete') {
            room_delete($user, $roomId);
            return "ลบห้อง '$roomId' เรียบร้อย";
        }
        if ($action === 'assign') {
            room_update($user, $roomId, ['department_id' => $_POST['department_id'] ?? '']);
            return 'เปลี่ยนกลุ่มงานของห้องแล้ว';
        }
        if ($action === 'move') {
            room_update($user, $roomId, array_intersect_key($_POST, array_flip(['lx', 'lz', 'w', 'd'])));
            return 'บันทึกตำแหน่งห้องแล้ว';
        }
        throw new HttpError(400, 'คำสั่งไม่ถูกต้อง');
    }, $back);
}

$depts = dept_list($user);
$deptById = array_column($depts, null, 'id');
$rooms = array_values(array_filter(room_list(), fn($r) => $r['building_id'] === $b && $r['floor'] === $f));
$colors = ['service' => '#f59e0b', 'admin' => '#3b82f6', 'academic' => '#10b981', 'meeting' => '#a855f7', 'executive' => '#ef4444', 'digital' => '#06b6d4'];

page_start('ห้อง / ผัง', 'rooms.php', $user, is_admin($user) ? ['assets/plan.js'] : []);
?>
<form method="get" action="rooms.php" class="flex flex-wrap items-center gap-2 mb-3">
    <h1 class="font-heading font-bold text-lg mr-2">ห้องและผังชั้น</h1>
    <select name="b" data-autosubmit aria-label="อาคาร" class="<?= INPUT_INLINE ?>">
<?php foreach ($buildings as $x): ?>
        <option value="<?= e($x['id']) ?>"<?= $x['id'] === $b ? ' selected' : '' ?>><?= e($x['short_name']) ?></option>
<?php endforeach; ?>
    </select>
    <select name="f" data-autosubmit aria-label="ชั้น" class="<?= INPUT_INLINE ?>">
<?php for ($i = 1; $i <= $bld['floors']; $i++): ?>
        <option value="<?= $i ?>"<?= $i === $f ? ' selected' : '' ?>>ชั้น <?= $i ?></option>
<?php endfor; ?>
    </select>
    <noscript><button class="<?= BTN_GHOST ?>">แสดง</button></noscript>
    <a href="buildings.php" class="text-xs text-slate-400 hover:text-emerald-400 ml-auto flex items-center gap-1">
        <i class="fa-solid fa-building"></i> จัดการอาคาร
    </a>
</form>

<?php if (is_admin($user)): ?>
<details class="mb-4 bg-slate-900 border border-slate-800 rounded-xl p-3">
    <summary class="text-xs font-heading font-semibold text-emerald-400 cursor-pointer select-none">
        <i class="fa-solid fa-plus-circle mr-1"></i> เพิ่มห้องใหม่ใน <?= e($bld['short_name']) ?> ชั้น <?= $f ?>
    </summary>
    <form method="post" action="<?= e($back) ?>"
          data-confirm="ยืนยันการเพิ่มห้องใหม่ในอาคาร <?= e($bld['short_name']) ?> ใช่หรือไม่?"
          class="mt-3 grid sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="create">
        <input type="hidden" name="building_id" value="<?= e($b) ?>">
        <input type="hidden" name="floor" value="<?= $f ?>">
        <label class="block text-xs text-slate-300">รหัสห้อง (ID)
            <input name="id" required maxlength="16" placeholder="เช่น R<?= e($b) ?><?= $f ?>1" class="mt-1 <?= INPUT_CLS ?>">
        </label>
        <label class="block text-xs text-slate-300">หมายเลขห้อง
            <input name="room_no" required maxlength="20" placeholder="เช่น <?= $f ?>01" class="mt-1 <?= INPUT_CLS ?>">
        </label>
        <label class="block text-xs text-slate-300 sm:col-span-2">กลุ่มงานที่ครอง
            <select name="department_id" class="mt-1 <?= INPUT_CLS ?>">
                <option value="">— ยังไม่ระบุ (ห้องว่าง) —</option>
                <?= dept_options($depts, null, false) ?>
            </select>
        </label>
        <div class="sm:col-span-4 flex justify-end">
            <button class="<?= BTN_PRIMARY ?>">บันทึกห้องใหม่</button>
        </div>
    </form>
</details>
<?php endif; ?>

<div class="grid lg:grid-cols-2 gap-4">
    <div>
        <p class="text-xs text-slate-400 mb-2"><?= is_admin($user)
            ? 'ลากกล่องเพื่อย้ายห้อง ลากมุมสีเหลืองเพื่อปรับขนาด (ละเอียด 0.1 ม.) บันทึกเมื่อปล่อย'
            : 'ผังชั้น (เฉพาะผู้ดูแลระบบแก้ตำแหน่งได้)' ?></p>
<?php
$W = $bld['width']; $D = $bld['depth']; $pad = 1.2;
?>
        <svg id="plan" viewBox="<?= -$W / 2 - $pad ?> <?= -$D / 2 - $pad ?> <?= $W + $pad * 2 ?> <?= $D + $pad * 2 ?>"
             data-w="<?= $W ?>" data-d="<?= $D ?>" role="img" aria-label="ผัง <?= e($bld['short_name']) ?> ชั้น <?= $f ?>"
             class="w-full bg-slate-900 rounded-xl border border-slate-800 touch-none select-none">
            <rect x="<?= -$W / 2 ?>" y="<?= -$D / 2 ?>" width="<?= $W ?>" height="<?= $D ?>" fill="#1e293b" stroke="#64748b" stroke-width="0.08"/>
<?php for ($x = (int)ceil(-$W / 2); $x <= $W / 2; $x++): ?>
            <line x1="<?= $x ?>" y1="<?= -$D / 2 ?>" x2="<?= $x ?>" y2="<?= $D / 2 ?>" stroke="#334155" stroke-width="0.02"/>
<?php endfor; ?>
            <text x="0" y="<?= $D / 2 + 0.9 ?>" font-size="0.55" fill="#94a3b8" text-anchor="middle">▼ ด้านทิศใต้ (หน้าอาคาร / ลานกลาง)</text>
<?php foreach ($rooms as $r):
    $dept = $r['department_id'] ? ($deptById[$r['department_id']] ?? null) : null; ?>
            <g class="plan-room<?= is_admin($user) ? ' cursor-move' : '' ?>" data-room="<?= e($r['id']) ?>"
               data-lx="<?= $r['lx'] ?>" data-lz="<?= $r['lz'] ?>" data-w="<?= $r['w'] ?>" data-d="<?= $r['d'] ?>">
                <title><?= e($r['room_no'] . ' ' . ($dept['name'] ?? $r['label'])) ?></title>
                <rect class="plan-body" x="<?= $r['lx'] - $r['w'] / 2 ?>" y="<?= $r['lz'] - $r['d'] / 2 ?>" width="<?= $r['w'] ?>" height="<?= $r['d'] ?>"
                      rx="0.15" fill="<?= e($colors[$dept['type'] ?? ''] ?? '#475569') ?>" fill-opacity="0.75" stroke="#e2e8f0" stroke-width="0.06"/>
                <text x="<?= $r['lx'] ?>" y="<?= $r['lz'] + 0.18 ?>" font-size="0.5" fill="#fff" text-anchor="middle" pointer-events="none"><?= e($r['room_no']) ?></text>
<?php if (is_admin($user)): ?>
                <rect class="plan-handle cursor-nwse-resize" x="<?= $r['lx'] + $r['w'] / 2 - 0.6 ?>" y="<?= $r['lz'] + $r['d'] / 2 - 0.6 ?>" width="0.6" height="0.6" fill="#facc15"/>
<?php endif; ?>
            </g>
<?php endforeach; ?>
        </svg>
<?php if (is_admin($user)): ?>
        <form id="move-form" method="post" action="<?= e($back) ?>" class="hidden">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="move">
            <input type="hidden" name="room_id"><input type="hidden" name="lx"><input type="hidden" name="lz">
            <input type="hidden" name="w"><input type="hidden" name="d">
        </form>
<?php endif; ?>
    </div>

    <div>
<?php table_start(is_admin($user) ? ['ห้อง', 'กลุ่มงานที่ครอง', 'ตำแหน่ง (ม.)', 'จัดการ'] : ['ห้อง', 'กลุ่มงานที่ครอง', 'ตำแหน่ง (ม.)']);
foreach ($rooms as $r): ?>
        <tr>
            <td class="px-3 py-2 align-top"><b><?= e($r['room_no']) ?></b><div class="text-xs text-slate-400"><?= e($r['id']) ?></div></td>
            <td class="px-3 py-2 align-top">
<?php if (is_admin($user)): ?>
                <form method="post" action="<?= e($back) ?>" class="flex gap-1">
                    <?= csrf_field() ?><input type="hidden" name="action" value="assign"><input type="hidden" name="room_id" value="<?= e($r['id']) ?>">
                    <select name="department_id" data-autosubmit aria-label="กลุ่มงานของห้อง <?= e($r['room_no']) ?>" class="<?= INPUT_CLS ?>"><?= dept_options($depts, $r['department_id'], true) ?></select>
                    <noscript><button class="<?= BTN_GHOST ?>">บันทึก</button></noscript>
                </form>
<?php else: ?>
                <?= e($r['department_id'] ? ($deptById[$r['department_id']]['name'] ?? '') : '— ว่าง —') ?>
<?php endif; ?>
            </td>
            <td class="px-3 py-2 align-top"><span class="text-xs text-slate-400 font-mono">x <?= $r['lx'] ?> z <?= $r['lz'] ?> · <?= $r['w'] ?>×<?= $r['d'] ?></span></td>
<?php if (is_admin($user)): ?>
            <td class="px-3 py-2 align-top text-right">
                <form method="post" action="<?= e($back) ?>" data-confirm="⚠️ ยืนยันการลบห้อง &quot;<?= e($r['room_no']) ?>&quot; (<?= e($r['id']) ?>) ออกจากระบบหรือไม่?">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="delete">
                    <input type="hidden" name="room_id" value="<?= e($r['id']) ?>">
                    <button class="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 rounded hover:bg-rose-950/60" title="ลบห้อง"><i class="fa-solid fa-trash"></i></button>
                </form>
            </td>
<?php endif; ?>
        </tr>
<?php endforeach;
table_end(); ?>
    </div>
</div>
<?php page_end();
