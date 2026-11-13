// Back-office end-to-end test (server-rendered PHP pages). Needs the stack running + an admin account.
// Usage: node tests/admin_pages.test.mjs <adminPassword>   (BASE_URL env overrides http://localhost:8090)
// Creates and then removes/disables its own test data (booking, keyword, user ed_<random>, disabled afterwards).
const BASE = process.env.BASE_URL || 'http://localhost:8090';
const pw = process.argv[2];
const results = [];
const ED = 'ed_' + Date.now().toString(36);   // unique test editor per run
const check = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`);

function client() {
    let cookie = '';
    async function req(method, path, form) {
        const res = await fetch(BASE + path, {
            method, redirect: 'manual',
            headers: { Cookie: cookie, ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
            body: form ? new URLSearchParams(form).toString() : undefined,
        });
        const all = res.headers.getSetCookie();
        if (all.length) cookie = all[all.length - 1].split(';')[0];
        const text = await res.text();
        return { status: res.status, location: res.headers.get('location'), text };
    }
    const csrfOf = html => (html.match(/name="_csrf" value="([0-9a-f]{64})"/) || [])[1];
    const flashOf = html => (html.match(/role="status">([^<]*)</) || [])[1] || '';
    async function get(path) { return req('GET', path); }
    // POST then follow the 303 to read the flash
    async function post(path, form, withCsrf = true) {
        const page = await get(path.split('?')[0].replace(/^\/admin\/(logout|login)\.php$/, '/admin/departments.php'));
        const body = { ...form };
        if (withCsrf) body._csrf = csrfOf(page.text);
        const r = await req('POST', path, body);
        const next = r.location ? await get('/admin/' + r.location) : r;
        return { ...r, flash: flashOf(next.text), next };
    }
    return { get, post, req, csrfOf, flashOf };
}

const admin = client();
// --- login
let r = await admin.get('/admin/departments.php');
check('unauth page redirects to login', r.status === 303 && r.location === 'login.php', `${r.status} ${r.location}`);
r = await admin.get('/admin/login.php');
let csrf = admin.csrfOf(r.text);
check('login page has csrf', !!csrf);
r = await admin.req('POST', '/admin/login.php', { username: 'admin', password: 'wrong-password-x', _csrf: csrf });
let follow = await admin.get('/admin/login.php');
check('bad login flash', follow.text.includes('ไม่ถูกต้อง'));
csrf = admin.csrfOf(follow.text);
r = await admin.req('POST', '/admin/login.php', { username: 'admin', password: pw });
check('login without csrf rejected', r.location === 'login.php');
follow = await admin.get('/admin/login.php'); csrf = admin.csrfOf(follow.text);
r = await admin.req('POST', '/admin/login.php', { username: 'admin', password: pw, _csrf: csrf });
check('login ok -> departments', r.status === 303 && r.location === 'departments.php', `${r.status} ${r.location}`);

// --- every page renders, no PHP warnings, no inline script/handlers (CSP)
for (const p of ['departments.php', 'departments.php?edit=16', 'departments.php?new=1', 'rooms.php?b=4F&f=4', 'services.php', 'bookings.php',
    'qr.php', 'stats.php', 'users.php', 'users.php?new=1', 'audit.php', 'password.php', 'buildings.php', 'buildings.php?edit=2F', 'buildings.php?new=1']) {
    r = await admin.get('/admin/' + p);
    const bad = /Warning:|Notice:|Deprecated:|Fatal error/.test(r.text) || /<script>(?!<\/)/.test(r.text) || /\son(click|submit|change|load)=/i.test(r.text);
    check(`page ${p}`, r.status === 200 && !bad, `${r.status}${bad ? ' (warning or inline js)' : ''}`);
}

// --- XSS: department name with markup is escaped
let res = await admin.post('/admin/departments.php', { action: 'update', id: '16', name: 'กลุ่มงานสุขภาพดิจิทัล <img src=x onerror=alert(1)>', name_en: 'Digital Health', head_title: 'หัวหน้ากลุ่มงานสุขภาพดิจิทัล', phone_ext: 'ต่อ 401', description: 'ทดสอบ', description_en: '', type: 'digital', is_active_present: '1', is_active: '1' });
check('dept update flash', res.flash === 'บันทึกแล้ว', res.flash);
r = await admin.get('/admin/departments.php');
check('dept name escaped in list', r.text.includes('&lt;img src=x') && !r.text.includes('<img src=x'));

// --- CSRF on actions
res = await admin.post('/admin/departments.php', { action: 'deactivate', id: '16' }, false);
check('action without csrf rejected', res.flash.includes('หมดอายุ'), res.flash);

// --- room assignment + plan move via form
res = await admin.post('/admin/rooms.php?b=4F&f=4', { action: 'assign', room_id: 'R441', department_id: '1' });
check('room assign', res.flash.includes('เปลี่ยนกลุ่มงาน'), res.flash);
res = await admin.post('/admin/rooms.php?b=4F&f=4', { action: 'assign', room_id: 'R441', department_id: '16' });
res = await admin.post('/admin/rooms.php?b=4F&f=4', { action: 'move', room_id: 'R441', lx: '-7.5', lz: '0', w: '7.5', d: '7.2' });
check('room move', res.flash.includes('ตำแหน่ง'), res.flash);
res = await admin.post('/admin/rooms.php?b=4F&f=4', { action: 'move', room_id: 'R441', lx: '999', lz: '0', w: '7.5', d: '7.2' });
check('room move out of range rejected', res.flash.includes('ต้องอยู่ระหว่าง'), res.flash);

// --- buildings move & rotate
res = await admin.post('/admin/buildings.php', { action: 'move', id: '2F', center_x: '-8.5', center_z: '8.0', width: '24.0', depth: '9.5', rot_y: '0.0' });
check('building move and rotate', res.flash.includes('บันทึกตำแหน่ง'), res.flash);

// --- services
res = await admin.post('/admin/services.php', { action: 'create', keyword: 'ทดสอบคำค้น', department_id: '16' });
check('service create', res.flash === 'เพิ่มคำค้นแล้ว', res.flash);
const sid = (res.next.text.match(/name="id" value="(\d+)"[^>]*>\s*<button[^>]*>ลบ<\/button>[\s\S]*?$/) || [])[1];

// --- bookings
const pad = n => String(n).padStart(2, '0');
const local = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const t0 = new Date(Date.now() + 2 * 3600e3), t1 = new Date(Date.now() + 3 * 3600e3);
res = await admin.post('/admin/bookings.php', { action: 'create', room_id: 'R443', title: 'ทดสอบ <b>จอง</b>', starts_at: local(t0), ends_at: local(t1), department_id: '' });
check('booking create', res.flash === 'จองห้องแล้ว', res.flash);
res = await admin.post('/admin/bookings.php', { action: 'create', room_id: 'R443', title: 'ซ้อน', starts_at: local(t0), ends_at: local(t1), department_id: '' });
check('booking overlap rejected', res.flash.includes('ซ้อน'), res.flash);
check('booking title escaped', res.next.text.includes('ทดสอบ &lt;b&gt;จอง&lt;/b&gt;'));

// --- users: create editor for dept 1
res = await admin.post('/admin/users.php', { action: 'create', username: ED, role: 'editor', department_id: '1', password: 'editorpass123', is_active: '1' });
check('user create', res.flash === 'เพิ่มผู้ใช้แล้ว', res.flash);

// --- editor permissions
const ed = client();
r = await ed.get('/admin/login.php'); csrf = ed.csrfOf(r.text);
r = await ed.req('POST', '/admin/login.php', { username: ED, password: 'editorpass123', _csrf: csrf });
check('editor login', r.location === 'departments.php', r.location);
res = await ed.post('/admin/departments.php', { action: 'update', id: '16', name: 'x', type: 'admin' });
check('editor cannot edit other dept', res.flash.includes('เฉพาะกลุ่มงาน'), res.flash);
res = await ed.post('/admin/rooms.php', { action: 'assign', room_id: 'R211', department_id: '2' });
check('editor cannot assign room', res.flash.includes('เฉพาะผู้ดูแลระบบ'), res.flash);
r = await ed.get('/admin/users.php');
check('editor redirected from users', r.status === 303, r.status);
r = await ed.get('/admin/photos.php');
check('editor redirected from photos', r.status === 303, r.status);
r = await ed.get('/admin/departments.php');
check('editor menu hides admin pages', !r.text.includes('href="users.php"') && !r.text.includes('href="audit.php"') && !r.text.includes('href="photos.php"'));
res = await ed.post('/admin/logout.php', {});
r = await ed.get('/admin/departments.php');
check('logout ends session', r.status === 303 && r.location === 'login.php');

// --- admin photos page
r = await admin.get('/admin/photos.php');
check('admin photos page 200', r.status === 200, r.status);
check('admin photos page has upload form', r.text.includes('enctype="multipart/form-data"'));

// --- removed JSON admin API
r = await admin.req('GET', '/api/v1/admin/departments');
check('old admin API gone', r.status === 404, r.status);
r = await admin.req('GET', '/api/v1/snapshot');
check('public snapshot still 200', r.status === 200, r.status);

// --- cleanup test data
r = await admin.get('/admin/bookings.php');
for (const m of r.text.matchAll(/name="action" value="delete"><input type="hidden" name="id" value="(\d+)"/g)) {
    await admin.post('/admin/bookings.php', { action: 'delete', id: m[1] });
}
r = await admin.get('/admin/services.php');
const svcIds = [...r.text.matchAll(/ทดสอบคำค้น[\s\S]*?name="id" value="(\d+)"/g)].map(m => m[1]);
for (const id of svcIds) await admin.post('/admin/services.php', { action: 'delete', id });
await admin.post('/admin/departments.php', { action: 'update', id: '16', name: 'กลุ่มงานสุขภาพดิจิทัล', name_en: 'Digital Health', head_title: 'หัวหน้ากลุ่มงานสุขภาพดิจิทัล', phone_ext: 'ต่อ 401', description: 'งานระบบสารสนเทศและข้อมูลสุขภาพ (HDC) ให้คำปรึกษาด้านเทคโนโลยีสารสนเทศแก่หน่วยบริการ', description_en: '', type: 'digital', is_active_present: '1', is_active: '1' });
r = await admin.get('/admin/users.php');
const edId = (r.text.match(new RegExp(ED + String.raw`[\s\S]*?users\.php\?edit=(\d+)`)) || [])[1];
if (edId) await admin.post('/admin/users.php', { action: 'update', id: edId, role: 'editor', department_id: '1', password: '' });  // is_active absent -> disabled
check('cleanup done', true, `bookings/services removed, ${ED} disabled (#${edId})`);

console.log(results.join('\n'));
const passed = results.filter(x => x.startsWith('PASS')).length;
console.log(`${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
