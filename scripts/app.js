/* ===================================================
   JUKEBOX PORTFOLIO — Main Application Logic
   Handles track selection, coin insert, keyboard nav,
   volume, and easter egg functionality
   =================================================== */

(function () {
  'use strict';

  // ---- Constants ----
  const TRACKS = ['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4'];
  const TRACK_NAMES = {
    a1: 'ABOUT ME',
    a2: 'SKILLS',
    a3: 'EXPERIENCE',
    a4: 'CERTIFICATIONS',
    b1: 'PROJECTS',
    b2: 'PROOF OF WORK',
    b3: 'CONTACT',
    b4: 'SECRET TRACK'
  };

  // ---- State ----
  let currentTrackIndex = 0;
  let volume = 50;
  let jukeboxStarted = false;
  const konamiSequence = [];
  const KONAMI_CODE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];

  // ---- DOM Elements ----
  const coinOverlay = document.getElementById('coinOverlay');
  const coinBtn = document.getElementById('coinBtn');
  const coinDrop = document.getElementById('coinDrop');
  const jukebox = document.getElementById('jukebox');
  const nowPlayingText = document.getElementById('nowPlayingText');
  const mainVinyl = document.getElementById('mainVinyl');
  const tonearm = document.getElementById('tonearm');
  const vinylLabel = document.getElementById('vinylLabel');
  const volDisplay = document.getElementById('volDisplay');
  const prevTrackBtn = document.getElementById('prevTrack');
  const nextTrackBtn = document.getElementById('nextTrack');
  const volUpBtn = document.getElementById('volUp');
  const volDownBtn = document.getElementById('volDown');
  const contactForm = document.getElementById('contactForm');

  // ---- Initialize ----
  function init() {
    setupCoinInsert();
    setupTrackButtons();
    setupChannelNav();
    setupVolumeControls();
    setupKeyboardNav();
    setupContactForm();
    setupProjectFilters();

    // Check for saved state
    const savedTrack = sessionStorage.getItem('jukeboxTrack');
    const skipCoin = sessionStorage.getItem('jukeboxStarted');
    if (skipCoin) {
      skipCoinAnimation();
    }
    if (savedTrack && TRACKS.includes(savedTrack)) {
      currentTrackIndex = TRACKS.indexOf(savedTrack);
      selectTrack(savedTrack, false);
    }
  }

  // ---- Coin Insert ----
  function setupCoinInsert() {
    coinBtn.addEventListener('click', handleCoinInsert);
    // Also allow Enter/Space on overlay
    coinOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCoinInsert();
      }
    });
  }

  function handleCoinInsert() {
    if (jukeboxStarted) return;
    jukeboxStarted = true;

    // Coin drop animation
    coinDrop.classList.add('dropping');
    coinBtn.disabled = true;

    // Play click sound effect (visual only since no audio file)
    setTimeout(() => {
      coinOverlay.classList.add('hidden');
      jukebox.classList.add('active');
      sessionStorage.setItem('jukeboxStarted', 'true');

      // Start vinyl spinning
      mainVinyl.classList.add('spinning');
      tonearm.classList.add('playing');

      // Load GitHub data
      if (typeof GitHubAPI !== 'undefined') {
        GitHubAPI.loadAll();
      }
    }, 900);
  }

  function skipCoinAnimation() {
    jukeboxStarted = true;
    coinOverlay.classList.add('hidden');
    jukebox.classList.add('active');
    mainVinyl.classList.add('spinning');
    tonearm.classList.add('playing');

    // Load GitHub data
    setTimeout(() => {
      if (typeof GitHubAPI !== 'undefined') {
        GitHubAPI.loadAll();
      }
    }, 300);
  }

  // ---- Track Selection ----
  function setupTrackButtons() {
    document.querySelectorAll('.track-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const track = btn.dataset.track;
        selectTrack(track);
      });
    });
  }

  function selectTrack(trackId, animate = true) {
    trackId = trackId.toLowerCase();
    if (!TRACKS.includes(trackId)) return;

    currentTrackIndex = TRACKS.indexOf(trackId);
    sessionStorage.setItem('jukeboxTrack', trackId);

    // Update active button
    document.querySelectorAll('.track-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.track === trackId);
    });

    // Update screen content
    document.querySelectorAll('.screen-content').forEach(section => {
      section.classList.remove('active');
    });
    const targetSection = document.getElementById(`section-${trackId}`);
    if (targetSection) {
      targetSection.classList.add('active');
      targetSection.scrollTop = 0;
    }

    // Update NOW PLAYING
    const trackName = TRACK_NAMES[trackId] || trackId.toUpperCase();
    nowPlayingText.textContent = `NOW PLAYING: ${trackName}`;

    // Update vinyl label
    if (vinylLabel) {
      const labelText = vinylLabel.querySelector('.vinyl-record__label-text');
      if (labelText) {
        labelText.textContent = trackId.toUpperCase();
      }
    }

    // Button press feedback
    if (animate) {
      const activeBtn = document.querySelector(`.track-btn[data-track="${trackId}"]`);
      if (activeBtn) {
        activeBtn.style.animation = 'buttonPress 0.2s ease';
        setTimeout(() => { activeBtn.style.animation = ''; }, 200);
      }

      // Needle lift effect
      if (tonearm) {
        tonearm.classList.remove('playing');
        setTimeout(() => tonearm.classList.add('playing'), 300);
      }
    }

    // Load project data when switching to B1 or B2 for the first time
    if (trackId === 'b1' && typeof GitHubAPI !== 'undefined') {
      GitHubAPI.loadProjects();
    }
    if (trackId === 'b2' && typeof GitHubAPI !== 'undefined') {
      GitHubAPI.loadStats();
    }
  }

  // Make selectTrack available globally (used by inline onclick in HTML)
  window.selectTrack = selectTrack;

  // ---- Channel Navigation ----
  function setupChannelNav() {
    prevTrackBtn.addEventListener('click', () => navigateTrack(-1));
    nextTrackBtn.addEventListener('click', () => navigateTrack(1));
  }

  function navigateTrack(direction) {
    currentTrackIndex += direction;
    if (currentTrackIndex < 0) currentTrackIndex = TRACKS.length - 1;
    if (currentTrackIndex >= TRACKS.length) currentTrackIndex = 0;
    selectTrack(TRACKS[currentTrackIndex]);
  }

  // ---- Volume Controls ----
  function setupVolumeControls() {
    volUpBtn.addEventListener('click', () => changeVolume(10));
    volDownBtn.addEventListener('click', () => changeVolume(-10));
  }

  function changeVolume(delta) {
    volume = Math.max(0, Math.min(100, volume + delta));
    volDisplay.textContent = volume;

    // Visual feedback — animate display
    volDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => { volDisplay.style.transform = 'scale(1)'; }, 150);
  }

  // ---- Keyboard Navigation ----
  function setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // Don't intercept when typing in form fields
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      // Coin insert on any key if overlay is showing
      if (!jukeboxStarted) {
        handleCoinInsert();
        return;
      }

      const key = e.key.toLowerCase();

      // Track selection: letter + number combos
      // Handle 'a' or 'b' as prefix
      if (key === 'a' || key === 'b') {
        // Wait for next key (number)
        const handler = (e2) => {
          const num = e2.key;
          if (['1', '2', '3', '4'].includes(num)) {
            selectTrack(key + num);
          }
          document.removeEventListener('keydown', handler);
        };
        document.addEventListener('keydown', handler, { once: true });
        return;
      }

      // Arrow navigation
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateTrack(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateTrack(1);
          break;
        case 'ArrowRight':
          changeVolume(5);
          break;
        case 'ArrowLeft':
          changeVolume(-5);
          break;
        case 'Escape':
          // Go back to A1
          selectTrack('a1');
          break;
        case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8':
          // Direct number: 1-8 maps to tracks
          const idx = parseInt(e.key) - 1;
          if (idx >= 0 && idx < TRACKS.length) {
            selectTrack(TRACKS[idx]);
          }
          break;
      }

      // Konami code detection
      checkKonami(e.key);
    });
  }

  // ---- Konami Code Easter Egg ----
  function checkKonami(key) {
    konamiSequence.push(key);
    if (konamiSequence.length > KONAMI_CODE.length) {
      konamiSequence.shift();
    }
    if (konamiSequence.length === KONAMI_CODE.length &&
        konamiSequence.every((k, i) => k.toLowerCase() === KONAMI_CODE[i].toLowerCase())) {
      activateKonami();
      konamiSequence.length = 0;
    }
  }

  function activateKonami() {
    // Jump to secret track
    selectTrack('b4');

    // Fun visual: rainbow neon
    const neons = document.querySelectorAll('.neon');
    const colors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'];
    let i = 0;

    const interval = setInterval(() => {
      neons.forEach((neon, idx) => {
        const color = colors[(i + idx) % colors.length];
        neon.style.color = color;
        neon.style.textShadow = `0 0 7px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`;
      });
      i++;
      if (i > 30) {
        clearInterval(interval);
        // Reset colors
        neons.forEach(neon => {
          neon.style.color = '';
          neon.style.textShadow = '';
        });
      }
    }, 150);

    // Spin vinyl fast
    mainVinyl.style.animationDuration = '0.3s';
    setTimeout(() => { mainVinyl.style.animationDuration = ''; }, 5000);
  }

  // ---- Contact Form ----
  function setupContactForm() {
    if (!contactForm) return;
    contactForm.addEventListener('submit', handleContactSubmit);
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');
    const submitBtn = form.querySelector('#submitBtn');
    const formSuccess = form.querySelector('#formSuccess');

    // Clear errors
    clearErrors();

    // Validate
    let valid = true;
    if (!name.value.trim()) {
      showError('nameError', 'Name is required');
      valid = false;
    }
    if (!email.value.trim() || !isValidEmail(email.value)) {
      showError('emailError', 'Valid email is required');
      valid = false;
    }
    if (!message.value.trim()) {
      showError('messageError', 'Message is required');
      valid = false;
    }
    if (!valid) return;

    // "Sending" state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate sending (no backend)
    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      formSuccess.hidden = false;
      form.reset();

      // Open mailto
      const subject = encodeURIComponent(`Portfolio Contact from ${name.value}`);
      const body = encodeURIComponent(`Name: ${name.value}\nEmail: ${email.value}\n\n${message.value}`);
      window.location.href = `mailto:punangisha@gmail.com?subject=${subject}&body=${body}`;

      setTimeout(() => { formSuccess.hidden = true; }, 5000);
    }, 1500);
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => { el.textContent = ''; });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ---- Project Filters ----
  function setupProjectFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterProjects(filter);
      });
    });
  }

  function filterProjects(filter) {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      const source = card.dataset.source || 'github';
      if (filter === 'all' || source === filter) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Make filterProjects available
  window.filterProjects = filterProjects;

  // ---- Start ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
