/* Portfolio motion. Everything renders fully without this file; motion is additive. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- ambient flow field ---------- */
  function flowField(canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles, running = true;
    const N = window.innerWidth < 700 ? 260 : 620;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr; h = canvas.height = innerHeight * dpr;
    };
    const spawn = () => ({ x: Math.random() * w, y: Math.random() * h, life: 60 + Math.random() * 180 });
    resize(); particles = Array.from({ length: N }, spawn);
    addEventListener('resize', resize);
    let t = 0;
    const angle = (x, y) => Math.sin(x * 0.0016 + t) * 1.6 + Math.cos(y * 0.0021 - t * 0.7) * 1.6;
    const frame = () => {
      if (!running) return;
      t += 0.0025;
      // fade previous trails to transparent so the ambient gradients show through
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgb(0 0 0 / 0.08)'; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 1 * dpr;
      for (const p of particles) {
        const a = angle(p.x, p.y);
        const nx = p.x + Math.cos(a) * 1.2 * dpr, ny = p.y + Math.sin(a) * 1.2 * dpr;
        const fade = Math.min(1, p.life / 60);
        ctx.strokeStyle = `rgb(76 243 255 / ${0.16 * fade})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
        p.x = nx; p.y = ny; p.life -= 1;
        if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) Object.assign(p, spawn());
      }
      requestAnimationFrame(frame);
    };
    if (reduce) return; // static page under reduced motion: no ambient field
    document.addEventListener('visibilitychange', () => {
      const wasRunning = running; running = !document.hidden;
      if (running && !wasRunning) requestAnimationFrame(frame);
    });
    frame();
  }

  /* ---------- specimen: rotating fibonacci point cloud ---------- */
  function specimen(canvas) {
    const ctx = canvas.getContext('2d');
    const tick = $('[data-tick]'), cursor = $('.specimen-hud .cursor');
    const N = 1024, pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      const wobble = 1 + 0.08 * Math.sin(th * 3) * Math.cos(y * 6);
      pts.push([Math.cos(th) * r * wobble, y * wobble, Math.sin(th) * r * wobble]);
    }
    let rx = 0.35, ry = 0, tx = 0, ty = 0, size = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const b = canvas.getBoundingClientRect();
      canvas.width = b.width * dpr; canvas.height = b.height * dpr; size = b.width * dpr;
    };
    resize(); addEventListener('resize', resize);
    if (finePointer) {
      canvas.closest('.specimen').addEventListener('pointermove', (e) => {
        const b = canvas.getBoundingClientRect();
        const nx = (e.clientX - b.left) / b.width - 0.5, ny = (e.clientY - b.top) / b.height - 0.5;
        tx = ny * 0.8; ty = nx * 0.8;
        if (cursor) cursor.textContent = `x ${nx.toFixed(3)}  y ${(-ny).toFixed(3)}`;
      });
    }
    const draw = () => {
      ry += reduce ? 0 : 0.0035;
      rx += (0.35 + tx - rx) * 0.05;
      const ryy = ry + ty;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2, R = size * 0.32;
      const sx = Math.sin(rx), cxr = Math.cos(rx), sy = Math.sin(ryy), cyr = Math.cos(ryy);
      for (const [x, y, z] of pts) {
        const x1 = x * cyr + z * sy, z1 = -x * sy + z * cyr;
        const y2 = y * cxr - z1 * sx, z2 = y * sx + z1 * cxr;
        const depth = (z2 + 1.2) / 2.2;
        const px = cx + x1 * R, py = cy + y2 * R;
        const hot = Math.abs(y2) < 0.05;
        ctx.fillStyle = hot ? `rgb(255 95 200 / ${0.4 + depth * 0.6})` : `rgb(76 243 255 / ${0.08 + depth * 0.7})`;
        const s = (0.6 + depth * 1.6) * dpr;
        ctx.fillRect(px - s / 2, py - s / 2, s, s);
      }
      // orbit ring
      ctx.strokeStyle = 'rgb(76 243 255 / 0.22)'; ctx.lineWidth = dpr;
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.28, R * 0.34, -0.35, 0, Math.PI * 2); ctx.stroke();
      const oa = ry * 2.2;
      ctx.fillStyle = 'rgb(255 159 67)';
      const ox = cx + Math.cos(oa) * R * 1.28, oy = cy + Math.sin(oa) * R * 0.34;
      const c = Math.cos(-0.35), s2 = Math.sin(-0.35);
      const rxp = cx + (ox - cx) * c - (oy - cy) * s2, ryp = cy + (ox - cx) * s2 + (oy - cy) * c;
      ctx.beginPath(); ctx.arc(rxp, ryp, 3 * dpr, 0, Math.PI * 2); ctx.fill();
      if (tick) tick.textContent = (ry % (Math.PI * 2)).toFixed(3).padStart(7, '0');
      if (!reduce) requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- nav ---------- */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // scroll-spy: clip a copy of the links styled as active, so pill and text move together
  const links = $('.nav-links');
  if (links) {
    const copy = document.createElement('div');
    copy.className = 'nav-links-active'; copy.setAttribute('aria-hidden', 'true');
    $$('a', links).forEach((a) => { const s = document.createElement('span'); s.textContent = a.textContent; copy.append(s); });
    links.append(copy);
    const anchors = $$('a', links);
    const setActive = (a) => {
      anchors.forEach((x) => { x.classList.toggle('is-active', x === a); if (x === a) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); });
      if (!a) { copy.style.clipPath = 'inset(0 100% 0 0 round 999px)'; return; }
      const w = links.clientWidth, l = a.offsetLeft, r = w - (l + a.offsetWidth);
      copy.style.clipPath = `inset(4px ${r}px 4px ${l}px round 999px)`;
    };
    const targets = anchors.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(anchors[targets.indexOf(e.target)]); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => spy.observe(t));
    const top = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(null); }, { rootMargin: '0px 0px -60% 0px' });
    top.observe($('.hero'));
  }

  // one-shot clip reveal for chapter titles
  const revealer = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); revealer.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  // the closing line is the page's one scroll reveal; everything else is already visible
  $$('.cta-title').forEach((el) => { el.classList.add('reveal'); revealer.observe(el); });

  /* ---------- accordion ---------- */
  const slices = $$('.slice');
  const open = (slice) => slices.forEach((s) => {
    const on = s === slice;
    s.classList.toggle('is-open', on);
    $('.slice-trigger', s).setAttribute('aria-expanded', String(on));
  });
  slices.forEach((s) => {
    const trigger = $('.slice-trigger', s);
    trigger.addEventListener('click', () => open(s));
    if (finePointer) s.addEventListener('pointerenter', () => open(s));
    s.addEventListener('focusin', () => open(s));
  });

  /* ---------- carousel ---------- */
  const quotes = $$('.quote'), glyphs = $$('.carousel-glyphs span'), idxEl = $('[data-idx]');
  let current = 0;
  const show = (next) => {
    next = (next + quotes.length) % quotes.length;
    if (next === current) return;
    const from = quotes[current], to = quotes[next];
    if (window.gsap && !reduce) {
      const dir = Math.sign(next - current) || 1;
      gsap.to(from, { autoAlpha: 0, x: -24 * dir, filter: 'blur(2px)', duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      gsap.fromTo(to, { autoAlpha: 0, x: 32 * dir, filter: 'blur(2px)' }, { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: 0.45, delay: 0.1, ease: 'power3.out', overwrite: 'auto' });
      gsap.fromTo(glyphs[next], { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'power3.out' });
    } else {
      from.style.opacity = 0; from.style.visibility = 'hidden';
      to.style.opacity = 1; to.style.visibility = 'visible';
    }
    from.classList.remove('is-active'); to.classList.add('is-active');
    glyphs.forEach((g, i) => g.classList.toggle('is-dim', i !== next));
    idxEl.textContent = next + 1; current = next;
  };
  glyphs.forEach((g, i) => g.classList.toggle('is-dim', i !== 0));
  $$('.carousel-controls [data-dir]').forEach((b) => b.addEventListener('click', () => show(current + Number(b.dataset.dir))));
  $('.carousel').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
  });

  /* ---------- clock ---------- */
  const clock = $('[data-clock]');
  const tickClock = () => { clock.textContent = new Date().toISOString().slice(11, 19); };
  tickClock(); setInterval(tickClock, 1000);

  /* ---------- canvases ---------- */
  flowField($('.field'));
  specimen($('.specimen-canvas'));

  /* ---------- GSAP ---------- */
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // hero: masked line rise, then supporting copy
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.nav', { y: -24, opacity: 0, duration: 0.9 })
      .from('.eyebrow', { opacity: 0, y: 12, duration: 0.8 }, 0.1)
      .from('.hero-title .line-inner', { yPercent: 110, duration: 1.2, stagger: 0.09 }, 0.15)
      .from('.pill-img', { width: 0, duration: 1.1, ease: 'power4.out' }, 0.55)
      .from('.hero-sub', { opacity: 0, y: 20, duration: 0.9 }, 0.6)
      .from('.hero-actions .btn', { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, 0.72)
      .from('.specimen', { opacity: 0, y: 60, scale: 0.94, duration: 1.4 }, 0.4);

    // specimen drifts slower than the copy
    gsap.to('.specimen', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // chapter heads + accordion
    $$('.chapter-sub').forEach((el) => gsap.from(el, { opacity: 0, y: 12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));

    // reading progress under the nav
    gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

    // bento
    $$('.dist path').forEach((p) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.cell-a', start: 'top 75%' },
        onComplete: () => { if (p.classList.contains('dist-base')) p.style.strokeDasharray = '5 6'; },
      });
    });
    $$('.keyline .wire i').forEach((dot, i) => gsap.fromTo(dot, { xPercent: -100 }, { left: '100%', duration: 1.6, ease: 'none', repeat: -1, repeatDelay: 0.6, delay: i * 0.8 }));

    // counters with digit scramble
    $$('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count), o = { v: 0 }, width = String(target).length;
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => gsap.timeline()
          .to({}, { duration: 0.45, onUpdate: () => { el.textContent = Array.from({ length: width }, () => (Math.random() * 10) | 0).join(''); } })
          .to(o, { v: target, duration: 0.9, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }),
      });
    });

    // scrub: words 0.1 -> 1 in reading order
    const scrub = $('.scrub');
    scrub.innerHTML = scrub.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    gsap.to('.scrub .w', { opacity: 1, stagger: 0.06, ease: 'none', scrollTrigger: { trigger: scrub, start: 'top 78%', end: 'bottom 42%', scrub: 0.5 } });

    // plates: grow in to 1.0, darken and fade on exit
    $$('.plate').forEach((plate) => {
      gsap.fromTo(plate, { scale: 0.8, opacity: 0.4 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: plate, start: 'top bottom', end: 'center center', scrub: true } });
      gsap.to(plate, { opacity: 0.2, filter: 'brightness(0.5)', ease: 'none', scrollTrigger: { trigger: plate, start: 'center 30%', end: 'bottom top', scrub: true } });
      gsap.fromTo($('.plate-img', plate), { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    $$('.plate figcaption').forEach((cap) => gsap.from(cap.children, { opacity: 0, y: 24, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: cap, start: 'top 85%' } }));

    // carousel + CTA
    gsap.from(['.cta-sub', '.cta .btn'], { opacity: 0, y: 24, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.cta', start: 'top 70%' } });
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    // content is visible by default; reduced motion simply skips the choreography
  });

  // hover physics: magnetic buttons and pointer-tracked spotlights, fine pointers only
  if (finePointer && !reduce) {
    $$('.magnetic').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('pointermove', (e) => {
        const b = btn.getBoundingClientRect();
        xTo((e.clientX - b.left - b.width / 2) * 0.25); yTo((e.clientY - b.top - b.height / 2) * 0.35);
      });
      btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
    $$('.cell').forEach((c) => c.addEventListener('pointermove', (e) => {
      const b = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - b.left}px`); c.style.setProperty('--my', `${e.clientY - b.top}px`);
    }));
  }
})();
