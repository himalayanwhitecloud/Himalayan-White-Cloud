// scripts.js — clean, robust client JS for index.html

document.addEventListener('DOMContentLoaded', () => {
  // Safe element getters
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // 1) IntersectionObserver reveal on scroll
  try {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          // optionally unobserve to save cycles:
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  } catch (err) {
    // graceful fallback: reveal all
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  // 2) Top popup: single sequence, accessible, closable
  (function topPopup() {
    const pop = $('#top-pop');
    const msg = $('#top-pop-msg');
    if (!pop || !msg) return;

    const messages = [
      "Himalayan White Cloud Service — Education, immigration, and dignified elderly care.",
      "Free 20-minute consultation • Transparent costs • Quick response within 1 business day.",
      "Book a consultation — we'll reply within one business day."
    ];

    let i = 0;
    const showPop = (text) => {
      msg.textContent = text;
      pop.style.display = 'block';
      pop.classList.remove('hide');
      pop.classList.add('show');
    };
    const hidePop = () => {
      pop.classList.remove('show');
      pop.classList.add('hide');
      setTimeout(()=> { pop.style.display = 'none'; }, 380);
    };

    // cycle messages every ~6.5s, start after 900ms
    let cycleTimer = null;
    const cycle = () => {
      showPop(messages[i]);
      cycleTimer = setTimeout(() => {
        hidePop();
        i = (i + 1) % messages.length;
        setTimeout(cycle, 1400);
      }, 5600);
    };

    // show first time
    setTimeout(cycle, 900);

    // manual close handler
    const closeBtn = pop.querySelector('[data-close-pop]');
    if (closeBtn) closeBtn.addEventListener('click', () => { hidePop(); clearTimeout(cycleTimer); });

  })();

  // 3) Smooth in-page scroll for hash links (keep header offset if header sticky)
  (function smoothScroll() {
    const header = document.querySelector('header');
    const offset = header ? header.offsetHeight + 10 : 0;
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  })();

  // 4) Current year in footer
  (function currentYear() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  })();

  // 5) Modal logic & FAB
  (function modalAndFab() {
    const modal = $('#modal');
    const fab = $('#fab');
    if (!modal || !fab) return;
    const open = () => { modal.classList.remove('hidden'); modal.classList.add('flex'); document.body.style.overflow = 'hidden'; };
    const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); document.body.style.overflow = ''; };

    fab.addEventListener('click', open);
    modal.querySelectorAll('[data-close], .backdrop').forEach(btn => btn.addEventListener('click', close));

    // Open once per day (6s after load)
    const KEY = 'hwc-links-last-shown';
    const last = parseInt(localStorage.getItem(KEY) || '0', 10);
    const day = 24 * 60 * 60 * 1000;
    if (Date.now() - last > day) {
      setTimeout(() => { open(); localStorage.setItem(KEY, String(Date.now())); }, 6000);
    }

    // openers inside content
    $$('[data-open-links]').forEach(el => el.addEventListener('click', open));
  })();

  // 6) Accessibility and fallback for images -- ensure header logo exists and use correct path
  (function ensureLogo() {
    const logoAnchor = document.querySelector('header a');
    if (!logoAnchor) return;
    // If there's no <img> inside header anchor, add a lightweight fallback
    if (!logoAnchor.querySelector('img')) {
      const img = document.createElement('img');
      img.src = 'img/logo.png'; // Place your logo at img/logo.png
      img.alt = 'Himalayan White Cloud Service';
      img.className = 'header-logo';
      logoAnchor.prepend(img);
    }
  })();

  // 7) Small defensive touch: ensure external links open safely (already used rel noopener in markup but reinforce)
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    if (!a.hasAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
  });

});
