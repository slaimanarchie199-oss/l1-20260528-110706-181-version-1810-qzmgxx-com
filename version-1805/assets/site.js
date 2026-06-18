function setHeaderState() {
  var header = document.querySelector('[data-site-header]');
  if (!header) {
    return;
  }
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

function setupNavigation() {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });
}

function setupHeroSlider() {
  var slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }
  var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) {
    return;
  }
  var current = 0;
  var timer = null;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }
  function start() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      show(index);
      start();
    });
  });
  show(0);
  start();
}

function setupCatalogFilters() {
  var catalog = document.querySelector('[data-catalog]');
  if (!catalog) {
    return;
  }
  var input = catalog.querySelector('[data-search-input]');
  var region = catalog.querySelector('[data-filter-region]');
  var year = catalog.querySelector('[data-filter-year]');
  var type = catalog.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(catalog.querySelectorAll('[data-card]'));
  function valueOf(control) {
    return control ? control.value.trim().toLowerCase() : '';
  }
  function apply() {
    var query = valueOf(input);
    var regionValue = valueOf(region);
    var yearValue = valueOf(year);
    var typeValue = valueOf(type);
    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' ').toLowerCase();
      var ok = true;
      if (query && haystack.indexOf(query) === -1) {
        ok = false;
      }
      if (regionValue && (card.dataset.region || '').toLowerCase() !== regionValue) {
        ok = false;
      }
      if (yearValue && (card.dataset.year || '').toLowerCase() !== yearValue) {
        ok = false;
      }
      if (typeValue && (card.dataset.type || '').toLowerCase() !== typeValue) {
        ok = false;
      }
      card.hidden = !ok;
    });
  }
  [input, region, year, type].forEach(function (control) {
    if (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    }
  });
}

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('movie-player');
  var layer = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-play-button]');
  var loaded = false;
  var hlsInstance = null;
  if (!video || !sourceUrl) {
    return;
  }
  function attach() {
    if (loaded) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
    loaded = true;
  }
  function play() {
    attach();
    if (layer) {
      layer.classList.add('is-hidden');
    }
    video.controls = true;
    var request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {});
    }
  }
  if (button) {
    button.addEventListener('click', play);
  }
  if (layer) {
    layer.addEventListener('click', play);
  }
  video.addEventListener('click', function () {
    if (!loaded) {
      play();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

window.initMoviePlayer = initMoviePlayer;

document.addEventListener('DOMContentLoaded', function () {
  setupNavigation();
  setupHeroSlider();
  setupCatalogFilters();
});
