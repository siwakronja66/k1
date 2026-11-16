<?php
declare(strict_types=1);
require __DIR__ . '/../../src/admin.php';

$user = admin_page();
$data = dashboard_summary($user);

// Helper for Thai Date Formatting
$thaiMonths = ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
$thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
$dayOfWeek = $thaiDays[(int)date('w')];
$dayNum = (int)date('j');
$monthName = $thaiMonths[(int)date('n')];
$yearThai = (int)date('Y') + 543;
$dateThaiFormatted = "วัน{$dayOfWeek}ที่ {$dayNum} {$monthName} พ.ศ. {$yearThai}";

page_start('ภาพรวมระบบ', 'dashboard.php', $user);
?>

<!-- ================= HERO WELCOME BANNER ================= -->
<div class="mb-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 rounded-2xl border border-emerald-500/30 p-5 shadow-2xl relative overflow-hidden">
    <div class="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-emerald-400">
        <i class="fa-solid fa-cube text-9xl"></i>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shrink-0 shadow-lg">
                <img src="../assets/logo-moph.png" alt="สสจ.มุกดาหาร" class="w-full h-full object-contain select-none">
            </div>
            <div>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-heading font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ระบบออนไลน์
                    </span>
                    <span class="text-xs font-heading text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                        Snapshot v<?= (int)$data['data_version'] ?>
                    </span>
                </div>
                <h1 class="text-xl font-heading font-bold text-white mt-1">
                    แผงควบคุมระบบ ผังอาคาร 3 มิติ สสจ.มุกดาหาร
                </h1>
                <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <i class="fa-regular fa-calendar text-emerald-400"></i> <?= $dateThaiFormatted ?> · เข้าใช้งานโดย: <span class="text-slate-200 font-semibold"><?= e($user['username']) ?></span> (<?= is_admin($user) ? 'ผู้ดูแลระบบสูงสุด' : 'ผู้แก้ไขกลุ่มงาน' ?>)
                </p>
            </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
            <a href="../" target="_blank" class="px-3.5 py-2 rounded-xl text-xs font-heading font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-2 transition active:scale-95">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> ดูหน้าผัง 3D (Live)
            </a>
            <a href="dashboard.php" class="px-3 py-2 rounded-xl text-xs font-heading bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition">
                <i class="fa-solid fa-rotate"></i> รีเฟรช
            </a>
        </div>
    </div>
</div>

<!-- ================= TOP KPI METRICS GRID ================= -->
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
    <!-- Card 1: Buildings -->
    <a href="buildings.php" class="group bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl p-4 border border-slate-800 hover:border-sky-500/50 shadow-lg transition flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-heading text-slate-400">อาคารในผัง 3D</span>
            <div class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm group-hover:scale-110 transition">
                <i class="fa-solid fa-building"></i>
            </div>
        </div>
        <div>
            <div class="text-2xl font-heading font-bold text-white"><?= (int)$data['bld_count'] ?> <span class="text-xs font-normal text-slate-400">อาคาร</span></div>
            <div class="text-[11px] text-sky-400 mt-1 truncate">2F · 4F · แผนไทย</div>
        </div>
    </a>

    <!-- Card 2: Rooms -->
    <a href="rooms.php" class="group bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/50 shadow-lg transition flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-heading text-slate-400">ห้อง & จุดบริการ</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm group-hover:scale-110 transition">
                <i class="fa-solid fa-door-open"></i>
            </div>
        </div>
        <div>
            <div class="text-2xl font-heading font-bold text-white"><?= (int)$data['rooms_count'] ?> <span class="text-xs font-normal text-slate-400">ห้อง</span></div>
            <div class="text-[11px] text-emerald-400 mt-1 truncate">ห้องประชุม <?= (int)$data['meeting_rooms_count'] ?> ห้อง</div>
        </div>
    </a>

    <!-- Card 3: Departments -->
    <a href="departments.php" class="group bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl p-4 border border-slate-800 hover:border-indigo-500/50 shadow-lg transition flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-heading text-slate-400">กลุ่มงาน / ฝ่าย</span>
            <div class="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm group-hover:scale-110 transition">
                <i class="fa-solid fa-sitemap"></i>
            </div>
        </div>
        <div>
            <div class="text-2xl font-heading font-bold text-white"><?= (int)$data['depts_count'] ?> <span class="text-xs font-normal text-slate-400">กลุ่มงาน</span></div>
            <div class="text-[11px] text-indigo-400 mt-1 truncate">พร้อมเบอร์โทรภายใน</div>
        </div>
    </a>

    <!-- Card 4: Bookings Today -->
    <a href="bookings.php" class="group bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl p-4 border border-slate-800 hover:border-amber-500/50 shadow-lg transition flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-heading text-slate-400">การจองวันนี้</span>
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm group-hover:scale-110 transition">
                <i class="fa-solid fa-calendar-day"></i>
            </div>
        </div>
        <div>
            <div class="text-2xl font-heading font-bold text-white"><?= count($data['bookings_today']) ?> <span class="text-xs font-normal text-slate-400">รายการ</span></div>
            <div class="text-[11px] text-amber-400 mt-1 truncate">7 วันหน้า: <?= (int)$data['upcoming_bookings_count'] ?> รายการ</div>
        </div>
    </a>

    <!-- Card 5: Photos Status -->
    <a href="photos.php" class="group bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl p-4 border border-slate-800 hover:border-purple-500/50 shadow-lg transition flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-heading text-slate-400">ภาพสถานที่จริง</span>
            <div class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm group-hover:scale-110 transition">
                <i class="fa-solid fa-camera-retro"></i>
            </div>
        </div>
        <div>
            <div class="text-2xl font-heading font-bold text-white"><?= (int)$data['photo_exists'] ?>/<?= (int)$data['photo_total'] ?> <span class="text-xs font-normal text-slate-400">รูป</span></div>
            <div class="text-[11px] mt-1 truncate">
                <?php if ($data['photo_exists'] >= $data['photo_total']): ?>
                    <span class="text-emerald-400">ครบสมบูรณ์ 100%</span>
                <?php else: ?>
                    <span class="text-amber-400">ขาด <?= count($data['missing_photos']) ?> รูป</span>
                <?php endif; ?>
            </div>
        </div>
    </a>

    <!-- Card 6: Searches (30 days) -->
    <a href="stats.php" class="group bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl p-4 border border-slate-800 hover:border-rose-500/50 shadow-lg transition flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-heading text-slate-400">ค้นหา (30 วัน)</span>
            <div class="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm group-hover:scale-110 transition">
                <i class="fa-solid fa-magnifying-glass"></i>
            </div>
        </div>
        <div>
            <div class="text-2xl font-heading font-bold text-white"><?= number_format((int)$data['total_searches']) ?> <span class="text-xs font-normal text-slate-400">ครั้ง</span></div>
            <div class="text-[11px] text-rose-400 mt-1 truncate">
                <?= !empty($data['search_stats']['top'][0]['q']) ? 'อันดับ 1: ' . e($data['search_stats']['top'][0]['q']) : 'บันทึกพร้อมใช้' ?>
            </div>
        </div>
    </a>
</div>

<!-- ================= MAIN TWO-COLUMN DASHBOARD ================= -->
<div class="grid lg:grid-cols-12 gap-6">

    <!-- ================= LEFT COLUMN: Activity & Core Operations (7/12) ================= -->
    <div class="lg:col-span-7 flex flex-col gap-6">

        <!-- 1. TODAY'S MEETING ROOM SCHEDULE -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-sm">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <div>
                        <h2 class="font-heading font-bold text-base text-white">ตารางการใช้ห้องประชุมวันนี้</h2>
                        <p class="text-xs text-slate-400">สถานะการประชุมที่จองไว้ประจำวัน</p>
                    </div>
                </div>
                <a href="bookings.php" class="px-3 py-1.5 rounded-xl text-xs font-heading font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition">
                    <i class="fa-solid fa-plus"></i> จองห้องประชุม
                </a>
            </div>

            <?php if (!empty($data['bookings_today'])): ?>
                <div class="space-y-3">
                    <?php foreach ($data['bookings_today'] as $bk): ?>
                        <div class="bg-slate-950/80 rounded-xl p-3.5 border <?= $bk['is_now'] ? 'border-rose-500/60 ring-1 ring-rose-500/40' : 'border-slate-800' ?> flex flex-wrap items-center justify-between gap-3">
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <?php if ($bk['is_now']): ?>
                                        <span class="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-heading font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 animate-pulse">
                                            ● กำลังใช้งานอยู่
                                        </span>
                                    <?php elseif ($bk['is_past']): ?>
                                        <span class="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-heading px-2 py-0.5 rounded-full">
                                            เสร็จสิ้นแล้ว
                                        </span>
                                    <?php else: ?>
                                        <span class="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full">
                                            ⏳ รอเริ่ม
                                        </span>
                                    <?php endif; ?>
                                    <span class="text-xs font-heading font-semibold text-slate-300">
                                        ห้อง <?= e($bk['room_no']) ?>
                                    </span>
                                </div>
                                <h3 class="text-sm font-heading font-bold text-white truncate"><?= e($bk['title']) ?></h3>
                                <p class="text-xs text-slate-400 mt-0.5 truncate">
                                    <?= e($bk['department_name'] ?? 'ไม่ระบุกลุ่มงาน') ?> · ผู้จอง: <?= e($bk['created_by_name'] ?? '-') ?>
                                </p>
                            </div>
                            <div class="text-right shrink-0">
                                <div class="text-xs font-heading font-bold text-emerald-400">
                                    <?= substr($bk['starts_at'], 11, 5) ?> - <?= substr($bk['ends_at'], 11, 5) ?> น.
                                </div>
                                <a href="../?room=<?= urlencode($bk['room_id']) ?>" target="_blank" class="mt-1 text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1">
                                    ดูผัง 3D <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                                </a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="py-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    <i class="fa-regular fa-calendar-check text-slate-600 text-3xl mb-2"></i>
                    <p class="text-sm font-heading font-medium text-slate-300">วันนี้ไม่มีรายการจองห้องประชุม</p>
                    <p class="text-xs text-slate-500 mt-1">ห้องประชุมทุกห้องว่างและพร้อมใช้งานตามปกติ</p>
                    <a href="bookings.php" class="inline-flex items-center gap-1.5 mt-3 text-xs font-heading text-emerald-400 hover:text-emerald-300">
                        <i class="fa-solid fa-plus-circle"></i> เปิดหน้าจองห้องประชุม
                    </a>
                </div>
            <?php endif; ?>
        </div>

        <!-- 2. ACTIONABLE ALERT: ZERO-HIT SEARCH QUERIES -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-sm">
                        <i class="fa-solid fa-circle-exclamation"></i>
                    </div>
                    <div>
                        <h2 class="font-heading font-bold text-base text-white">คำค้นหาที่ค้นแล้วไม่เจอห้อง (Zero-Hits)</h2>
                        <p class="text-xs text-slate-400">ประชาชนค้นหาคำเหล่านี้ แต่ยังไม่มีกลุ่มงานรองรับ (แนะนำให้เพิ่มทันที)</p>
                    </div>
                </div>
                <a href="stats.php" class="text-xs font-heading text-slate-400 hover:text-slate-200">
                    ดูทั้งหมด <i class="fa-solid fa-chevron-right text-[10px]"></i>
                </a>
            </div>

            <?php if (!empty($data['search_stats']['not_found'])): ?>
                <div class="space-y-2.5">
                    <?php 
                    $sliceNotFound = array_slice($data['search_stats']['not_found'], 0, 5);
                    foreach ($sliceNotFound as $nf): 
                    ?>
                        <div class="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <div class="flex items-center gap-2.5">
                                <span class="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-heading font-bold px-2.5 py-1 rounded-lg">
                                    "<?= e($nf['q']) ?>"
                                </span>
                                <span class="text-xs text-slate-400">
                                    ค้นหา <?= (int)$nf['zero'] ?> ครั้ง
                                </span>
                            </div>
                            <form method="post" action="services.php" class="flex items-center gap-1.5 min-w-[16rem]">
                                <?= csrf_field() ?>
                                <input type="hidden" name="action" value="create">
                                <input type="hidden" name="return" value="dashboard">
                                <input type="hidden" name="keyword" value="<?= e($nf['q']) ?>">
                                <select name="department_id" required aria-label="เลือกกลุ่มงาน" class="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1.5 flex-1 text-slate-200 outline-none focus:border-emerald-500">
                                    <?= dept_options($data['depts'], null) ?>
                                </select>
                                <button type="submit" class="px-2.5 py-1.5 rounded-lg text-xs font-heading font-medium bg-emerald-600 hover:bg-emerald-500 text-white shrink-0">
                                    + ผูกคำค้น
                                </button>
                            </form>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="py-6 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    <i class="fa-regular fa-circle-check text-emerald-500 text-2xl mb-1"></i>
                    <p class="text-sm font-heading text-slate-300">ยอดเยี่ยม! ไม่มีคำค้นที่ค้นแล้วไม่พบ</p>
                    <p class="text-xs text-slate-500">ประชาชนค้นหาข้อมูลแล้วเจอกลุ่มงานและห้องบริการถูกต้องครบถ้วน</p>
                </div>
            <?php endif; ?>
        </div>

        <!-- 3. RECENT ACTIVITY & AUDIT TRAIL (Admin Only) -->
        <?php if (is_admin($user) && !empty($data['recent_audits'])): ?>
            <div class="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
                <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-sm">
                            <i class="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <div>
                            <h2 class="font-heading font-bold text-base text-white">ความเคลื่อนไหวล่าสุดในระบบ</h2>
                            <p class="text-xs text-slate-400">ประวัติการปรับแต่งข้อมูลและตั้งค่าผัง 3D</p>
                        </div>
                    </div>
                    <a href="audit.php" class="text-xs font-heading text-slate-400 hover:text-slate-200">
                        บันทึกทั้งหมด <i class="fa-solid fa-chevron-right text-[10px]"></i>
                    </a>
                </div>
                <div class="divide-y divide-slate-800/80">
                    <?php foreach ($data['recent_audits'] as $au): ?>
                        <div class="py-2.5 flex items-center justify-between text-xs gap-3">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] shrink-0 font-bold">
                                    <?= strtoupper(substr($au['username'], 0, 1)) ?>
                                </span>
                                <div class="truncate">
                                    <span class="font-heading font-semibold text-slate-200"><?= e($au['username']) ?></span>
                                    <span class="text-slate-400 mx-1">·</span>
                                    <span class="font-mono text-emerald-400"><?= e($au['action']) ?></span>
                                    <span class="text-slate-400 mx-1">(<?= e($au['entity']) ?>: <?= e($au['entity_id']) ?>)</span>
                                </div>
                            </div>
                            <span class="text-slate-500 text-[11px] shrink-0 font-mono"><?= e($au['created_at']) ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endif; ?>

    </div>

    <!-- ================= RIGHT COLUMN: Quick Actions & System Health (5/12) ================= -->
    <div class="lg:col-span-5 flex flex-col gap-6">

        <!-- 1. QUICK ACTIONS GRID -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <h2 class="font-heading font-bold text-base text-white mb-3 flex items-center gap-2">
                <i class="fa-solid fa-bolt text-amber-400"></i> ทางลัดการจัดการด่วน
            </h2>
            <div class="grid grid-cols-2 gap-2.5">
                <a href="bookings.php" class="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 flex flex-col gap-1.5 transition group">
                    <i class="fa-solid fa-calendar-plus text-amber-400 text-base group-hover:scale-110 transition"></i>
                    <span class="text-xs font-heading font-semibold text-white">จองห้องประชุม</span>
                    <span class="text-[10px] text-slate-400 leading-tight">เพิ่มหรือยกเลิกการใช้ห้อง</span>
                </a>
                <a href="photos.php" class="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 flex flex-col gap-1.5 transition group">
                    <i class="fa-solid fa-cloud-arrow-up text-purple-400 text-base group-hover:scale-110 transition"></i>
                    <span class="text-xs font-heading font-semibold text-white">อัปโหลดรูปภาพ</span>
                    <span class="text-[10px] text-slate-400 leading-tight">ภาพสถานที่จริง 11 จุด</span>
                </a>
                <a href="buildings.php" class="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 flex flex-col gap-1.5 transition group">
                    <i class="fa-solid fa-cubes text-sky-400 text-base group-hover:scale-110 transition"></i>
                    <span class="text-xs font-heading font-semibold text-white">ปรับผังอาคาร 3D</span>
                    <span class="text-[10px] text-slate-400 leading-tight">ขนาด ความสูง สีอาคาร</span>
                </a>
                <a href="rooms.php" class="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 flex flex-col gap-1.5 transition group">
                    <i class="fa-solid fa-map-location-dot text-emerald-400 text-base group-hover:scale-110 transition"></i>
                    <span class="text-xs font-heading font-semibold text-white">จัดผังห้อง & ย้ายห้อง</span>
                    <span class="text-[10px] text-slate-400 leading-tight">พิกัดห้องและชั้น</span>
                </a>
                <a href="departments.php" class="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 flex flex-col gap-1.5 transition group">
                    <i class="fa-solid fa-users-gear text-indigo-400 text-base group-hover:scale-110 transition"></i>
                    <span class="text-xs font-heading font-semibold text-white">กลุ่มงาน & เบอร์โทร</span>
                    <span class="text-[10px] text-slate-400 leading-tight">เบอร์ต่อภายใน สสจ.</span>
                </a>
                <a href="qr.php" class="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 flex flex-col gap-1.5 transition group">
                    <i class="fa-solid fa-qrcode text-emerald-400 text-base group-hover:scale-110 transition"></i>
                    <span class="text-xs font-heading font-semibold text-white">พิมพ์ป้าย QR Code</span>
                    <span class="text-[10px] text-slate-400 leading-tight">ป้ายติดหน้าห้องจริง</span>
                </a>
            </div>
        </div>

        <!-- 2. CAMPUS BUILDINGS OVERVIEW -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <h2 class="font-heading font-bold text-base text-white flex items-center gap-2">
                    <i class="fa-solid fa-city text-sky-400"></i> โครงสร้างอาคาร สสจ.มุกดาหาร
                </h2>
                <a href="buildings.php" class="text-xs text-sky-400 hover:underline">แก้ไข</a>
            </div>
            <div class="space-y-2.5">
                <?php foreach ($data['buildings'] as $b): ?>
                    <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <span class="w-3.5 h-3.5 rounded-full shrink-0" style="background-color: <?= e($b['color']) ?>;"></span>
                            <div>
                                <h3 class="text-xs font-heading font-bold text-white"><?= e($b['name']) ?></h3>
                                <p class="text-[11px] text-slate-400"><?= e($b['short_name']) ?> · จำนวน <?= (int)$b['floors'] ?> ชั้น</p>
                            </div>
                        </div>
                        <span class="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                            <?= e($b['id']) ?>
                        </span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- 3. SYSTEM HEALTH & INFRASTRUCTURE WIDGET -->
        <div class="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <h2 class="font-heading font-bold text-base text-white mb-3 flex items-center gap-2">
                <i class="fa-solid fa-heart-pulse text-emerald-400"></i> สถานะสุขภาพระบบ (System Health)
            </h2>
            <div class="space-y-2.5 text-xs">
                <!-- Database -->
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span class="text-slate-400 flex items-center gap-2">
                        <i class="fa-solid fa-database text-sky-400"></i> ฐานข้อมูล
                    </span>
                    <span class="font-heading font-semibold text-emerald-300 flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> <?= e($data['server_version']) ?>
                    </span>
                </div>

                <!-- 3D Snapshot Cache -->
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span class="text-slate-400 flex items-center gap-2">
                        <i class="fa-solid fa-cubes text-emerald-400"></i> ผัง 3D Snapshot
                    </span>
                    <span class="font-heading font-semibold text-slate-200">
                        Version <?= (int)$data['data_version'] ?> (Active)
                    </span>
                </div>

                <!-- PHP & Image Optimizer -->
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span class="text-slate-400 flex items-center gap-2">
                        <i class="fa-brands fa-php text-indigo-400"></i> PHP & ระบบบีบอัดภาพ
                    </span>
                    <span class="font-heading font-semibold text-slate-200">
                        PHP <?= PHP_VERSION ?> (<?= extension_loaded('gd') ? 'GD Active' : 'No GD' ?>)
                    </span>
                </div>

                <!-- Storage & Assets Footprint -->
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span class="text-slate-400 flex items-center gap-2">
                        <i class="fa-solid fa-hard-drive text-amber-400"></i> พื้นที่รูปภาพ (Assets)
                    </span>
                    <span class="font-heading font-semibold text-slate-200">
                        <?= round($data['total_asset_bytes'] / 1024 / 1024, 2) ?> MB
                    </span>
                </div>

                <!-- PWA Service Worker -->
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span class="text-slate-400 flex items-center gap-2">
                        <i class="fa-solid fa-wifi text-purple-400"></i> แคชออฟไลน์ (PWA)
                    </span>
                    <span class="font-heading font-semibold text-emerald-300">
                        ssj3d-v16 (Online)
                    </span>
                </div>
            </div>
        </div>

    </div>

</div>

<?php page_end(); ?>
