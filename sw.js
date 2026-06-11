const CACHE_NAME = 'pipemusic-v2'; // Меняй версию (v2, v3...), когда кардинально меняешь дизайн сайта
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

// Установка воркера и кэширование только статичной оболочки
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Принудительно активируем новый воркер сразу
  );
});

// Активация и очистка старых кэшей
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
    }).then(() => self.clients.claim()) // Перехватываем управление страницей сразу
  );
});

// Сетевые запросы
self.addEventListener('fetch', (e) => {
  // 1. Аудиофайлы вообще игнорируем, они всегда стримятся напрямую
  if (e.request.url.includes('.mp3')) {
    return;
  }

  // 2. СТРАТЕГИЯ ДЛЯ MUSIC.JSON: Сначала сеть, если сбой — кэш
  if (e.request.url.includes('music.json')) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // Если ответ успешный, обновляем его копию в кэше на всякий случай
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        })
        .catch(() => {
          // Если интернета нет, отдаем из кэша
          return caches.match(e.request);
        })
    );
    return;
  }
  
  // 3. Для остальных файлов (html, css, js) — сначала кэш
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
