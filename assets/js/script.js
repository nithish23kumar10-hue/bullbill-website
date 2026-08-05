/* ─── TRIAL BAR CLOSE (WB-02: moved from inline onclick) ─────────── */
(function initTrialBar() {
  const bar   = document.getElementById('trialBar');
  const close = document.getElementById('trialBarClose');
  if (!bar || !close) return;

  close.addEventListener('click', () => {
    bar.style.display = 'none';
    document.body.classList.add('trial-bar-dismissed');
    // Reposition mobile menu after bar removal
    positionMobileMenu();
  });
})();

/* ─── NAVBAR SCROLL ─────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateScrollSpy();
});

/* ─── MOBILE MENU — Dynamic top positioning (WB-04) ────────────── */
function positionMobileMenu() {
  if (!navbar.classList.contains('menu-open')) return;
  const navH  = navbar.offsetHeight;
  const barH  = document.body.classList.contains('trial-bar-dismissed')
                  ? 0
                  : (document.getElementById('trialBar')?.offsetHeight || 0);
  const totalTop = barH + navH;

  const links = navbar.querySelector('.nav-links');
  const cta   = navbar.querySelector('.nav-cta');
  if (links) links.style.top = totalTop + 'px';
  if (cta)   cta.style.top   = (totalTop + links.offsetHeight) + 'px';
}

function openMenu() {
  navbar.classList.add('menu-open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  positionMobileMenu();
}

function closeMenu() {
  navbar.classList.remove('menu-open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';

  const links = navbar.querySelector('.nav-links');
  const cta   = navbar.querySelector('.nav-cta');
  if (links) links.style.top = '';
  if (cta)   cta.style.top   = '';
}

navToggle.addEventListener('click', () => {
  navbar.classList.contains('menu-open') ? closeMenu() : openMenu();
});

/* WB-05: Escape key closes mobile menu */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navbar.classList.contains('menu-open')) closeMenu();
});

/* Close on nav link click */
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

/* ─── SCROLL SPY — Active nav link (WB-07) ──────────────────────── */
const spySections = ['home', 'features', 'roles', 'distributor', 'showcase'];

function updateScrollSpy() {
  const scrollY = window.scrollY + 100;
  let active = '';

  spySections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) active = id;
  });

  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace('#', '');
    a.classList.toggle('nav-active', href === active);
  });
}

/* ─── PARTICLE CANVAS (WB-10: reduce on mobile) ─────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  /* Fewer particles on small screens for performance */
  const isMobile = () => window.innerWidth <= 768;
  const particleCount = () => isMobile() ? 25 : 60;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = Array.from({ length: particleCount() }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.5 + 0.3,
      dx:    (Math.random() - 0.5) * 0.25,
      dy:    (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
      ctx.fill();
    });

    /* Connecting lines */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${0.07 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();

/* ─── SCROLL REVEAL ─────────────────────────────────────────────── */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* Trigger hero reveals immediately */
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
  }, 100);
})();

/* ─── COUNTER ANIMATION ─────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const target   = parseInt(el.dataset.target);
      const duration = 1800;
      const start    = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ─── LIFECYCLE STEP ANIMATION ──────────────────────────────────── */
(function initLifecycle() {
  const steps = document.querySelectorAll('.lifecycle-step');
  if (!steps.length) return;

  let current = 0;
  let timer;

  function activate(index) {
    steps.forEach((s, i) => s.classList.toggle('active', i === index));
  }

  function advance() {
    current = (current + 1) % steps.length;
    activate(current);
  }

  function startAuto() { timer = setInterval(advance, 1400); }
  function stopAuto()  { clearInterval(timer); }

  activate(0);
  startAuto();

  steps.forEach((step, i) => {
    step.addEventListener('mouseenter', () => { stopAuto(); activate(i); });
    step.addEventListener('mouseleave', startAuto);
  });
})();

/* ─── FEATURE / SERVICE / PRICING CARD STAGGERED REVEAL ────────── */
(function initFeatureStagger() {
  const cards   = document.querySelectorAll('.feature-card, .service-card, .pricing-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.1 });

  cards.forEach(c => observer.observe(c));
})();

/* ─── BOOK A DEMO FORM ──────────────────────────────────────────── */
(function initDemoForm() {
  const form = document.getElementById('demoForm');
  if (!form) return;

  const btn     = form.querySelector('button[type="submit"]');
  const success = document.getElementById('demoFormSuccess');
  const errDiv  = document.getElementById('demoFormError');

  /* WB-24: Inline blur validation */
  form.querySelectorAll('input[required], select[required]').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('field-invalid')) validateField(field);
    });
  });

  function validateField(field) {
    const invalid = !field.value.trim() ||
      (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) ||
      (field.type === 'tel'   && field.value.trim().length < 7);
    field.classList.toggle('field-invalid', invalid);
    field.classList.toggle('field-valid',  !invalid);
    return !invalid;
  }

  function showError(msg) {
    if (!errDiv) { console.warn(msg); return; }
    errDiv.textContent = msg;
    errDiv.style.display = 'block';
    btn.textContent = 'Book My Demo';
    btn.disabled    = false;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errDiv) errDiv.style.display = 'none';

    /* Validate all required fields */
    let allValid = true;
    form.querySelectorAll('input[required]').forEach(f => {
      if (!validateField(f)) allValid = false;
    });
    if (!allValid) {
      showError('Please fill in all required fields correctly.');
      return;
    }

    btn.textContent = 'Sending…';
    btn.disabled    = true;

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        form.reset();
        form.querySelectorAll('input, select, textarea').forEach(f => {
          f.classList.remove('field-valid', 'field-invalid');
        });
        success.style.display = 'block';
        btn.style.display     = 'none';
      } else {
        throw new Error();
      }
    } catch {
      /* WB-26: inline error instead of alert() */
      showError('Something went wrong. Please WhatsApp us or email support@bullbill.in');
    }
  });
})();

/* ─── SMOOTH SCROLL FOR ANCHOR LINKS ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── HERO LOGO PARALLAX ────────────────────────────────────────── */
(function initParallax() {
  const logo = document.getElementById('heroLogo');
  if (!logo) return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    logo.style.transform = `translate(${dx * 8}px, ${dy * 6}px)`;
  });
})();

/* ─── BUS NODE HOVER HIGHLIGHT ──────────────────────────────────── */
document.querySelectorAll('.bus-node').forEach(node => {
  node.addEventListener('mouseenter', () => {
    node.style.background = 'rgba(249,115,22,0.3)';
    node.style.boxShadow  = '0 0 16px rgba(249,115,22,0.4)';
  });
  node.addEventListener('mouseleave', () => {
    node.style.background = '';
    node.style.boxShadow  = '';
  });
});

/* ─── FAQ ACCORDION — Event delegation (WB-23) ──────────────────── */
(function initFaq() {
  const grid = document.querySelector('.faq-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-q');
    if (!btn) return;

    const item   = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('open');

    /* Close all */
    grid.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-a').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
})();

/* WB-23: Keep global function as thin shim for any residual inline calls */
function toggleFaq() { /* delegated — no-op shim */ }
