/* =============================================
   SE ADIB — Developer Portfolio Scripts
   Matrix Rain + Terminal Effects
   ============================================= */
(function () {
  /* ---- Theme Toggle & Dark/White Images ---- */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const html = document.documentElement;

  function updateThemeImages(theme) {
    document.querySelectorAll('.theme-img, img[data-dark]').forEach(img => {
      const darkSrc = img.getAttribute('data-dark');
      const lightSrc = img.getAttribute('data-light');
      if (theme === 'light') {
        if (lightSrc) {
          const testImg = new Image();
          testImg.onload = () => { img.src = lightSrc; };
          testImg.onerror = () => { if (darkSrc) img.src = darkSrc; };
          testImg.src = lightSrc;
        } else if (darkSrc) {
          img.src = darkSrc;
        }
      } else {
        if (darkSrc) {
          const testImg = new Image();
          testImg.onload = () => { img.src = darkSrc; };
          testImg.onerror = () => { if (lightSrc) img.src = lightSrc; };
          testImg.src = darkSrc;
        } else if (lightSrc) {
          img.src = lightSrc;
        }
      }
    });
  }

  function setTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    updateThemeImages(t);
    if (themeIcon) themeIcon.innerHTML = t === 'dark'
      ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
      : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
  setTheme(localStorage.getItem('theme') || 'dark');
  if (themeToggle) themeToggle.addEventListener('click', () => setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
  document.addEventListener('DOMContentLoaded', () => updateThemeImages(html.getAttribute('data-theme') || 'dark'));

  /* ---- Matrix Rain ---- */
  const canvas = document.getElementById('matrixCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, cols, drops;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*<>/{}[]|';
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.floor(w / 18);
      drops = Array(cols).fill(1);
    }
    resize();
    window.addEventListener('resize', resize);
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00ff8840';
      ctx.font = '14px monospace';
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 18, drops[i] * 18);
        if (drops[i] * 18 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---- Cursor Glow ---- */
  const glow = document.getElementById('cursorGlow');
  if (glow && window.innerWidth > 768) {
    document.addEventListener('mousemove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });
  }

  /* ---- Scroll Progress ---- */
  const prog = document.getElementById('scrollProgress');
  if (prog) window.addEventListener('scroll', () => {
    const s = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (max > 0 ? (s / max) * 100 : 0) + '%';
  });

  /* ---- Nav ---- */
  const nav = document.getElementById('mainNav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (nav) window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => { navToggle.classList.toggle('active'); navLinks.classList.toggle('open'); });
    navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => { navToggle.classList.remove('active'); navLinks.classList.remove('open'); }));
  }
  document.querySelectorAll('.nav-item.has-mega').forEach(item => {
    const link = item.querySelector('.nav-link');
    if (window.innerWidth <= 768 && link) link.addEventListener('click', e => { e.preventDefault(); item.classList.toggle('open'); });
  });
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(l => { l.classList.remove('active'); const h = l.getAttribute('href'); if (h === page || (page === '' && h === 'index.html')) l.classList.add('active'); });

  /* ---- Intersection Observer ---- */
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 60); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in,.stagger-item').forEach(el => obs.observe(el));

  /* ---- Skill Bars ---- */
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { const f = e.target.querySelector('.skill-fill'); if (f) f.style.width = f.dataset.width + '%'; skillObs.unobserve(e.target); } });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-bar-wrap').forEach(el => skillObs.observe(el));

  /* ---- Stat Counters ---- */
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target, target = parseInt(el.dataset.target);
        if (isNaN(target)) return;
        let cur = 0; const step = Math.max(1, Math.floor(target / 50));
        const t = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(t); } el.textContent = cur; }, 30);
        cObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-number').forEach(el => cObs.observe(el));

  /* ---- Visitor Count ---- */
  const vEl = document.querySelector('.visitor-count');
  if (vEl) { let v = localStorage.getItem('vc'); v = v ? parseInt(v) + 1 : 1; localStorage.setItem('vc', v); vEl.setAttribute('data-target', v); }

  /* ---- Typing Effect ---- */
  const typeEl = document.querySelector('.typing-text');
  if (typeEl) {
    const words = JSON.parse(typeEl.dataset.words || '[]');
    let wi = 0, ci = 0, del = false;
    function typeLoop() {
      const w = words[wi];
      if (!del) { typeEl.textContent = w.substring(0, ci + 1); ci++; if (ci === w.length) { del = true; setTimeout(typeLoop, 2200); return; } }
      else { typeEl.textContent = w.substring(0, ci - 1); ci--; if (ci === 0) { del = false; wi = (wi + 1) % words.length; } }
      setTimeout(typeLoop, del ? 35 : 70);
    }
    if (words.length) setTimeout(typeLoop, 800);
  }

  /* ---- Contact Form ---- */
  const form = document.getElementById('contactForm'), result = document.getElementById('formResult');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault(); const btn = form.querySelector('button[type="submit"]'); btn.disabled = true; btn.textContent = 'Sending...';
    try {
      const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) });
      const d = await r.json();
      result.innerHTML = d.success ? '<span style="color:var(--green)">✓ Message sent!</span>' : '<span style="color:var(--pink)">✗ Failed. Try again.</span>';
      if (d.success) form.reset();
    } catch { result.innerHTML = '<span style="color:var(--pink)">✗ Network error.</span>'; }
    btn.disabled = false; btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message';
  });

  /* ---- Modals ---- */
  function setupModal(sel, mId, msgId, vId, cId, defUrl) {
    const m = document.getElementById(mId), msg = document.getElementById(msgId), vBtn = document.getElementById(vId), cBtn = document.getElementById(cId);
    if (!m || !vBtn || !cBtn) return; let url = '';
    document.querySelectorAll(sel).forEach(c => c.addEventListener('click', e => {
      if (e.target.tagName === 'A') return; url = c.dataset.url || defUrl || ''; if (!url) return;
      if (msg) msg.textContent = 'Visit ' + (c.dataset.name || url) + '?'; m.classList.add('show');
    }));
    vBtn.addEventListener('click', () => { if (url) window.open(url, '_blank'); m.classList.remove('show'); });
    cBtn.addEventListener('click', () => m.classList.remove('show'));
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
  }
  setupModal('.project-card[data-url]', 'projectModal', 'modalMessage', 'modalVisit', 'modalCancel');
  setupModal('.location-card', 'locationModal', 'locationModalMessage', 'locationModalVisit', 'locationModalCancel', null, 'https://www.google.com/maps/place/Hatiya+Island');

  /* ---- Filter Buttons (Projects, Achievements, Blogs) ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const parent = btn.parentElement;
        parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter || 'all';
        const cards = document.querySelectorAll('.achievement-card, .project-card, .blog-post-card');
        cards.forEach(card => {
          if (!card.dataset.category) return;
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = '';
            card.classList.add('fade-in');
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---- Achievement Modal ---- */
  const achModal = document.getElementById('achievementModal');
  if (achModal) {
    const achTitle = document.getElementById('achModalTitle');
    const achMeta = document.getElementById('achModalMeta');
    const achDesc = document.getElementById('achModalDesc');
    const achPoints = document.getElementById('achModalPoints');
    const achMainImg = document.getElementById('achModalMainImg');
    const achThumbs = document.getElementById('achModalThumbs');
    const achPageBtn = document.getElementById('achModalPageBtn');
    const achClose = document.getElementById('achModalClose');

    document.querySelectorAll('.achievement-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        
        const title = card.dataset.title || '';
        const meta = card.dataset.meta || '// achievement_detail';
        const desc = card.dataset.desc || '';
        const page = card.dataset.page || '';
        let photos = [];
        try { photos = JSON.parse(card.dataset.photos || '[]'); } catch(err) { photos = []; }
        let points = [];
        try { points = JSON.parse(card.dataset.points || '[]'); } catch(err) { points = []; }

        if (achTitle) achTitle.textContent = title;
        if (achMeta) achMeta.textContent = meta;
        if (achDesc) achDesc.innerHTML = desc;

        if (achPoints) {
          achPoints.innerHTML = '';
          points.forEach(pt => {
            const li = document.createElement('li');
            li.textContent = pt;
            achPoints.appendChild(li);
          });
          achPoints.style.display = points.length ? 'block' : 'none';
        }

        if (achThumbs && achMainImg) {
          achThumbs.innerHTML = '';
          if (photos.length > 0) {
            achMainImg.src = photos[0];
            achMainImg.alt = title;
            achMainImg.style.display = 'block';
            if (photos.length > 1) {
              photos.forEach((src, idx) => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = title + ' photo ' + (idx + 1);
                img.className = 'modal-gallery-thumb' + (idx === 0 ? ' active' : '');
                img.addEventListener('click', () => {
                  achMainImg.src = src;
                  achThumbs.querySelectorAll('.modal-gallery-thumb').forEach(t => t.classList.remove('active'));
                  img.classList.add('active');
                });
                achThumbs.appendChild(img);
              });
              achThumbs.style.display = 'flex';
            } else {
              achThumbs.style.display = 'none';
            }
          } else {
            achMainImg.style.display = 'none';
            achThumbs.style.display = 'none';
          }
        }

        if (achPageBtn) {
          if (page) {
            achPageBtn.href = page;
            achPageBtn.style.display = 'inline-flex';
          } else {
            achPageBtn.style.display = 'none';
          }
        }

        achModal.classList.add('show');
      });
    });

    if (achClose) achClose.addEventListener('click', () => achModal.classList.remove('show'));
    achModal.addEventListener('click', e => { if (e.target === achModal) achModal.classList.remove('show'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && achModal.classList.contains('show')) achModal.classList.remove('show'); });
  }
})();
