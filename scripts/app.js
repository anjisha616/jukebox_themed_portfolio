/* ============================================= */
/* APP.JS — Main application controller          */
/* ============================================= */

;(function () {
  'use strict';

  /* ---- DOM References ---- */
  const loader      = document.getElementById('loader');
  const nav         = document.getElementById('nav');
  const navToggle   = document.getElementById('navToggle');
  const navLinks    = document.getElementById('navLinks');
  const navItems    = document.querySelectorAll('.nav__link');
  const vinylIcon   = document.querySelector('.nav__vinyl-icon');
  const contactForm = document.getElementById('contactForm');

  /* ---- State ---- */
  let isScrolling  = false;
  let scrollTimer  = null;
  // Konami Code easter egg
  const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIndex = 0;

  /* ================================================ */
  /* LOADING SCREEN                                   */
  /* ================================================ */
  function hideLoader() {
    if (!loader) return;
    // Short delay to let vinyl spin gracefully
    setTimeout(() => {
      loader.classList.add('hidden');
      // Remove from DOM after transition
      setTimeout(() => {
        loader.remove();
      }, 600);
    }, 800);
  }

  /* ================================================ */
  /* NAVIGATION                                       */
  /* ================================================ */

  /**
   * Handle sticky nav appearance on scroll
   */
  function handleNavScroll() {
    if (!nav) return;
    const scrollY = window.scrollY;

    // Scrolled state (add shadow/border)
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Spin vinyl icon while scrolling
    if (vinylIcon) {
      if (!isScrolling) {
        vinylIcon.classList.add('spinning');
      }
      isScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        isScrolling = false;
        vinylIcon.classList.remove('spinning');
      }, 200);
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();
  }

  /**
   * Determine which section is in view and highlight nav link
   */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navItems.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('data-section') === id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /**
   * Mobile navigation toggle
   */
  function toggleMobileNav() {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  /**
   * Close mobile nav when a link is clicked
   */
  function closeMobileNav() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /**
   * Smooth scroll to section on nav click
   */
  function handleNavClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = nav ? nav.offsetHeight : 0;
        const top = target.offsetTop - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      closeMobileNav();
    }
  }

  /* ================================================ */
  /* CONTACT FORM                                     */
  /* ================================================ */

  function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous errors
      clearFormErrors();

      // Validate
      const name = contactForm.querySelector('#name');
      const email = contactForm.querySelector('#email');
      const message = contactForm.querySelector('#message');
      const submitBtn = document.getElementById('submitBtn');
      let hasError = false;

      if (!name.value.trim()) {
        showFieldError('name', 'Please enter your name.');
        hasError = true;
      }

      if (!email.value.trim()) {
        showFieldError('email', 'Please enter your email.');
        hasError = true;
      } else if (!isValidEmail(email.value)) {
        showFieldError('email', 'Please enter a valid email address.');
        hasError = true;
      }

      if (!message.value.trim()) {
        showFieldError('message', 'Please enter a message.');
        hasError = true;
      }

      if (hasError) return;

      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Simulate form submission (replace with actual endpoint)
      try {
        await simulateSubmission();

        // Success
        contactForm.reset();
        document.getElementById('formSuccess').hidden = false;
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Hide success message after 5 seconds
        setTimeout(() => {
          document.getElementById('formSuccess').hidden = true;
        }, 5000);
      } catch (err) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        showFieldError('message', 'Something went wrong. Please try again.');
      }
    });

    // Real-time validation on blur
    ['name', 'email', 'message'].forEach(field => {
      const input = contactForm.querySelector(`#${field}`);
      if (input) {
        input.addEventListener('blur', () => {
          validateField(field, input.value);
        });
        input.addEventListener('input', () => {
          // Clear error on typing
          const errorEl = document.getElementById(`${field}Error`);
          if (errorEl) errorEl.textContent = '';
          input.classList.remove('error');
        });
      }
    });
  }

  function showFieldError(field, message) {
    const errorEl = document.getElementById(`${field}Error`);
    const inputEl = document.getElementById(field);
    if (errorEl) errorEl.textContent = message;
    if (inputEl) inputEl.classList.add('error');
  }

  function clearFormErrors() {
    document.querySelectorAll('.form__error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form__input').forEach(el => el.classList.remove('error'));
  }

  function validateField(field, value) {
    if (field === 'email' && value.trim() && !isValidEmail(value)) {
      showFieldError('email', 'Please enter a valid email address.');
    }
    if (field === 'name' && !value.trim()) {
      showFieldError('name', 'Please enter your name.');
    }
    if (field === 'message' && !value.trim()) {
      showFieldError('message', 'Please enter a message.');
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function simulateSubmission() {
    return new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });
  }

  /* ================================================ */
  /* EASTER EGG — Konami Code                         */
  /* ================================================ */
  function handleKonamiCode(e) {
    const key = e.key;

    if (key === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        activateEasterEgg();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  }

  function activateEasterEgg() {
    // Rainbow mode - cycle through hue on the primary color
    document.body.style.setProperty('--color-primary', '#a259ff');
    document.body.style.setProperty('--color-primary-light', '#c084fc');
    document.body.style.setProperty('--color-primary-dark', '#7c3aed');

    // Show a fun toast
    const toast = document.createElement('div');
    toast.textContent = '🎵 You found the secret track! Theme changed. 🎵';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #a259ff;
      color: white;
      padding: 12px 28px;
      border-radius: 50px;
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(162, 89, 255, 0.4);
      animation: fadeInUp 0.4s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* ================================================ */
  /* KEYBOARD NAVIGATION                              */
  /* ================================================ */
  function initKeyboardNav() {
    // Close mobile nav on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMobileNav();
      }
    });
  }

  /* ================================================ */
  /* SMOOTH SCROLL for all anchor links               */
  /* ================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navHeight = nav ? nav.offsetHeight : 0;
          const top = target.offsetTop - navHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ================================================ */
  /* INITIALIZATION                                   */
  /* ================================================ */
  function init() {
    // Hide loader
    hideLoader();

    // Navigation
    if (navToggle) {
      navToggle.addEventListener('click', toggleMobileNav);
    }

    navItems.forEach(item => {
      item.addEventListener('click', handleNavClick);
    });

    // Scroll handler (debounced)
    let scrollTick = false;
    window.addEventListener('scroll', () => {
      if (!scrollTick) {
        requestAnimationFrame(() => {
          handleNavScroll();
          scrollTick = false;
        });
        scrollTick = true;
      }
    }, { passive: true });

    // Initialize modules
    initSmoothScroll();
    initContactForm();
    initKeyboardNav();

    // Scroll reveal animations
    ScrollAnimations.initScrollReveal();

    // GitHub API
    GitHubAPI.init();

    // Easter egg
    document.addEventListener('keydown', handleKonamiCode);

    // Trigger initial nav state
    handleNavScroll();
  }

  /* ---- Boot ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
