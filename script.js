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
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 2h-3.2v13.1a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.1 6.1 0 1 0 5.2 6V8.6a7.4 7.4 0 0 0 4.3 1.4V6.8a4.3 4.3 0 0 1-4.3-4.3z"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4 5.3 5.3 0 0 0 3.2.7 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c0-.1-.2-.2-.4-.3z"/></svg>'
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

  function socialLinks(list) {
    return list
      .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}" title="${esc(s.label)}">${ICONS[s.id] || ''}</a>`)
      .join('');
  }

  function cardHTML(item) {
    const ext = isExternal(item.href);
    const attrs = ext ? ' target="_blank" rel="noopener"' : '';
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
  }

  function siteHTML(site) {
    return `
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
  }

  function renderCarousel(items) {
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

  function initScrollSpy() {
    const links = $$('#tabs a');
    const setActive = (id) => {
      links.forEach((a) => {
        if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-150px 0px -55% 0px' }
    );
    $$('main section[id]').forEach((s) => io.observe(s));
  }

  function render(data) {
    document.title = data.pageTitle;
    $('#wordmark').textContent = data.wordmark;
    $('#social-top').innerHTML = socialLinks(data.social);
    $('#social-footer').innerHTML = socialLinks(data.social);

    const avatar = $('#avatar');
    avatar.src = data.profile.image;
    avatar.alt = data.profile.alt;
    avatar.loading = 'eager';
    $('#name').textContent = data.profile.name;
    $('#hero-label').textContent = data.profile.label;

    $('#tabs').innerHTML = data.tabs
      .map((t) => `<li><a href="#${esc(t.target)}">${esc(t.label)}</a></li>`)
      .join('');
    $$('[data-section]').forEach((h) => {
      const tab = data.tabs.find((t) => t.target === h.dataset.section);
      if (tab) h.textContent = tab.label;
    });

    $('#links').innerHTML = data.portal.items.map(cardHTML).join('');
    $('#disclaimer').textContent = data.portal.disclaimer;

    renderCarousel(data.projects.items);

    const p = data.product;
    $('#product').innerHTML = `
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
      </div>`;

    const a = data.about;
    $('#about').innerHTML = `
      <img class="about-photo" src="${esc(a.photo)}" alt="${esc(data.profile.alt)}" width="200" height="200" loading="lazy" data-fallback="M">
      <p class="about-text">${esc(a.text)}</p>
      <div class="stats">
        ${a.stats.map((s) => `
          <div class="stat">
            <span class="stat-value">${esc(s.value)}</span>
            <span class="stat-label">${esc(s.label)}</span>
          </div>`).join('')}
      </div>`;

    $('#journey').innerHTML = data.journey.items
      .map((j) => `<li><span class="when">${esc(j.when)}</span><span class="journey-text">${esc(j.text)}</span></li>`)
      .join('');

    $('#copyright').textContent = data.footer.copyright;
    const wa = $('#footer-wa');
    wa.href = data.footer.whatsapp.url;
    wa.textContent = data.footer.whatsapp.label;

    initScrollSpy();
  }

  function initTopbar() {
    const bar = $('#topbar');
    const onScroll = () => bar.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function showError(message) {
    const main = $('main');
    if (main) main.insertAdjacentHTML('afterbegin', `<p class="wrap" style="padding-top:120px;color:#8E877C">${esc(message)}</p>`);
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
      showError('Não foi possível carregar o conteúdo. Abra a página por um servidor (veja o README).');
    });
})();
