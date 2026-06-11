const CACHE_NAME = 'pipemusic-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './music.json'
];

// Установка воркера и кэширование оболочки приложения
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Активация и очистка старого кэша
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Сетевые запросы
self.addEventListener('fetch', (e) => {
  // Не кэшируем аудиофайлы mp3, стримим их напрямую
  if (e.request.url.includes('.mp3')) {
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
