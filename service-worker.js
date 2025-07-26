const CACHE_NAME = 'pace-clock-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/assets/sounds/start.mp3',
  '/assets/sounds/end_goal.mp3',
  '/assets/sounds/end_rest.mp3',
  '/icons/Icon-192.png',
  '/icons/Icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
