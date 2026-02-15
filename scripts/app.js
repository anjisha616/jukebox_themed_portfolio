/* ============================================================
   APP.JS — Main Application Controller
   Orchestrates all jukebox interactions, navigation, and
   section management for the portfolio
   ============================================================ */

'use strict';

const JukeboxApp = (() => {

  /* ===========================================================
     STATE
     =========================================================== */
  const state = {
    currentSection: null,
    previousSection: null,
    keyBuffer: '',        // For letter+number keyboard input
    keyTimeout: null,
    isBooted: false,
    projectEntries: [],   // Dynamic project entries from GitHub
    highContrast: false,
    carouselIndex: 0
  };

  // Section definitions — code → display info
  const SECTIONS = {
    A1: { name: 'About Me',       color: 'red',    icon: '👤' },
    A2: { name: 'Skills',         color: 'gold',   icon: '⚡' },
    A3: { name: 'Experience',     color: 'cyan',   icon: '💼' },
    A4: { name: 'Certifications', color: 'orange', icon: '📜' },
    B1: { name: 'Projects',       color: 'green',  icon: '🚀' },
    B2: { name: 'GitHub Stats',   color: 'purple', icon: '📊' },
    B3: { name: 'Contact',        color: 'pink',   icon: '✉️' },
    B4: { name: '???',            color: 'blue',   icon: '🎵' }
  };

  /* ===========================================================
     INITIALIZATION — Entry point
     =========================================================== */
  function init() {
    console.log('[Jukebox] Initializing...');

    // Start with coin overlay
    AnimationController.initCoinOverlay(() => {
      onBootComplete();
    });
  }

  function onBootComplete() {
    state.isBooted = true;
    console.log('[Jukebox] Boot complete!');

    // Setup all interactions
    setupButtonGrid();
    setupVinylCarousel();
    setupKeyboardNavigation();
    setupMusicToggle();
    setupContrastToggle();
    setupFilters();
    setupContactForm();
    setupMobileMenu();
    setupEasterEggs();

    // Initialize animation controllers
    AnimationController.initKonamiCode();
    AnimationController.initVolumeDial();

    // Fetch GitHub data asynchronously
    loadGitHubData();

    // Show welcome section
    showSection('welcome');

    // Announce to screen readers
    announceToSR('Jukebox portfolio loaded. Select a track to explore.');
  }

  /* ===========================================================
     SECTION NAVIGATION — Core "track switching" logic
     =========================================================== */
  function showSection(code) {
    const sectionId = code === 'welcome' ? 'section-welcome' : `section-${code}`;
    const newSection = document.getElementById(sectionId);

    if (!newSection) {
      console.warn(`[Jukebox] Section not found: ${sectionId}`);
      return;
    }

    const currentEl = document.querySelector('.content-section.active');

    // Don't re-navigate to same section
    if (currentEl && currentEl.id === sectionId) return;

    state.previousSection = state.currentSection;
    state.currentSection = code;

    // Play sound effects
    if (code !== 'welcome') {
      AudioManager.playRecordScratch();
      setTimeout(() => AudioManager.playConfirmation(), 300);
    }

    // Update button states
    updateButtonStates(code);

    // Update vinyl carousel
    updateCarouselActive(code);

    // Update record & now playing display
    const sectionInfo = SECTIONS[code] || findProjectEntry(code);
    if (sectionInfo) {
      AnimationController.updateNowPlaying(sectionInfo.name);
      AnimationController.updateRecordLabel(sectionInfo.name, code);
    } else if (code === 'welcome') {
      AnimationController.updateNowPlaying('WELCOME — SELECT A TRACK');
      AnimationController.updateRecordLabel('SELECT', '— ★ —');
    }

    // Animate record switch
    const record = document.getElementById('main-record');
    AnimationController.animateRecordSwitch(record, () => {
      // Transition sections
      AnimationController.transitionSection(currentEl, newSection);

      // Move tonearm
      AnimationController.moveTonearm(code !== 'welcome');
    });

    // Scroll content into view
    setTimeout(() => {
      const contentArea = document.getElementById('content-display');
      if (contentArea) {
        contentArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 500);

    // Announce to screen readers
    const name = sectionInfo?.name || 'Welcome';
    announceToSR(`Now playing: ${name}`);
  }

  function findProjectEntry(code) {
    return state.projectEntries.find(e => e.code === code);
  }

  /* ===========================================================
     BUTTON GRID — Click handlers for A1, B2, etc.
     =========================================================== */
  function setupButtonGrid() {
    const buttons = document.querySelectorAll('.juke-btn[data-code]');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.code;
        AudioManager.playButtonClick();
        AnimationController.animateButtonPress(btn);
        showSection(code);
      });
    });
  }

  function updateButtonStates(activeCode) {
    const buttons = document.querySelectorAll('.juke-btn[data-code]');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.code === activeCode);
    });
  }

  /* ===========================================================
     VINYL CAROUSEL — Mini record browsing
     =========================================================== */
  function setupVinylCarousel() {
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (!track) return;

    // Build mini vinyls for main sections
    const allSections = Object.entries(SECTIONS);
    allSections.forEach(([code, info]) => {
      const vinyl = createMiniVinyl(code, info.name, info.color);
      track.appendChild(vinyl);
    });

    // Arrow navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -70, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: 70, behavior: 'smooth' });
      });
    }
  }

  function createMiniVinyl(code, name, color) {
    const vinyl = document.createElement('div');
    vinyl.className = 'mini-vinyl';
    vinyl.setAttribute('data-code', code);
    vinyl.setAttribute('data-color', color);
    vinyl.setAttribute('role', 'option');
    vinyl.setAttribute('aria-label', `${code}: ${name}`);
    vinyl.tabIndex = 0;

    vinyl.innerHTML = `<div class="mini-vinyl__label">${code}</div>`;

    vinyl.addEventListener('click', () => {
      AudioManager.playButtonClick();
      showSection(code);
    });

    vinyl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        AudioManager.playButtonClick();
        showSection(code);
      }
    });

    return vinyl;
  }

  function updateCarouselActive(code) {
    const vinyls = document.querySelectorAll('.mini-vinyl');
    vinyls.forEach(v => {
      v.classList.toggle('active', v.dataset.code === code);
    });
  }

  /* ===========================================================
     KEYBOARD NAVIGATION
     Letter + Number (e.g., A then 1 = A1)
     Arrow keys for carousel, Escape for home
     =========================================================== */
  function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Don't capture when typing in form fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!state.isBooted) return;

      const key = e.key.toUpperCase();

      // Escape → return to welcome
      if (e.key === 'Escape') {
        showSection('welcome');
        return;
      }

      // Arrow keys → carousel navigation
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        navigateCarousel(e.key === 'ArrowRight' ? 1 : -1);
        return;
      }

      // Enter → select current carousel item
      if (e.key === 'Enter' && !e.target.closest('.juke-btn, .mini-vinyl, button, a')) {
        const activeVinyl = document.querySelector('.mini-vinyl.active');
        if (activeVinyl) {
          showSection(activeVinyl.dataset.code);
        }
        return;
      }

      // Letter + Number combination (A-H for rows, 1-4 for columns)
      if (/^[A-H]$/.test(key)) {
        state.keyBuffer = key;
        clearTimeout(state.keyTimeout);
        state.keyTimeout = setTimeout(() => {
          state.keyBuffer = '';
        }, 1500);
        return;
      }

      if (/^[1-4]$/.test(key) && state.keyBuffer) {
        const code = state.keyBuffer + key;
        state.keyBuffer = '';
        clearTimeout(state.keyTimeout);

        // Check if this section exists
        const section = document.getElementById(`section-${code}`);
        if (section || SECTIONS[code]) {
          AudioManager.playButtonClick();
          showSection(code);
        }
        return;
      }
    });
  }

  function navigateCarousel(direction) {
    const vinyls = Array.from(document.querySelectorAll('.mini-vinyl'));
    if (vinyls.length === 0) return;

    const currentIdx = vinyls.findIndex(v => v.classList.contains('active'));
    let newIdx = currentIdx + direction;

    if (newIdx < 0) newIdx = vinyls.length - 1;
    if (newIdx >= vinyls.length) newIdx = 0;

    const code = vinyls[newIdx].dataset.code;
    AudioManager.playButtonClick();
    showSection(code);

    // Scroll into view
    vinyls[newIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  /* ===========================================================
     MUSIC TOGGLE
     =========================================================== */
  function setupMusicToggle() {
    const btn = document.getElementById('music-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      AudioManager.init();
      const isPlaying = AudioManager.toggleMusic();
      btn.setAttribute('aria-pressed', isPlaying);

      const icon = document.getElementById('music-icon');
      if (icon) {
        icon.textContent = isPlaying ? '♫' : '♪';
      }
    });
  }

  /* ===========================================================
     HIGH CONTRAST TOGGLE
     =========================================================== */
  function setupContrastToggle() {
    const btn = document.getElementById('contrast-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      state.highContrast = !state.highContrast;
      document.body.classList.toggle('high-contrast', state.highContrast);
      AudioManager.playButtonClick();
    });
  }

  /* ===========================================================
     PROJECT FILTERS (All / GitHub / Figma)
     =========================================================== */
  function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter cards
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(card => {
          const type = card.dataset.type;
          if (filter === 'all' || type === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });

        // Show/hide figma section
        const figmaGrid = document.getElementById('figma-projects-grid');
        const figmaTitle = document.querySelector('.projects-subtitle');
        if (filter === 'github') {
          if (figmaGrid) figmaGrid.style.display = 'none';
          if (figmaTitle) figmaTitle.style.display = 'none';
        } else {
          if (figmaGrid) figmaGrid.style.display = '';
          if (figmaTitle) figmaTitle.style.display = '';
        }

        AudioManager.playButtonClick();
      });
    });
  }

  /* ===========================================================
     CONTACT FORM
     =========================================================== */
  function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Get form values
      const name = document.getElementById('contact-name')?.value;
      const email = document.getElementById('contact-email')?.value;
      const message = document.getElementById('contact-message')?.value;

      if (!name || !email || !message) {
        AudioManager.playButtonClick();
        return;
      }

      // Create mailto link as fallback (since we don't have a real backend)
      const subject = encodeURIComponent(`Portfolio Message from ${name}`);
      const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`);
      const mailto = `mailto:punangisha@gmail.com?subject=${subject}&body=${body}`;

      AudioManager.playConfirmation();

      // Show success feedback
      const submitBtn = form.querySelector('.retro-btn--submit');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '✓ Opening Email Client...';
        submitBtn.style.background = 'linear-gradient(135deg, #39FF14, #00AA00)';

        setTimeout(() => {
          window.open(mailto, '_blank');
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          form.reset();
        }, 1000);
      }
    });
  }

  /* ===========================================================
     MOBILE MENU
     =========================================================== */
  function setupMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const dropdown = document.getElementById('mobile-menu-dropdown');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!toggle || !dropdown || !mobileMenu) return;

    // Build menu buttons
    Object.entries(SECTIONS).forEach(([code, info]) => {
      const btn = document.createElement('button');
      btn.className = 'juke-btn';
      btn.dataset.code = code;
      btn.setAttribute('aria-label', info.name);
      btn.innerHTML = `
        <span class="juke-btn__code">${code}</span>
        <span class="juke-btn__label">${info.name}</span>
      `;
      btn.addEventListener('click', () => {
        AudioManager.playButtonClick();
        AnimationController.animateButtonPress(btn);
        showSection(code);
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
      dropdown.appendChild(btn);
    });

    // Toggle dropdown
    toggle.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      AudioManager.playButtonClick();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target)) {
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ===========================================================
     EASTER EGGS
     =========================================================== */
  function setupEasterEggs() {
    // Hold coin slot for 5 seconds → theme change
    const coinSlot = document.querySelector('.coin-slot-deco');
    if (coinSlot) {
      let holdTimer = null;
      const themes = [
        { '--juke-red': '#8B0000', '--neon-cyan': '#00FFFF', '--neon-pink': '#FF1493' },
        { '--juke-red': '#000080', '--neon-cyan': '#FFD700', '--neon-pink': '#FF6600' },
        { '--juke-red': '#006400', '--neon-cyan': '#FF69B4', '--neon-pink': '#00FF00' },
        { '--juke-red': '#4B0082', '--neon-cyan': '#FF4500', '--neon-pink': '#00BFFF' }
      ];
      let themeIndex = 0;

      coinSlot.addEventListener('mousedown', () => {
        holdTimer = setTimeout(() => {
          themeIndex = (themeIndex + 1) % themes.length;
          const theme = themes[themeIndex];
          Object.entries(theme).forEach(([prop, val]) => {
            document.documentElement.style.setProperty(prop, val);
          });
          AudioManager.playConfirmation();
        }, 5000);
      });

      coinSlot.addEventListener('mouseup', () => clearTimeout(holdTimer));
      coinSlot.addEventListener('mouseleave', () => clearTimeout(holdTimer));
    }

    // Triple-click volume dial → fun animation
    const volumeDial = document.getElementById('volume-dial');
    if (volumeDial) {
      let clickCount = 0;
      let clickTimer = null;

      volumeDial.addEventListener('click', () => {
        clickCount++;
        clearTimeout(clickTimer);

        if (clickCount >= 3) {
          clickCount = 0;
          // Spin the whole jukebox briefly!
          const wrapper = document.getElementById('jukebox-wrapper');
          if (wrapper) {
            wrapper.style.transition = 'transform 1s ease';
            wrapper.style.transform = 'rotate(360deg)';
            AudioManager.playConfirmation();
            setTimeout(() => {
              wrapper.style.transform = '';
              setTimeout(() => {
                wrapper.style.transition = '';
              }, 500);
            }, 1000);
          }
        }

        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 500);
      });
    }
  }

  /* ===========================================================
     GITHUB DATA LOADING
     Lazy-loads GitHub repos and injects project buttons/sections
     =========================================================== */
  async function loadGitHubData() {
    try {
      const result = await GitHubAPI.init();

      if (result.projectEntries && result.projectEntries.length > 0) {
        state.projectEntries = result.projectEntries;
        injectProjectButtons(result.projectEntries);
        injectProjectSections(result.projectEntries);
        addProjectVinyls(result.projectEntries);
      }
    } catch (error) {
      console.error('[Jukebox] Failed to load GitHub data:', error);
    }
  }

  function injectProjectButtons(entries) {
    const container = document.getElementById('project-buttons');
    if (!container) return;

    container.innerHTML = '';

    entries.forEach(entry => {
      const btn = document.createElement('button');
      btn.className = 'juke-btn';
      btn.dataset.code = entry.code;
      btn.setAttribute('aria-label', entry.name);
      btn.innerHTML = `
        <span class="juke-btn__code">${entry.code}</span>
        <span class="juke-btn__label">${truncate(entry.name, 10)}</span>
      `;

      btn.addEventListener('click', () => {
        AudioManager.playButtonClick();
        AnimationController.animateButtonPress(btn);
        showSection(entry.code);
      });

      container.appendChild(btn);
    });
  }

  function injectProjectSections(entries) {
    const contentInner = document.getElementById('content-inner');
    if (!contentInner) return;

    entries.forEach(entry => {
      // Check if section already exists
      if (document.getElementById(`section-${entry.code}`)) return;

      const section = document.createElement('div');
      section.className = 'content-section';
      section.id = `section-${entry.code}`;
      section.dataset.section = entry.code;

      section.innerHTML = `
        <h2 class="content-title neon-text">${escapeHtml(entry.name)}</h2>
        <div class="project-detail">
          <div class="project-detail__vinyl">
            <div class="project-card__vinyl" style="width:80px;height:80px;">
              <div class="project-card__vinyl-label" style="width:30px;height:30px;font-size:0.55rem;">
                ${entry.code}
              </div>
            </div>
          </div>
          <div class="project-detail__info">
            <p>${escapeHtml(entry.description || 'No description provided.')}</p>
            ${entry.language ? `<p style="margin-top:8px;color:var(--neon-cyan);">Language: <strong>${escapeHtml(entry.language)}</strong></p>` : ''}
            <div class="project-card__meta" style="margin-top:12px;">
              <span>⭐ ${entry.stars} Stars</span>
              <span>🍴 ${entry.forks} Forks</span>
            </div>
            <a href="${entry.url}" class="retro-btn" target="_blank" rel="noopener" style="margin-top:16px;">
              View on GitHub →
            </a>
          </div>
        </div>
      `;

      contentInner.appendChild(section);
    });
  }

  function addProjectVinyls(entries) {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    const colors = ['red', 'gold', 'cyan', 'pink', 'green', 'purple', 'orange', 'blue'];

    entries.forEach((entry, i) => {
      const vinyl = createMiniVinyl(
        entry.code,
        entry.name,
        colors[i % colors.length]
      );
      track.appendChild(vinyl);
    });
  }

  /* ===========================================================
     HELPERS
     =========================================================== */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function truncate(str, maxLen) {
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen) + '…' : str;
  }

  function announceToSR(message) {
    // Use aria-live region for screen reader announcements
    let announcer = document.getElementById('sr-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }

  // ─── Public API ───
  return { init };
})();

/* ===========================================================
   BOOT — Start the app when DOM is ready
   =========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  JukeboxApp.init();
});
