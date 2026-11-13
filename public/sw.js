// Offline support for the public viewer.
// Shell (html/js/css/json) and snapshot API: network-first, cached copy when offline.
// Fonts/images: cache-first. Bump VERSION to purge old caches.
// Admin and other API routes are never cached.
const VERSION = 'ssj3d-v13';
const SHELL = [
    './', 'index.html', 'js/app.js', 'manifest.webmanifest', 'assets/icon.svg', 'data/snapshot.json',
    'vendor/app.css', 'vendor/fonts.css', 'vendor/three.min.js', 'vendor/fontawesome/css/all.min.css',
    'vendor/fontawesome/webfonts/fa-solid-900.woff2', 'vendor/fontawesome/webfonts/fa-regular-400.woff2',
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys()
        .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
        .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
    if (url.pathname.includes('/admin/')) return;

    if (url.pathname.endsWith('/api/v1/snapshot')) {
        e.respondWith(fetch(e.request)
            .then(res => {
                if (res.ok) {
                    const copy = res.clone();
                    caches.open(VERSION).then(c => c.put(e.request, copy));
                }
                return res;
            })
            .catch(() => caches.match(e.request).then(r => r || Response.error())));
        return;
    }
    if (url.pathname.includes('/api/')) return;

    // Fonts/images rarely change: cache-first.
    if (/\.(woff2|jpg|png|svg)$/.test(url.pathname)) {
        e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
            if (res.ok) {
                const copy = res.clone();
                caches.open(VERSION).then(c => c.put(e.request, copy));
            }
            return res;
        })));
        return;
    }

    // HTML/JS/CSS/JSON: network-first so a deploy reaches users immediately; cache only when offline.
    const isPage = e.request.mode === 'navigate';
    e.respondWith(fetch(e.request)
        .then(res => {
            if (res.ok) {
                const copy = res.clone();
                caches.open(VERSION).then(c => c.put(isPage ? 'index.html' : e.request, copy));
            }
            return res;
        })
        .catch(() => caches.match(isPage ? 'index.html' : e.request).then(r => r || Response.error())));
});
