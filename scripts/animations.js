/* ============================================= */
/* ANIMATIONS.JS — Scroll reveal & interactions  */
/* ============================================= */

const ScrollAnimations = (() => {
  let observer = null;

  /**
   * Initialize Intersection Observer for scroll reveals
   */
  function initScrollReveal() {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.classList.add('visible');
      });
      return;
    }

    const options = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1,
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, options);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Re-observe newly added elements (e.g., after API content loads)
   */
  function observeNew(elements) {
    if (!observer) return;
    elements.forEach(el => {
      if (el.classList.contains('animate-on-scroll') && !el.classList.contains('visible')) {
        observer.observe(el);
      }
    });
  }

  /**
   * Destroy observer
   */
  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  return { initScrollReveal, observeNew, destroy };
})();
