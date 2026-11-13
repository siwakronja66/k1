<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();

if (is_post()) {
    $action = (string)($_POST['action'] ?? '');
    handle_post(function () use ($user, $action) {
        if ($action === 'create') {
            booking_create($user, $_POST);
            return 'จองห้องแล้ว';
        }
        if ($action === 'delete') {
            booking_delete($user, (int)($_POST['id'] ?? 0));
            return 'ยกเลิกการจองแล้ว';
        }
        throw new HttpError(400, 'คำสั่งไม่ถูกต้อง');
    }, 'bookings.php');
}

$depts = dept_list($user);
$rooms = meeting_rooms();
$bookings = booking_list($user, date('Y-m-d'));
// Default slot: next half hour, 1 hour long
$start = (new DateTimeImmutable())->setTime((int)date('H'), (int)date('i') < 30 ? 30 : 0);
if ((int)date('i') >= 30) {
    $start = $start->modify('+1 hour');
}
$end = $start->modify('+1 hour');

page_start('จองห้องประชุม', 'bookings.php', $user);
?>
<h1 class="font-heading font-bold text-lg mb-1">จองห้องประชุม</h1>
<p class="text-xs text-amber-300 mb-3">หัวข้อการประชุมแสดงบนผังสาธารณะและจอ kiosk: ห้ามใส่ข้อมูลลับ ชื่อผู้ป่วย หรือข้อมูลส่วนบุคคล</p>
<?php if ($rooms): ?>
<form method="post" action="bookings.php" class="grid sm:grid-cols-2 lg:grid-cols-6 gap-2 items-end mb-4">
    <?= csrf_field() ?><input type="hidden" name="action" value="create">
    <label class="block text-sm text-slate-300">ห้อง
        <select name="room_id" required class="mt-1 <?= INPUT_CLS ?>">
<?php foreach ($rooms as $r): ?>
            <option value="<?= e($r['id']) ?>">ห้อง <?= e($r['room_no'] . ' ' . $r['name']) ?></option>
<?php endforeach; ?>
        </select>
    </label>
    <label class="block text-sm text-slate-300 lg:col-span-2">หัวข้อ (แสดงต่อสาธารณะ)
        <input name="title" required maxlength="200" class="mt-1 <?= INPUT_CLS ?>">
    </label>
    <label class="block text-sm text-slate-300">เริ่ม
        <input name="starts_at" type="datetime-local" required value="<?= e($start->format('Y-m-d\TH:i')) ?>" class="mt-1 <?= INPUT_CLS ?>">
    </label>
    <label class="block text-sm text-slate-300">สิ้นสุด
        <input name="ends_at" type="datetime-local" required value="<?= e($end->format('Y-m-d\TH:i')) ?>" class="mt-1 <?= INPUT_CLS ?>">
    </label>
    <label class="block text-sm text-slate-300">ผู้จัด
        <select name="department_id" class="mt-1 <?= INPUT_CLS ?>"><?= dept_options($depts, $user['department_id'], true) ?></select>
    </label>
    <div class="lg:col-span-6"><button class="<?= BTN_PRIMARY ?>">+ จองห้อง</button></div>
</form>
<?php else: ?>
<p class="text-sm text-amber-300 mb-3">ยังไม่มีห้องประชุม: ตั้งประเภทกลุ่มงานของห้องเป็น "ห้องประชุม" ก่อน</p>
<?php endif;
table_start(['ห้อง', 'หัวข้อ', 'ผู้จัด', 'เริ่ม', 'สิ้นสุด', 'ผู้จอง', '']);
foreach ($bookings as $b): ?>
    <tr>
        <td class="px-3 py-2"><?= e($b['room_no']) ?></td>
        <td class="px-3 py-2"><?= e($b['title']) ?></td>
        <td class="px-3 py-2"><?= e($b['department_name'] ?? '—') ?></td>
        <td class="px-3 py-2 whitespace-nowrap"><?= e($b['starts_at']) ?></td>
        <td class="px-3 py-2 whitespace-nowrap"><?= e($b['ends_at']) ?></td>
        <td class="px-3 py-2"><?= e($b['created_by_name'] ?? '—') ?></td>
        <td class="px-3 py-2">
<?php if ($b['can_delete']): ?>
            <form method="post" action="bookings.php" data-confirm="ยกเลิกการจอง &quot;<?= e($b['title']) ?>&quot; <?= e($b['starts_at']) ?>?">
                <?= csrf_field() ?><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int)$b['id'] ?>">
                <button class="<?= BTN_DANGER ?>">ยกเลิก</button>
            </form>
<?php endif; ?>
        </td>
    </tr>
<?php endforeach;
table_end();
page_end();
