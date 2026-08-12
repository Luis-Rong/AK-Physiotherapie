(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------------------------------------------------------------- Nav ---- */
  const navWrap = document.querySelector('.nav-wrap');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-links');

  if (toggle && menu) {
    const set = (open) => {
      menu.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        const first = menu.querySelector('a');
        if (first) setTimeout(() => first.focus(), 60);
      }
    };
    toggle.addEventListener('click', () => set(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) { set(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) set(false); });
  }

  if (navWrap) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => navWrap.classList.toggle('is-scrolled', !e.isIntersecting)).observe(sentinel);
  }

  /* ------------------------------------------------- Floating / settling ----
     Every [data-float] and [data-drift] element gets a progress value --sp
     from 0 (just below the viewport) to 1 (settled at its resting position).
     One rAF pass: all reads first, then all writes — no interleaved layout. */
  const floaters = [...document.querySelectorAll('[data-float], [data-drift]')];
  let ticking = false;

  const runFloat = () => {
    ticking = false;
    const vh = window.innerHeight;
    const reads = floaters.map((el) => el.getBoundingClientRect());
    for (let i = 0; i < floaters.length; i++) {
      const r = reads[i];
      // Settle window: element top travels from 92% of the viewport up to 45%.
      const p = 1 - (r.top - vh * 0.45) / (vh * 0.47);
      floaters[i].style.setProperty('--sp', Math.min(1, Math.max(0, p)).toFixed(4));
    }
  };

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(runFloat); } };

  if (reduce.matches || !floaters.length) {
    floaters.forEach((el) => el.style.setProperty('--sp', '1'));
  } else {
    runFloat();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------- Reveals ---- */
  const reveals = document.querySelectorAll('.reveal, .stagger');
  document.querySelectorAll('.stagger').forEach((g) => {
    [...g.children].forEach((c, i) => c.style.setProperty('--i', i));
  });
  if (reduce.matches || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* ----------------------------------------------------------- Cursor ----
     A soft ring that lags behind a hard dot; both grow and recolour over
     interactive targets and invert over dark surfaces. */
  if (fine.matches && !reduce.matches) {
    const ring = document.createElement('div');
    ring.className = 'cursor';
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.setAttribute('aria-hidden', 'true');
    dot.setAttribute('aria-hidden', 'true');
    document.body.append(ring, dot);
    document.body.classList.add('has-cursor');

    let tx = innerWidth / 2, ty = innerHeight / 2;
    let rx = tx, ry = ty;
    let raf = 0;

    const loop = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.translate = `${rx.toFixed(1)}px ${ry.toFixed(1)}px`;
      dot.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`;
      raf = requestAnimationFrame(loop);
    };

    const HOT = 'a, button, input, textarea, label, .card, .post, .step, .principle, .compare-row';
    const DARK = '.band-dark, .site-footer, .quote-lead, .post--lead, .on-dark';

    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      ring.classList.add('on');
      dot.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
      const t = e.target;
      const hot = t instanceof Element && !!t.closest(HOT);
      const dark = t instanceof Element && !!t.closest(DARK);
      ring.classList.toggle('hot', hot);
      ring.classList.toggle('dark', dark);
      dot.classList.toggle('dark', dark);
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      ring.classList.remove('on'); dot.classList.remove('on');
    });
    window.addEventListener('blur', () => {
      ring.classList.remove('on'); dot.classList.remove('on');
    });
  }

  /* ------------------------------------------------------------- Form ---- */
  document.querySelectorAll('.form').forEach((form) => {
    const status = form.querySelector('.form-status');
    const fields = [...form.querySelectorAll('input, textarea')];

    const validate = (f) => {
      const ok = f.checkValidity();
      f.setAttribute('aria-invalid', String(!ok));
      const slot = form.querySelector('#' + f.id + '-error');
      if (slot) {
        slot.textContent = ok ? ''
          : f.validity.valueMissing ? 'Bitte ausfüllen.' : 'Bitte prüfen Sie diese Eingabe.';
      }
      return ok;
    };

    fields.forEach((f) => {
      f.addEventListener('blur', () => validate(f));
      f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') validate(f); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (fields.map(validate).includes(false)) {
        if (status) status.textContent = 'Bitte prüfen Sie die markierten Felder.';
        const bad = fields.find((f) => f.getAttribute('aria-invalid') === 'true');
        if (bad) bad.focus();
        return;
      }
      const d = new FormData(form);
      const body = ['Name: ' + d.get('name'), 'E-Mail: ' + d.get('email'), '', 'Anliegen:', String(d.get('message') || '')].join('\n');
      if (status) status.textContent = 'Anfrage wird geöffnet — bitte im E-Mail-Programm abschicken.';
      window.location.href = 'mailto:info@akphysiotherapie.de'
        + '?subject=' + encodeURIComponent('Terminanfrage über die Website')
        + '&body=' + encodeURIComponent(body);
    });
  });

  /* --------------------------------------------------- Quick contact ---- */
  const quick = document.getElementById('quick-contact');
  const quickToggle = document.getElementById('quick-contact-toggle');
  const quickPanel = document.getElementById('quick-contact-panel');
  const quickClose = document.getElementById('quick-contact-close');

  if (quick && quickToggle && quickPanel) {
    const setOpen = (open) => {
      quick.classList.toggle('open', open);
      quickToggle.setAttribute('aria-expanded', String(open));
      quickPanel.hidden = !open;
      if (open) {
        const first = quickPanel.querySelector('input, textarea');
        if (first) setTimeout(() => first.focus(), 60);
      }
    };

    quickToggle.addEventListener('click', () => setOpen(!quick.classList.contains('open')));
    if (quickClose) quickClose.addEventListener('click', () => { setOpen(false); quickToggle.focus(); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && quick.classList.contains('open')) { setOpen(false); quickToggle.focus(); }
    });

    document.addEventListener('click', (e) => {
      if (quick.classList.contains('open') && !quick.contains(e.target)) setOpen(false);
    });
  }
})();
