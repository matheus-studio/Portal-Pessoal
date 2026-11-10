(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const esc = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

  const isExternal = (href) => /^https?:\/\//i.test(href);

  const ICONS = {
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 2h-3.2v13.1a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.1 6.1 0 1 0 5.2 6V8.6a7.4 7.4 0 0 0 4.3 1.4V6.8a4.3 4.3 0 0 1-4.3-4.3z"/></svg>'
  };

  const ARROW_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Imagem que não existe vira um bloco: dourado com "M" ou cinza liso.
  document.addEventListener('error', (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.fallback) return;
    const gray = img.dataset.fallback === 'gray';
    const block = document.createElement('span');
    block.className = `${img.className} is-fallback${gray ? ' is-gray' : ''}`;
    block.setAttribute('role', 'img');
    block.setAttribute('aria-label', img.alt || '');
    block.textContent = gray ? '' : img.dataset.fallback;
    img.replaceWith(block);
  }, true);

  const socialLinks = (list) =>
    list
      .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}" title="${esc(s.label)}">${ICONS[s.id] || ''}</a>`)
      .join('');

  const tabsHTML = (tabs, current) => `
    <nav class="tabs" aria-label="Seções">
      ${tabs.map((t) => `<button type="button" class="tab" data-tab="${esc(t.id)}" aria-pressed="${t.id === current}">${esc(t.label)}</button>`).join('')}
    </nav>`;

  const cardHTML = (item) => {
    const external = isExternal(item.href);
    const attrs = external ? ' target="_blank" rel="noopener"' : '';
    const tab = item.href === '#produto' ? ' data-go="produto"' : '';
    return `
      <a class="card" href="${esc(item.href)}"${attrs}${tab}>
        <div class="card-media">
          <img src="${esc(item.image)}" alt="" loading="lazy" decoding="async" data-fallback="gray">
          ${item.badge ? `<span class="badge">${esc(item.badge)}</span>` : ''}
        </div>
        <div class="card-body">
          <h3 class="card-title">${esc(item.title)}</h3>
          <p class="card-desc">${esc(item.description)}</p>
          <span class="card-cta">${esc(item.cta)} <span class="arrow" aria-hidden="true">${ARROW_SVG}</span></span>
        </div>
      </a>`;
  };

  const heroHTML = (profile) => `
    <header class="hero">
      <img class="avatar" src="${esc(profile.image)}" alt="${esc(profile.alt)}" width="128" height="128" data-fallback="M">
      <h1 class="hero-name">${esc(profile.name)}</h1>
      <p class="hero-label">${esc(profile.label)}</p>
    </header>`;

  const portalView = (data) => `
    <section class="view" aria-labelledby="view-title">
      <h1 class="visually-hidden" id="view-title">Portal</h1>
      <div class="stack">
        ${data.portal.groups.map((g) => `
          <div class="group">
            <h2 class="group-title">${esc(g.title)}</h2>
            <div class="group-items">${g.items.map(cardHTML).join('')}</div>
          </div>`).join('')}
      </div>
      <p class="disclaimer">${esc(data.portal.disclaimer)}</p>
    </section>`;

  const carouselShell = `
    <div class="carousel">
      <ul class="track" id="track"></ul>
      <div class="carousel-ctrl">
        <button type="button" class="nav-btn" id="prev" aria-label="Site anterior">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <div class="dots" id="dots"></div>
        <button type="button" class="nav-btn" id="next" aria-label="Próximo site">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>`;

  const siteHTML = (site) => `
    <li class="site-item">
      <a class="site" href="${esc(site.url)}" target="_blank" rel="noopener" aria-label="Abrir site de ${esc(site.client)} em nova aba">
        <span class="site-bar">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          <span class="site-url">${esc(site.display)}</span>
        </span>
        <img class="site-thumb" src="${esc(site.thumb)}" alt="Captura do site ${esc(site.client)}" loading="lazy" decoding="async" data-fallback="gray">
        <span class="site-foot">
          <span class="site-name">${esc(site.client)}</span>
          <span class="site-link">Abrir site ↗</span>
        </span>
      </a>
    </li>`;

  function initCarousel(items) {
    const track = $('#track');
    const dots = $('#dots');
    const prev = $('#prev');
    const next = $('#next');
    track.innerHTML = items.map(siteHTML).join('');
    dots.innerHTML = items
      .map((_, i) => `<button type="button" class="ind" aria-label="Ir para o site ${i + 1}"></button>`)
      .join('');

    const step = () => {
      const first = track.children[0];
      if (!first) return 0;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      return first.getBoundingClientRect().width + gap;
    };

    const update = () => {
      const s = step() || 1;
      const idx = Math.min(items.length - 1, Math.round(track.scrollLeft / s));
      $$('.ind', dots).forEach((btn, i) => {
        if (i === idx) btn.setAttribute('aria-current', 'true');
        else btn.removeAttribute('aria-current');
      });
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };

    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    $$('.ind', dots).forEach((btn, i) =>
      btn.addEventListener('click', () => track.scrollTo({ left: i * step(), behavior: 'smooth' }))
    );
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  const projectsView = (data) => `
    <section class="view" aria-labelledby="view-title">
      <h1 class="view-title" id="view-title">Projetos</h1>
      ${carouselShell}
    </section>`;

  const productView = (data) => {
    const p = data.product;
    return `
      <section class="view" aria-labelledby="view-title">
        <h1 class="view-title" id="view-title">Produto</h1>
        <div class="product">
          <div class="card-media">
            <img src="${esc(p.image)}" alt="" loading="lazy" decoding="async" data-fallback="gray">
            <span class="badge">${esc(p.badge)}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${esc(p.title)}</h3>
            <p class="card-desc">${esc(p.description)}</p>
            <a class="btn" href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.cta)}</a>
          </div>
        </div>
      </section>`;
  };

  const aboutView = (data) => {
    const a = data.about;
    return `
      <section class="view about" aria-labelledby="view-title">
        <div class="about-photo">
          <img src="${esc(a.photo)}" alt="${esc(data.profile.alt)}" loading="lazy" decoding="async" data-fallback="M">
        </div>
        <div class="about-copy">
          <h1 class="view-title" id="view-title">Quem sou eu</h1>
          <p class="about-quote">${esc(a.quote)}</p>
          ${a.text.map((t) => `<p class="about-text">${esc(t)}</p>`).join('')}
          <div class="stats">
            ${a.stats.map((s) => `
              <div class="stat">
                <span class="stat-value">${esc(s.value)}</span>
                <span class="stat-label">${esc(s.label)}</span>
              </div>`).join('')}
          </div>
        </div>
      </section>`;
  };

  const journeyView = (data) => `
    <section class="view" aria-labelledby="view-title">
      <h1 class="view-title" id="view-title">Jornada</h1>
      <ol class="timeline">
        ${data.journey.items.map((j) => `
          <li class="step">
            <span class="step-dot" aria-hidden="true"></span>
            <div class="step-body">
              <span class="step-when">${esc(j.when)}</span>
              <p class="step-text">${esc(j.text)}</p>
            </div>
          </li>`).join('')}
      </ol>
    </section>`;

  const VIEWS = {
    portal: portalView,
    projetos: projectsView,
    produto: productView,
    'quem-sou-eu': aboutView,
    jornada: journeyView
  };

  let DATA = null;
  const TAB_IDS = () => DATA.tabs.map((t) => t.id);

  // Lê a aba pelo hash da URL (#projetos etc.); cai no Portal se não existir.
  const tabFromHash = () => {
    const id = decodeURIComponent(location.hash.replace('#', ''));
    return TAB_IDS().includes(id) ? id : 'portal';
  };

  function showTab(id, { focus = false, pushHash = true } = {}) {
    if (!DATA) return;
    const app = $('#app');
    const tab = DATA.tabs.find((t) => t.id === id) || DATA.tabs[0];
    const current = tab.id;

    const head = current === 'portal' ? heroHTML(DATA.profile) : '';
    app.innerHTML = `${head}${tabsHTML(DATA.tabs, current)}<div class="view-wrap">${VIEWS[current](DATA)}</div>`;

    if (current === 'projetos') initCarousel(DATA.projects.items);

    $$('.tab', app).forEach((btn) =>
      btn.addEventListener('click', () => showTab(btn.dataset.tab, { focus: true }))
    );

    $$('a[data-go]', app).forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        showTab(a.dataset.go, { focus: true });
      })
    );

    document.title = current === 'portal' ? DATA.pageTitle : `${tab.label} · ${DATA.wordmark}`;

    if (pushHash) {
      const target = current === 'portal' ? location.pathname : `#${current}`;
      history.pushState({ tab: current }, '', target);
    }

    if (focus) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const title = $('#view-title', app);
      if (title) title.setAttribute('tabindex', '-1'), title.focus({ preventScroll: true });
    }
  }

  function renderShell(data) {
    document.title = data.pageTitle;
    $('#wordmark').textContent = data.wordmark;
    $('#social-top').innerHTML = socialLinks(data.social);
    $('#social-footer').innerHTML = socialLinks(data.social);
    $('#copyright').textContent = data.footer.copyright;
    const wa = $('#footer-wa');
    wa.href = data.footer.whatsapp.url;
    wa.textContent = data.footer.whatsapp.label;
  }

  function initTopbar() {
    const bar = $('#topbar');
    const onScroll = () => bar.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  initTopbar();

  window.addEventListener('popstate', () => showTab(tabFromHash(), { pushHash: false }));

  fetch('content.json', { cache: 'no-cache' })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      DATA = data;
      renderShell(data);
      showTab(tabFromHash(), { pushHash: false });
    })
    .catch((err) => {
      console.error('Não foi possível carregar content.json:', err);
      $('#app').innerHTML = '<p class="loading">Não foi possível carregar o conteúdo. Abra a página por um servidor (veja o README).</p>';
    });
})();
