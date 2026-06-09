// Craft with Brennan — v3.0
// Mobile nav · Scroll reveal · Project filter · Lightbox

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Mobile nav ─── */
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.textContent = open ? '✕' : '☰';
    });
    // Close on link click
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      });
    });
  }

  /* ─── Scroll reveal — [data-reveal] system ─── */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  /* ─── Scroll reveal — legacy .reveal system ─── */
  const legacyEls = document.querySelectorAll('.reveal');
  if (legacyEls.length && 'IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io2.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    legacyEls.forEach(el => io2.observe(el));
  } else {
    legacyEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ─── Header: darken on scroll ─── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.style.background = window.scrollY > 40
        ? 'rgba(14, 12, 10, 0.97)'
        : 'rgba(14, 12, 10, 0.85)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─── Project filter tabs ─── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card[data-type]');
  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        projectCards.forEach(card => {
          card.style.display = (f === 'all' || card.dataset.type === f) ? '' : 'none';
        });
      });
    });
  }

  /* ─── Lightbox ─── */
  const galleryImgs = document.querySelectorAll('.gallery img, .gallery-feature img');
  if (galleryImgs.length) {
    const lb     = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = `
      <button class="lb-close" aria-label="Close">✕</button>
      <button class="lb-prev"  aria-label="Previous">‹</button>
      <button class="lb-next"  aria-label="Next">›</button>
      <img class="lb-img" alt="" />
      <div class="lb-caption"></div>
    `;
    document.body.appendChild(lb);

    const lbImg   = lb.querySelector('.lb-img');
    const lbCap   = lb.querySelector('.lb-caption');
    const lbClose = lb.querySelector('.lb-close');
    const lbPrev  = lb.querySelector('.lb-prev');
    const lbNext  = lb.querySelector('.lb-next');
    const imgs    = Array.from(galleryImgs);
    let idx = 0;

    const open = (i) => {
      idx = i;
      lbImg.src = imgs[i].src;
      lbImg.alt = imgs[i].alt || '';
      lbCap.textContent = `${i + 1} / ${imgs.length}`;
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    const step = (d) => open((idx + d + imgs.length) % imgs.length);

    imgs.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => open(i));
    });
    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    lbNext.addEventListener('click', (e) => { e.stopPropagation(); step(1); });
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target === lbImg) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   step(-1);
      if (e.key === 'ArrowRight')  step(1);
    });
  }

  /* ─── Contact form: mirror email → _replyto ─── */
  const emailField   = document.getElementById('email');
  const replytoField = document.getElementById('replytoField');
  if (emailField && replytoField) {
    emailField.addEventListener('input', () => { replytoField.value = emailField.value; });
  }

});
