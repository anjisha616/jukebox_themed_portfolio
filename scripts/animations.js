/* ============================================================
   ANIMATIONS.JS — JavaScript-driven Animation Controllers
   Handles coin insert, boot sequence, typewriter, and
   intersection observer-based animations
   ============================================================ */

'use strict';

const AnimationController = (() => {

  /* ===========================================================
     COIN INSERT ANIMATION
     Triggered on page load — user must click to proceed
     =========================================================== */
  function initCoinOverlay(onComplete) {
    const overlay = document.getElementById('coin-overlay');
    const coin = document.getElementById('coin');
    const bootSequence = document.getElementById('boot-sequence');

    if (!overlay) {
      onComplete?.();
      return;
    }

    function handleCoinInsert() {
      // Remove listeners to prevent double triggers
      overlay.removeEventListener('click', handleCoinInsert);
      document.removeEventListener('keydown', handleKeyInsert);

      // Init audio on first user gesture
      AudioManager.init();

      // Play coin drop sound
      AudioManager.playCoinDrop();

      // Animate coin dropping
      if (coin) {
        coin.classList.add('dropping');
      }

      // After coin animation, show boot sequence
      setTimeout(() => {
        overlay.classList.add('fade-out');

        // Show boot sequence
        if (bootSequence) {
          bootSequence.classList.remove('hidden');
        }

        // Play motor startup
        AudioManager.playMotorStart();

        // After boot sequence, reveal jukebox
        setTimeout(() => {
          if (bootSequence) {
            bootSequence.classList.add('hidden');
          }

          // Show main jukebox
          const jukebox = document.getElementById('jukebox-wrapper');
          if (jukebox) {
            jukebox.classList.remove('hidden');
          }

          // Remove overlay from DOM
          overlay.remove();

          // Play confirmation
          AudioManager.playConfirmation();

          // Callback
          onComplete?.();
        }, 2000); // Boot duration

      }, 700); // Coin drop duration
    }

    function handleKeyInsert(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCoinInsert();
      }
    }

    overlay.addEventListener('click', handleCoinInsert);
    document.addEventListener('keydown', handleKeyInsert);
  }

  /* ===========================================================
     TYPEWRITER EFFECT
     Reveals text character by character
     =========================================================== */
  function typewriterEffect(element, text, speed = 30) {
    if (!element) return Promise.resolve();

    return new Promise(resolve => {
      element.textContent = '';
      element.classList.add('typewriter-active');
      let i = 0;

      function type() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          element.classList.remove('typewriter-active');
          resolve();
        }
      }

      // Small delay before starting
      setTimeout(type, 300);
    });
  }

  /* ===========================================================
     INTERSECTION OBSERVER — Animate elements on scroll
     =========================================================== */
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe skill chips, project cards, timeline items
    const animatableElements = document.querySelectorAll(
      '.skill-chip, .project-card, .timeline-item, .stat-card, .contact-card'
    );

    animatableElements.forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }

  /* ===========================================================
     STAGGER ANIMATION — Cascade children entrance
     =========================================================== */
  function staggerChildren(parent, delay = 50) {
    if (!parent) return;

    const children = parent.children;
    Array.from(children).forEach((child, index) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(15px)';
      child.style.transition = `opacity 0.4s ease ${index * delay}ms, transform 0.4s ease ${index * delay}ms`;

      // Force reflow then animate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        });
      });
    });
  }

  /* ===========================================================
     RECORD SWITCH ANIMATION
     Visual transition when changing sections
     =========================================================== */
  function animateRecordSwitch(recordEl, callback) {
    if (!recordEl) {
      callback?.();
      return;
    }

    // Stop current spin
    recordEl.classList.remove('spinning');
    recordEl.classList.add('record-scratch');

    setTimeout(() => {
      recordEl.classList.remove('record-scratch');
      callback?.();

      // Resume spinning after a brief pause
      setTimeout(() => {
        recordEl.classList.add('spinning');
      }, 200);
    }, 300);
  }

  /* ===========================================================
     TONEARM ANIMATION
     Move tonearm over record when "playing"
     =========================================================== */
  function moveTonearm(playing) {
    const arm = document.getElementById('tonearm');
    if (!arm) return;

    if (playing) {
      arm.classList.add('playing');
    } else {
      arm.classList.remove('playing');
    }
  }

  /* ===========================================================
     BUTTON PRESS ANIMATION
     =========================================================== */
  function animateButtonPress(button) {
    if (!button) return;
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 300);
  }

  /* ===========================================================
     SECTION TRANSITION
     Fade out current section, fade in new one
     =========================================================== */
  function transitionSection(currentSection, newSection, callback) {
    // Fade out current
    if (currentSection) {
      currentSection.style.opacity = '0';
      currentSection.style.transform = 'translateY(10px)';
    }

    setTimeout(() => {
      // Hide current, show new
      if (currentSection) {
        currentSection.classList.remove('active');
        currentSection.style.opacity = '';
        currentSection.style.transform = '';
      }

      if (newSection) {
        newSection.classList.add('active');

        // Force reflow
        void newSection.offsetHeight;

        // Animate in
        newSection.style.opacity = '0';
        newSection.style.transform = 'translateY(20px)';

        requestAnimationFrame(() => {
          newSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          newSection.style.opacity = '1';
          newSection.style.transform = 'translateY(0)';
        });

        // Re-trigger skill bar animations if skills section
        if (newSection.id === 'section-A2') {
          const fills = newSection.querySelectorAll('.skill-chip__fill');
          fills.forEach(fill => {
            fill.style.width = '0';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                fill.style.width = fill.style.getPropertyValue('--fill');
              });
            });
          });

          // Stagger skill chips
          const grids = newSection.querySelectorAll('.skill-grid');
          grids.forEach(grid => staggerChildren(grid, 60));
        }

        // Typewriter for About section
        if (newSection.id === 'section-A1') {
          const bioEl = document.getElementById('bio-text');
          if (bioEl && !bioEl.dataset.typed) {
            const bioText = bioEl.textContent;
            bioEl.dataset.typed = 'true';
            typewriterEffect(bioEl, bioText, 20);
          }
        }

        // Stagger project cards
        if (newSection.id === 'section-B1') {
          const grids = newSection.querySelectorAll('.projects-grid');
          grids.forEach(grid => staggerChildren(grid, 80));
        }

        // Stagger contact cards
        if (newSection.id === 'section-B3') {
          const links = newSection.querySelector('.contact-links');
          if (links) staggerChildren(links, 100);
        }
      }

      callback?.();
    }, currentSection ? 300 : 0);
  }

  /* ===========================================================
     NOW PLAYING TEXT — Update scrolling marquee
     =========================================================== */
  function updateNowPlaying(text) {
    const el = document.getElementById('now-playing-text');
    if (!el) return;

    // Reset animation
    el.style.animation = 'none';
    el.textContent = `♪ NOW PLAYING: ${text.toUpperCase()} ♪`;

    // Force reflow then re-enable animation
    void el.offsetHeight;
    el.style.animation = '';
  }

  /* ===========================================================
     UPDATE RECORD LABEL
     =========================================================== */
  function updateRecordLabel(title, subtitle) {
    const labelTitle = document.querySelector('.record__label-title');
    const labelSub = document.querySelector('.record__label-sub');

    if (labelTitle) labelTitle.textContent = title || 'SELECT';
    if (labelSub) labelSub.textContent = subtitle || '— ★ —';
  }

  /* ===========================================================
     KONAMI CODE DETECTOR
     ↑↑↓↓←→←→BA
     =========================================================== */
  function initKonamiCode() {
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === konamiSequence[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          // Konami code complete!
          showKonamiOverlay();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  function showKonamiOverlay() {
    const overlay = document.getElementById('konami-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    AudioManager.playConfirmation();

    const closeBtn = document.getElementById('konami-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
      }, { once: true });
    }

    // Also close on Escape
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        overlay.classList.add('hidden');
        document.removeEventListener('keydown', escHandler);
      }
    });
  }

  /* ===========================================================
     VOLUME DIAL INTERACTION
     Drag/scroll to rotate the dial
     =========================================================== */
  function initVolumeDial() {
    const dial = document.getElementById('volume-dial');
    const valueDisplay = document.getElementById('volume-value');
    if (!dial) return;

    let isDragging = false;
    let startY = 0;
    let startVolume = 50;
    let currentRotation = 135; // 0% = -135deg, 100% = 135deg

    function updateDial(volumePercent) {
      const vol = Math.max(0, Math.min(100, volumePercent));
      const rotation = (vol / 100) * 270 - 135;
      dial.style.transform = `rotate(${rotation}deg)`;
      dial.setAttribute('aria-valuenow', Math.round(vol));
      if (valueDisplay) valueDisplay.textContent = `${Math.round(vol)}%`;
      AudioManager.setVolume(vol / 100);
      currentRotation = rotation;
    }

    // Mouse drag
    dial.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startVolume = AudioManager.getVolume() * 100;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaY = startY - e.clientY;
      const newVolume = startVolume + deltaY * 0.5;
      updateDial(newVolume);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Scroll wheel
    dial.addEventListener('wheel', (e) => {
      e.preventDefault();
      const currentVol = AudioManager.getVolume() * 100;
      const delta = e.deltaY > 0 ? -5 : 5;
      updateDial(currentVol + delta);
    }, { passive: false });

    // Keyboard
    dial.addEventListener('keydown', (e) => {
      const currentVol = AudioManager.getVolume() * 100;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        updateDial(currentVol + 5);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        updateDial(currentVol - 5);
      }
    });

    // Touch support
    dial.addEventListener('touchstart', (e) => {
      isDragging = true;
      startY = e.touches[0].clientY;
      startVolume = AudioManager.getVolume() * 100;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const deltaY = startY - e.touches[0].clientY;
      const newVolume = startVolume + deltaY * 0.5;
      updateDial(newVolume);
    }, { passive: true });

    document.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Set initial position
    updateDial(50);
  }

  // ─── Public API ───
  return {
    initCoinOverlay,
    typewriterEffect,
    initScrollAnimations,
    staggerChildren,
    animateRecordSwitch,
    moveTonearm,
    animateButtonPress,
    transitionSection,
    updateNowPlaying,
    updateRecordLabel,
    initKonamiCode,
    initVolumeDial
  };
})();
