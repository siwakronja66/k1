// Public API + data integrity checks. Needs the stack running; no login.
// Usage: node tests/public_api.test.mjs   (BASE_URL env overrides http://localhost:8090)
const BASE = process.env.BASE_URL || 'http://localhost:8090';
const results = [];
const check = (name, cond, extra = '') => results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`);

// --- snapshot shape + ETag
const res = await fetch(BASE + '/api/v1/snapshot');
const snap = await res.json();
const etag = res.headers.get('etag');
check('snapshot 200', res.status === 200);
check('snapshot has rooms/services/nav/bookings',
    Array.isArray(snap.rooms) && snap.rooms.length > 0 && Array.isArray(snap.services) && Array.isArray(snap.nav?.nodes) && Array.isArray(snap.bookings));
const r304 = await fetch(BASE + '/api/v1/snapshot', { headers: { 'If-None-Match': etag } });
check('ETag gives 304', r304.status === 304, `${etag} -> ${r304.status}`);

// --- no internal infrastructure words in public text
const publicText = JSON.stringify(snap.rooms.map(r => [r.name, r.desc, r.nameEn, r.descEn]));
check('no infra details in public text', !/proxmox|phpmyadmin|192\.168\.|10\.\d+\.\d+\.\d+/i.test(publicText));

// --- every room reachable on the nav graph (same rules as public/js/app.js: room links to 2 nearest nodes
//     on its building/floor). Room world position is approximated by building centre + local offset (rotation ignored).
const centres = { '2F': [-1.5, 8.5], '4F': [-3.2, -8.2], FDA: [-3.5, -19.5], TTM: [19.2, -13.5] };
const adj = new Map(snap.nav.nodes.map(n => [n.id, []]));
const byId = new Map(snap.nav.nodes.map(n => [n.id, n]));
const link = (a, b, w) => { adj.get(a).push([b, w]); adj.get(b).push([a, w]); };
for (const e of snap.nav.edges) {
    const A = byId.get(e.a), B = byId.get(e.b);
    link(e.a, e.b, Math.hypot(A.x - B.x, A.y - B.y, A.z - B.z));
}
for (const r of snap.rooms) {
    const c = centres[r.building];
    if (!c) continue;
    const id = 'room:' + r.id, x = c[0] + r.lx, z = c[1] + r.lz;
    adj.set(id, []);
    snap.nav.nodes.filter(n => n.buildingId === r.building && n.floor === r.floor)
        .map(n => [n, Math.hypot(n.x - x, n.z - z)]).sort((p, q) => p[1] - q[1]).slice(0, 2)
        .forEach(([n, d]) => link(id, n.id, d));
}
const reach = new Set(['ent_front']);
const queue = ['ent_front'];
while (queue.length) for (const [nb] of adj.get(queue.shift())) if (!reach.has(nb)) { reach.add(nb); queue.push(nb); }
const unreachable = snap.rooms.filter(r => !reach.has('room:' + r.id)).map(r => r.id);
check('every room reachable from main entrance', unreachable.length === 0, unreachable.join(','));

// --- search log: JSON only, normalised
const bad = await fetch(BASE + '/api/v1/search-log', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'q=x' });
check('search-log rejects form posts', bad.status === 415, bad.status);
const ok = await fetch(BASE + '/api/v1/search-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: 'test-query', results: 1 }) });
check('search-log accepts json', ok.status === 200, ok.status);

// --- removed / unknown routes
const gone = await fetch(BASE + '/api/v1/admin/departments');
check('no JSON admin API', gone.status === 404, gone.status);
const m405 = await fetch(BASE + '/api/v1/snapshot', { method: 'DELETE' });
check('wrong method 405', m405.status === 405, m405.status);

// --- src/ not web-reachable
const src = await fetch(BASE + '/../src/bootstrap.php');
const src2 = await fetch(BASE + '/src/bootstrap.php');
check('src/ not served', src.status === 404 || src2.status === 404, `${src.status}/${src2.status}`);

console.log(results.join('\n'));
const passed = results.filter(x => x.startsWith('PASS')).length;
console.log(`${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
