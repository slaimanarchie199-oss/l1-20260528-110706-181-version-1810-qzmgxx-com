
(function () {
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root = document) => root.querySelector(sel);

  const hero = $('.hero-shell');
  if (hero) {
    const slides = $$('.hero-slide', hero);
    const dots = $$('.hero-pager button', hero);
    let index = 0;

    const setSlide = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    dots.forEach((dot, i) => dot.addEventListener('click', () => setSlide(i)));
    setInterval(() => setSlide(index + 1), 5000);
    setSlide(0);
  }

  const filters = $$('.js-filterable');
  const applyFilters = (root) => {
    const input = $('[data-filter-input]', root);
    const genre = $('[data-filter-genre]', root);
    const year = $('[data-filter-year]', root);
    const cards = $$('.card[data-title]', root);
    if (!input && !genre && !year) return;

    const text = (input?.value || '').trim().toLowerCase();
    const g = (genre?.value || '').trim();
    const y = (year?.value || '').trim();

    let shown = 0;
    cards.forEach((card) => {
      const hay = `${card.dataset.title} ${card.dataset.keywords} ${card.dataset.genre} ${card.dataset.year} ${card.dataset.region}`.toLowerCase();
      const okText = !text || hay.includes(text);
      const okGenre = !g || card.dataset.genre.includes(g);
      const okYear = !y || card.dataset.year === y;
      const ok = okText && okGenre && okYear;
      card.style.display = ok ? '' : 'none';
      if (ok) shown += 1;
    });
    const counter = $('[data-result-count]', root);
    if (counter) counter.textContent = shown;
  };

  $$('[data-filter-scope]').forEach((scope) => {
    const fields = $$('input, select', scope);
    fields.forEach((field) => field.addEventListener('input', () => applyFilters(scope)));
    applyFilters(scope);
  });

  const player = $('[data-player]');
  if (player) {
    const video = $('video', player);
    const poster = player.dataset.poster;
    const source = player.dataset.source;
    const playBtn = $('[data-play-btn]', player);
    const sourceLabel = $('[data-source-label]', player);
    const hlsLib = window.Hls;

    if (video && poster) video.setAttribute('poster', poster);
    if (sourceLabel && source) sourceLabel.textContent = source;

    const start = () => {
      if (!video) return;
      if (video.dataset.ready === '1') {
        video.play().catch(() => {});
        return;
      }
      const videoSrc = player.dataset.hls;
      if (videoSrc && hlsLib && hlsLib.isSupported()) {
        const hls = new hlsLib();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(hlsLib.Events.MANIFEST_PARSED, () => {
          video.dataset.ready = '1';
          video.play().catch(() => {});
        });
        video._hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
        video.dataset.ready = '1';
        video.play().catch(() => {});
      } else if (player.dataset.fallback) {
        video.src = player.dataset.fallback;
        video.dataset.ready = '1';
        video.play().catch(() => {});
      }
    };

    if (playBtn) playBtn.addEventListener('click', start);
    player.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      start();
    });
  }

  const searchPages = $$('.js-search-page');
  searchPages.forEach((root) => {
    const input = $('[data-search-input]', root);
    const cards = $$('.card[data-title]', root);
    const status = $('[data-search-status]', root);
    if (!input || !cards.length) return;
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let matched = 0;
      cards.forEach((card) => {
        const hay = `${card.dataset.title} ${card.dataset.keywords} ${card.dataset.genre} ${card.dataset.year} ${card.dataset.region}`.toLowerCase();
        const ok = !q || hay.includes(q);
        card.style.display = ok ? '' : 'none';
        if (ok) matched += 1;
      });
      if (status) status.textContent = `匹配 ${matched} 部影片`;
    });
  });
})();
