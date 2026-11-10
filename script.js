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

  // Imagem que não existe vira um bloco: dourado com inicial "M" ou cinza liso.
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
      <ul class="tabs-list">
        ${tabs.map((t) => `<li><a href="${esc(t.href)}"${t.id === current ? ' aria-current="page"' : ''}>${esc(t.label)}</a></li>`).join('')}
      </ul>
    </nav>`;

  const heroHTML = (profile) => `
    <section class="hero" aria-labelledby="name">
      <img class="avatar" src="${esc(profile.image)}" alt="${esc(profile.alt)}" width="140" height="140" data-fallback="M">
      <h1 class="hero-name" id="name">${esc(profile.name)}</h1>
      <p class="hero-label">${esc(profile.label)}</p>
    </section>`;

  const labelHTML = (text) => `<h1 class="section-label">${esc(text)}</h1>`;

  const cardHTML = (item) => {
    const attrs = isExternal(item.href) ? ' target="_blank" rel="noopener"' : '';
    return `
      <li>
        <a class="card" href="${esc(item.href)}"${attrs}>
          <img class="thumb" src="${esc(item.thumb)}" alt="Miniatura de ${esc(item.title)}" width="96" height="96" loading="lazy" data-fallback="M">
          <span class="card-body">
            ${item.badge ? `<span class="badge">${esc(item.badge)}</span>` : ''}
            <span class="card-title">${esc(item.title)}</span>
            <span class="card-desc">${esc(item.description)}</span>
            <span class="card-cta">${esc(item.cta)} <span class="arrow" aria-hidden="true">→</span></span>
          </span>
        </a>
      </li>`;
  };

  const siteHTML = (site) => `
    <li class="site-item">
      <a class="site" href="${esc(site.url)}" target="_blank" rel="noopener" aria-label="Abrir site de ${esc(site.client)} em nova aba">
        <span class="site-bar">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          <span class="site-url">${esc(site.display)}</span>
        </span>
        <img class="site-thumb" src="${esc(site.thumb)}" alt="Captura do site ${esc(site.client)}" loading="lazy" data-fallback="gray">
        <span class="site-foot">
          <span class="site-name">${esc(site.client)}</span>
          <span class="site-link">Abrir site ↗</span>
        </span>
      </a>
    </li>`;

  const carouselShell = `
    <div class="carousel">
      <ul class="track" id="track"></ul>
      <div class="carousel-ctrl">
        <button type="button" class="nav-btn" id="prev" aria-label="Site anterior">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
        <div class="dots" id="dots"></div>
        <button type="button" class="nav-btn" id="next" aria-label="Próximo site">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
      </div>
    </div>`;

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

  function pageContent(page, data, label) {
    switch (page) {
      case 'portal':
        return `
          ${heroHTML(data.profile)}
          <section class="section">
            ${labelHTML(label)}
            <ul class="links">${data.portal.items.map(cardHTML).join('')}</ul>
            <p class="disclaimer">${esc(data.portal.disclaimer)}</p>
          </section>`;

      case 'projetos':
        return `
          <section class="section">
            ${labelHTML(label)}
            ${carouselShell}
          </section>`;

      case 'produto': {
        const p = data.product;
        return `
          <section class="section">
            ${labelHTML(label)}
            <div class="links">
              <div class="card card-static">
                <img class="thumb" src="${esc(p.thumb)}" alt="Miniatura de ${esc(p.title)}" width="96" height="96" loading="lazy" data-fallback="M">
                <div class="card-body">
                  <span class="badge">${esc(p.badge)}</span>
                  <span class="card-title">${esc(p.title)}</span>
                  <span class="card-desc">${esc(p.description)}</span>
                  <a class="btn-outline" href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.cta)}</a>
                </div>
              </div>
            </div>
          </section>`;
      }

      case 'quem-sou-eu': {
        const a = data.about;
        return `
          <section class="section">
            ${labelHTML(label)}
            <div class="about">
              <img class="about-photo" src="${esc(a.photo)}" alt="${esc(data.profile.alt)}" width="200" height="200" loading="lazy" data-fallback="M">
              <p class="about-text">${esc(a.text)}</p>
              <div class="stats">
                ${a.stats.map((s) => `
                  <div class="stat">
                    <span class="stat-value">${esc(s.value)}</span>
                    <span class="stat-label">${esc(s.label)}</span>
                  </div>`).join('')}
              </div>
            </div>
          </section>`;
      }

      case 'jornada':
        return `
          <section class="section">
            ${labelHTML(label)}
            <ol class="journey">
              ${data.journey.items.map((j) => `<li><span class="when">${esc(j.when)}</span><span class="journey-text">${esc(j.text)}</span></li>`).join('')}
            </ol>
          </section>`;

      default:
        return '';
    }
  }

  function render(data) {
    const page = document.body.dataset.page || 'portal';
    const tab = data.tabs.find((t) => t.id === page);
    const label = tab ? tab.label : '';

    document.title = page === 'portal' ? data.pageTitle : `${label} · ${data.wordmark}`;
    $('#wordmark').textContent = data.wordmark;
    $('#social-top').innerHTML = socialLinks(data.social);
    $('#social-footer').innerHTML = socialLinks(data.social);

    $('#page').innerHTML = `${tabsHTML(data.tabs, page)}<div class="wrap">${pageContent(page, data, label)}</div>`;

    if (page === 'projetos') initCarousel(data.projects.items);

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

  fetch('content.json', { cache: 'no-cache' })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(render)
    .catch((err) => {
      console.error('Não foi possível carregar content.json:', err);
      const main = $('#page');
      if (main) main.innerHTML = '<p class="wrap" style="padding-top:120px;color:#8E877C">Não foi possível carregar o conteúdo. Abra a página por um servidor (veja o README).</p>';
    });
})();
