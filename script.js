let musicData = { albums: [] };
let currentAlbum = null;
let currentTrackIndex = -1;
let isRandomMode = false;
let allTracksGlobal = []; // Для рандомного режима

const audio = document.getElementById('main-audio');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    fetch('music.json')
        .then(res => res.json())
        .then(data => {
            musicData = data;
            buildGlobalTrackList();
            renderAlbums();
        });

    setupEventListeners();
});

// Собираем плоский список вообще всех треков для режима перемешивания
function buildGlobalTrackList() {
    allTracksGlobal = [];
    musicData.albums.forEach(album => {
        album.tracks.forEach((track, index) => {
            allTracksGlobal.push({
                ...track,
                albumId: album.id,
                albumTitle: album.title,
                albumCover: album.cover,
                indexInAlbum: index
            });
        });
    });
}

// Отображение главной страницы альбомов
function renderAlbums() {
    const grid = document.getElementById('albums-grid');
    grid.innerHTML = '';
    musicData.albums.forEach(album => {
        const card = document.createElement('div');
        card.className = 'album-card';
        card.innerHTML = `
            <img src="${album.cover}" alt="${album.title}">
            <h3>${album.title}</h3>
        `;
        card.addEventListener('click', () => openAlbum(album.id));
        grid.appendChild(card);
    });
}

// Открытие альбома
async function openAlbum(albumId) {
    currentAlbum = musicData.albums.find(a => a.id === albumId);
    isRandomMode = false;

    document.getElementById('albums-grid').classList.add('hidden');
    document.getElementById('album-view').classList.remove('hidden');

    document.getElementById('album-cover').src = currentAlbum.cover;
    document.getElementById('album-title').textContent = currentAlbum.title;
    
    // Пытаемся загрузить описание из txt
    const descEl = document.getElementById('album-desc');
    try {
        const response = await fetch(`music/${currentAlbum.folder}/description.txt`);
        descEl.textContent = response.ok ? await response.text() : "Описание отсутствует.";
    } catch {
        descEl.textContent = "Описание отсутствует.";
    }

    // Рендерим треклист
    const list = document.getElementById('track-list');
    list.innerHTML = '';
    currentAlbum.tracks.forEach((track, index) => {
        const li = document.createElement('li');
        li.className = `track-item ${currentTrackIndex === index && !isRandomMode ? 'active' : ''}`;
        li.innerHTML = `
            <div>
                <div>${track.title}</div>
                <small style="color: var(--text-muted)">${currentAlbum.title}</small>
            </div>
            <i class="fas fa-play" style="align-self: center;"></i>
        `;
        li.addEventListener('click', () => playTrack(index));
        list.appendChild(li);
    });
}

// Воспроизведение трека из текущего альбома
function playTrack(index) {
    if (!currentAlbum) return;
    isRandomMode = false;
    currentTrackIndex = index;
    const track = currentAlbum.tracks[index];

    loadAndPlay(track.title, currentAlbum.title, currentAlbum.cover, track.file);
    highlightActiveTrack();
}

// Общая функция загрузки трека в аудиоэлемент
function loadAndPlay(title, albumTitle, cover, src) {
    audio.src = src;
    document.getElementById('player-title').textContent = title;
    document.getElementById('player-album').textContent = albumTitle;
    document.getElementById('player-cover').src = cover;
    
    audio.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Переключение треков
function nextTrack() {
    if (isRandomMode) {
        playRandomTrack();
    } else if (currentAlbum) {
        if (currentTrackIndex < currentAlbum.tracks.length - 1) {
            playTrack(currentTrackIndex + 1);
        } else {
            // Альбом закончился -> включаем случайный трек из всей базы
            playRandomTrack();
        }
    }
}

function prevTrack() {
    if (!isRandomMode && currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
    }
}

// Включение абсолютно случайного трека
function playRandomTrack() {
    if (allTracksGlobal.length === 0) return;
    isRandomMode = true;
    
    const randomIndex = Math.floor(Math.random() * allTracksGlobal.length);
    const track = allTracksGlobal[randomIndex];
    
    // Переопределяем текущий индекс и альбом на случай, если захотим переключаться дальше
    currentAlbum = musicData.albums.find(a => a.id === track.albumId);
    currentTrackIndex = track.indexInAlbum;

    loadAndPlay(track.title, track.albumTitle, track.albumCover, track.file);
    highlightActiveTrack();
}

// Подсветка играющего трека на странице альбома
function highlightActiveTrack() {
    document.querySelectorAll('.track-item').forEach((item, idx) => {
        if (idx === currentTrackIndex && !isRandomMode) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Логика работы событий кнопок плеера
function setupEventListeners() {
    // Логотип ведет на главную
    document.getElementById('logo').addEventListener('click', () => {
        document.getElementById('album-view').classList.add('hidden');
        document.getElementById('albums-grid').classList.remove('hidden');
    });

    document.getElementById('back-btn').addEventListener('click', () => {
        document.getElementById('logo').click();
    });

    // Кнопка плей/пауза
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    audio.addEventListener('ended', nextTrack); // Автовоспроизведение дальше

    // Слушать рандом на главной
    document.getElementById('random-mode-btn').addEventListener('click', playRandomTrack);

    // Логика кастомной полосы перемотки
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.value = progress;
            currentTimeEl.textContent = formatTime(audio.currentTime);
            totalTimeEl.textContent = formatTime(audio.duration);
        }
    });

    progressBar.addEventListener('input', () => {
        const time = (progressBar.value / 100) * audio.duration;
        audio.currentTime = time;
    });

    // Поиск
    const searchToggle = document.getElementById('search-toggle-btn');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchToggle.addEventListener('click', () => {
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) searchInput.focus();
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        if (!query) return;

        // Ищем по альбомам
        musicData.albums.forEach(album => {
            if (album.title.toLowerCase().includes(query)) {
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML = `<strong>Альбом:</strong> ${album.title}`;
                div.addEventListener('click', () => {
                    openAlbum(album.id);
                    searchBar.classList.add('hidden');
                });
                searchResults.appendChild(div);
            }
        });

        // Ищем по трекам
        allTracksGlobal.forEach(track => {
            if (track.title.toLowerCase().includes(query)) {
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML = `<strong>Трек:</strong> ${track.title} — <small>${track.albumTitle}</small>`;
                div.addEventListener('click', () => {
                    openAlbum(track.albumId).then(() => {
                        playTrack(track.indexInAlbum);
                    });
                    searchBar.classList.add('hidden');
                });
                searchResults.appendChild(div);
            }
        });
    });
}

function formatTime(secs) {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
