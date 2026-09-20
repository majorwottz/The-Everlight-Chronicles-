(() => {
  const audio = document.getElementById('everlightAudio');
  const player = document.getElementById('musicPlayer');
  if (!audio || !player) return;

  const toggle = player.querySelector('[data-music-toggle]');
  const mute = player.querySelector('[data-music-mute]');
  const seek = player.querySelector('[data-music-seek]');
  const volume = player.querySelector('[data-music-volume]');
  const elapsed = player.querySelector('[data-music-elapsed]');
  const duration = player.querySelector('[data-music-duration]');
  const status = player.querySelector('[data-music-status]');
  const collapse = player.querySelector('[data-music-collapse]');

  const fmt = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const savedVolume = Number(sessionStorage.getItem('everlight-volume'));
  audio.volume = Number.isFinite(savedVolume) ? Math.min(1, Math.max(0, savedVolume)) : 0.34;
  volume.value = audio.volume;

  const savedTime = Number(sessionStorage.getItem('everlight-time'));
  if (Number.isFinite(savedTime) && savedTime > 0) audio.currentTime = savedTime;

  const updateState = () => {
    const playing = !audio.paused;
    toggle.textContent = playing ? '❚❚' : '▶';
    toggle.setAttribute('aria-label', playing ? 'Pause Shepard’s Calling' : 'Play Shepard’s Calling');
    player.classList.toggle('is-playing', playing);
    status.textContent = playing ? 'NOW PLAYING' : 'EVERLIGHT SOUNDTRACK';
    sessionStorage.setItem('everlight-playing', playing ? '1' : '0');
  };

  toggle.addEventListener('click', async () => {
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
    } catch (_) {
      player.classList.add('needs-tap');
    }
    updateState();
  });

  mute.addEventListener('click', () => {
    audio.muted = !audio.muted;
    mute.textContent = audio.muted ? '↗' : '⌕';
    mute.setAttribute('aria-label', audio.muted ? 'Unmute soundtrack' : 'Mute soundtrack');
  });

  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
    audio.muted = false;
    sessionStorage.setItem('everlight-volume', String(audio.volume));
  });

  seek.addEventListener('input', () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value) * audio.duration / 100;
  });

  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = fmt(audio.duration);
    if (Number.isFinite(savedTime) && savedTime < audio.duration) audio.currentTime = savedTime;
  });

  audio.addEventListener('timeupdate', () => {
    elapsed.textContent = fmt(audio.currentTime);
    seek.value = audio.duration ? String((audio.currentTime / audio.duration) * 100) : '0';
    sessionStorage.setItem('everlight-time', String(audio.currentTime));
  });

  audio.addEventListener('play', updateState);
  audio.addEventListener('pause', updateState);
  audio.addEventListener('ended', () => {
    sessionStorage.setItem('everlight-time', '0');
    updateState();
  });

  collapse.addEventListener('click', () => {
    player.classList.toggle('collapsed');
    collapse.textContent = player.classList.contains('collapsed') ? '♫' : '—';
    collapse.setAttribute('aria-label', player.classList.contains('collapsed') ? 'Open music player' : 'Minimize music player');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sessionStorage.setItem('everlight-time', String(audio.currentTime));
  });

  updateState();
})();
