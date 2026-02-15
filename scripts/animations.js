/* ===================================================
   JUKEBOX PORTFOLIO — Animation Helpers
   Intersection observers & Interaction Enhancements
   =================================================== */

(function () {
  'use strict';

  // ---- Randomize bubble animation timing ----
  function randomizeBubbles() {
    document.querySelectorAll('.bubble').forEach(bubble => {
      const delay = (Math.random() * 4).toFixed(2);
      const duration = (3 + Math.random() * 3).toFixed(2);
      bubble.style.animationDelay = `${delay}s`;
      bubble.style.animationDuration = `${duration}s`;

      // Slight size variation
      const size = 5 + Math.random() * 8;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
    });
  }

  // ---- Skill bar animation on section activation ----
  function observeSkillBars() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.classList.contains('active') &&
            mutation.target.id === 'section-a2') {
          animateSkillBars();
        }
      });
    });

    const skillSection = document.getElementById('section-a2');
    if (skillSection) {
      observer.observe(skillSection, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function animateSkillBars() {
    const fills = document.querySelectorAll('#section-a2 .skill-item__fill');
    fills.forEach((fill, index) => {
      const targetWidth = fill.style.width;
      fill.style.width = '0';
      setTimeout(() => {
        fill.style.transition = 'width 0.8s ease-out';
        fill.style.width = targetWidth;
      }, index * 100 + 50);
    });
  }

  // ---- Screen glow color shift based on active track ----
  function setupScreenGlow() {
    const trackColors = {
      a1: 'rgba(255, 107, 53, 0.03)',   // orange
      a2: 'rgba(0, 255, 255, 0.03)',     // cyan
      a3: 'rgba(255, 238, 0, 0.03)',     // yellow
      a4: 'rgba(255, 165, 0, 0.03)',     // amber
      b1: 'rgba(57, 255, 20, 0.03)',     // green
      b2: 'rgba(0, 136, 255, 0.03)',     // blue
      b3: 'rgba(255, 20, 147, 0.03)',    // pink
      b4: 'rgba(138, 43, 226, 0.03)'    // purple
    };

    const observer = new MutationObserver(() => {
      const activeSection = document.querySelector('.screen-content.active');
      if (activeSection) {
        const track = activeSection.dataset.track?.toLowerCase();
        const screen = document.querySelector('.jukebox__screen');
        if (screen && track && trackColors[track]) {
          screen.style.setProperty('--screen-glow', trackColors[track]);
        }
      }
    });

    const screenEl = document.querySelector('.jukebox__screen');
    if (screenEl) {
      observer.observe(screenEl, { childList: false, subtree: true, attributes: true });
    }
  }

  // ---- Tooltip for track buttons ----
  function setupButtonTooltips() {
    document.querySelectorAll('.track-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'all 0.15s ease';
      });
    });
  }

  // ---- Parallax-like subtle header glow ----
  function setupHeaderInteraction() {
    const header = document.querySelector('.jukebox__header-arch');
    if (!header) return;

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const neonSign = document.querySelector('.jukebox__neon-sign');
      if (neonSign) {
        neonSign.style.transform = `translateX(${x * 0.3}px)`;
      }
    });
  }

  // ---- Init ----
  function init() {
    randomizeBubbles();
    observeSkillBars();
    setupScreenGlow();
    setupButtonTooltips();
    setupHeaderInteraction();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
