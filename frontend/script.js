const API_URL = 'http://localhost:3001/api';

let currentTrackIndex = 0;
let tracks = [];
let isPlaying = false;

const audio = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeSpan = document.getElementById('current-time');
const durationSpan = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');
const trackList = document.getElementById('track-list');
const currentTrackName = document.getElementById('current-track');
const trackStatus = document.getElementById('track-status');

// Load tracks from backend
async function loadTracks() {
  try {
    const response = await fetch(`${API_URL}/tracks`);
    tracks = await response.json();
    displayPlaylist();
    if (tracks.length > 0) {
      loadTrack(0);
    }
  } catch (error) {
    console.error('Error loading tracks:', error);
    trackStatus.textContent = 'Failed to load tracks. Make sure backend is running.';
  }
}

function displayPlaylist() {
  trackList.innerHTML = '';
  tracks.forEach((track, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="track-number">${index + 1}</span>
      <span class="track-title">${track.title}</span>
    `;
    li.addEventListener('click', () => loadTrack(index));
    if (index === currentTrackIndex) {
      li.classList.add('active');
    }
    trackList.appendChild(li);
  });
}

function loadTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  
  currentTrackIndex = index;
  const track = tracks[currentTrackIndex];
  
  audio.src = track.url;
  currentTrackName.textContent = track.title;
  
  // Update active playlist item
  document.querySelectorAll('#track-list li').forEach((li, i) => {
    if (i === currentTrackIndex) {
      li.classList.add('active');
    } else {
      li.classList.remove('active');
    }
  });
  
  if (isPlaying) {
    audio.play();
    trackStatus.textContent = 'Playing';
    playPauseBtn.textContent = '⏸️';
  } else {
    trackStatus.textContent = 'Paused';
  }
}

// Audio event listeners
audio.addEventListener('loadedmetadata', () => {
  durationSpan.textContent = formatTime(audio.duration);
  progressBar.max = audio.duration;
});

audio.addEventListener('timeupdate', () => {
  if (!isNaN(audio.currentTime)) {
    currentTimeSpan.textContent = formatTime(audio.currentTime);
    progressBar.value = audio.currentTime;
  }
});

audio.addEventListener('ended', () => {
  nextTrack();
});

audio.addEventListener('play', () => {
  isPlaying = true;
  playPauseBtn.textContent = '⏸️';
  trackStatus.textContent = 'Playing';
});

audio.addEventListener('pause', () => {
  isPlaying = false;
  playPauseBtn.textContent = '▶️';
  trackStatus.textContent = 'Paused';
});

// Control functions
function togglePlayPause() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function nextTrack() {
  loadTrack((currentTrackIndex + 1) % tracks.length);
  audio.play();
}

function prevTrack() {
  loadTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
  audio.play();
}

function seek(event) {
  audio.currentTime = event.target.value;
}

function setVolume() {
  audio.volume = volumeSlider.value;
}

// Helper functions
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Event listeners
playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);
progressBar.addEventListener('input', seek);
volumeSlider.addEventListener('input', setVolume);

// Initialize volume
setVolume();

// Load tracks on startup
loadTracks();
