const CACHE_NAME = 'swim-pace-clock-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon.png',
  './start.mp3',
  './end_goal.mp3',
  './end_rest.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
