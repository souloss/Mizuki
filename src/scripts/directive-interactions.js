/**
 * directive-interactions.js — Client-side JS for interactive markdown directives
 *
 * Handles: tab switching, copy buttons, blur/psw reveal, folding/folders,
 * asciinema player loading, gallery lightbox, and video player.
 */

function initTabs() {
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.md-tab-btn');
    if (!tabBtn) {return;}
    e.preventDefault();

    const tabsId = tabBtn.dataset.tabsId;
    if (!tabsId) {return;}

    const container = document.getElementById(tabsId);
    if (!container) {return;}

    // Deactivate all tabs in this group
    container.querySelectorAll('.md-tab-btn').forEach((btn) => {
      btn.classList.remove('md-tab-active');
      btn.setAttribute('aria-selected', 'false');
    });
    container.querySelectorAll('.md-tab-pane').forEach((pane) => {
      pane.classList.remove('md-tab-visible');
    });

    // Activate clicked tab
    tabBtn.classList.add('md-tab-active');
    tabBtn.setAttribute('aria-selected', 'true');

    const tabIndex = tabBtn.dataset.tabIndex;
    const targetPane = container.querySelector(`#${tabsId}-pane-${tabIndex}`);
    if (targetPane) {
      targetPane.classList.add('md-tab-visible');
    }
  });
}

function initCopy() {
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.md-copy-btn, .md-segment-copy');
    if (!copyBtn) {return;}

    const targetId = copyBtn.dataset.copyTarget;
    if (!targetId) {return;}

    const target = document.getElementById(targetId);
    if (!target) {return;}

    let text = '';
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      text = target.value;
    } else {
      text = target.textContent || '';
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(copyBtn);
      });
    } else {
      // Fallback for older browsers
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
        target.select();
        document.execCommand('copy');
      } else {
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
      }
      showCopyFeedback(copyBtn);
    }
  });
}

function showCopyFeedback(btn) {
  const original = btn.innerHTML;
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  btn.classList.add('md-copy-btn--copied');
  if (btn.classList.contains('md-segment-copy')) {
    btn.classList.add('md-copy-success');
  }
  setTimeout(() => {
    btn.innerHTML = original;
    btn.classList.remove('md-copy-btn--copied', 'md-copy-success');
  }, 2000);
}

function initBlurReveal() {
  // Click to toggle blur/psw reveal
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.md-tag-blur, .md-tag-psw');
    if (el) {
      e.preventDefault();
      el.classList.toggle('md-tag-blur--revealed');
      el.classList.toggle('md-tag-psw--revealed');
      return;
    }
  });

  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const el = e.target.closest('.md-tag-blur, .md-tag-psw');
      if (el) {
        e.preventDefault();
        el.classList.toggle('md-tag-blur--revealed');
        el.classList.toggle('md-tag-psw--revealed');
      }
    }
  });
}

function initAsciinema() {
  // Lazy-load asciinema player script when an asciinema element scrolls into view
  const asciinemaElements = document.querySelectorAll('.md-directive-asciinema asciinema-player');
  if (!asciinemaElements.length) {return;}

  let scriptLoaded = false;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !scriptLoaded) {
          scriptLoaded = true;
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/asciinema-player@3/dist/bundle.js';
          script.async = true;
          document.head.appendChild(script);
          observer.disconnect();
          break;
        }
      }
    },
    { rootMargin: '200px' },
  );

  asciinemaElements.forEach((el) => observer.observe(el));
}

function initGallery() {
  let overlay = null;

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.md-gallery-item img');
    if (!img) {
      // Close overlay if clicking outside the image
      if (overlay && e.target === overlay) {
        closeOverlay();
      }
      return;
    }

    e.preventDefault();
    overlay = document.createElement('div');
    overlay.className = 'md-gallery-overlay';
    overlay.innerHTML = `<img src="${img.src}" alt="${img.alt}" />`;
    overlay.addEventListener('click', closeOverlay);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('md-gallery-overlay--visible'));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay) {
      closeOverlay();
    }
  });

  function closeOverlay() {
    if (!overlay) {return;}
    overlay.classList.remove('md-gallery-overlay--visible');
    setTimeout(() => {
      overlay.remove();
      overlay = null;
    }, 300);
  }
}

// Initialize all directive interactions
export function initDirectiveInteractions() {
  initTabs();
  initCopy();
  initBlurReveal();
  initAsciinema();
  initGallery();
  initVideo();
}

// ─── Video Player ────────────────────────────────────────────────────────────

function initVideo() {
  // Lazy-load video poster images and handle play on click for custom video containers
  document.addEventListener('click', (e) => {
    const playBtn = e.target.closest('.md-video-play');
    if (!playBtn) {return;}

    const container = playBtn.closest('.md-directive-video');
    if (!container) {return;}

    const video = container.querySelector('video');
    if (!video) {return;}

    if (video.paused) {
      video.play();
      container.classList.add('md-video-playing');
      playBtn.style.display = 'none';
    } else {
      video.pause();
      container.classList.remove('md-video-playing');
      playBtn.style.display = '';
    }
  });
}

// Auto-init for non-module usage
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDirectiveInteractions);
  } else {
    initDirectiveInteractions();
  }
}
