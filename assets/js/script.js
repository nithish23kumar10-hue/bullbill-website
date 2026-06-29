/* ─── NAVBAR SCROLL ─────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

navToggle.addEventListener('click', () => {
  navbar.classList.toggle('menu-open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navbar.classList.remove('menu-open'));
});

/* ─── PARTICLE CANVAS ───────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
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

    /* draw connecting lines between close particles */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
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
        const el = entry.target;
        const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* trigger hero reveals immediately */
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
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 1800;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
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

  function startAuto() {
    timer = setInterval(advance, 1400);
  }

  function stopAuto() {
    clearInterval(timer);
  }

  activate(0);
  startAuto();

  steps.forEach((step, i) => {
    step.addEventListener('mouseenter', () => {
      stopAuto();
      activate(i);
    });
    step.addEventListener('mouseleave', () => {
      startAuto();
    });
  });
})();

/* ─── FEATURE CARD STAGGERED REVEAL ─────────────────────────────── */
(function initFeatureStagger() {
  const cards = document.querySelectorAll('.feature-card, .service-card, .pricing-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.1 });

  cards.forEach(c => observer.observe(c));
})();

/* ─── CTA FORM ────────────────────────────────────────────────────── */
document.getElementById('ctaForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('ctaEmail');
  const btn = document.getElementById('ctaBtn');
  const note = document.getElementById('ctaNote');
  const email = input.value.trim();
  if (!email) return;

  btn.textContent = 'Submitting...';
  btn.disabled = true;

  try {
    const res = await fetch('https://formspree.io/f/mgobzgzw', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      input.value = '';
      btn.textContent = '✓ You\'re on the list!';
      btn.style.background = '#10b981';
      note.textContent = 'We\'ll be in touch soon. Thank you!';
    } else {
      throw new Error();
    }
  } catch {
    btn.textContent = 'Get Early Access';
    btn.disabled = false;
    note.textContent = 'Something went wrong. Email us at support@bullbill.in';
  }
});

/* ─── SMOOTH SCROLL FOR ANCHOR LINKS ───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ─── HERO LOGO PARALLAX ────────────────────────────────────────── */
(function initParallax() {
  const logo = document.getElementById('heroLogo');
  if (!logo) return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
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
    node.style.boxShadow = '0 0 16px rgba(249,115,22,0.4)';
  });
  node.addEventListener('mouseleave', () => {
    node.style.background = '';
    node.style.boxShadow = '';
  });
});

/* ─── FAQ ACCORDION ─────────────────────────────────────────────── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-a');
  const isOpen = item.classList.contains('open');

  // Close all open items
  document.querySelectorAll('.faq-item.open').forEach(openItem => {
    openItem.classList.remove('open');
    openItem.querySelector('.faq-a').style.maxHeight = null;
  });

  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}
