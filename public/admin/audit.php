<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();
if (!is_admin($user)) {
    flash('เฉพาะผู้ดูแลระบบ', false);
    redirect('departments.php');
}
$entries = audit_list($user, 200);

page_start('บันทึกการแก้ไข', 'audit.php', $user);
?>
<h1 class="font-heading font-bold text-lg mb-3">บันทึกการแก้ไข (200 รายการล่าสุด)</h1>
<?php table_start(['เวลา', 'ผู้ใช้', 'การกระทำ', 'รายการ', 'การเปลี่ยนแปลง', 'IP']);
foreach ($entries as $a): ?>
    <tr>
        <td class="px-3 py-2 whitespace-nowrap text-xs"><?= e($a['created_at']) ?></td>
        <td class="px-3 py-2"><?= e($a['username']) ?></td>
        <td class="px-3 py-2"><?= e($a['action']) ?></td>
        <td class="px-3 py-2"><?= e($a['entity'] . ' #' . $a['entity_id']) ?></td>
        <td class="px-3 py-2 text-xs text-slate-300 break-all"><?= e(audit_diff($a['before_json'], $a['after_json'])) ?></td>
        <td class="px-3 py-2 text-xs text-slate-500"><?= e($a['ip']) ?></td>
    </tr>
<?php endforeach;
table_end();
page_end();
