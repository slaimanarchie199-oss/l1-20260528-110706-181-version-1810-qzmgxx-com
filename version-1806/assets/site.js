(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
      return;
    }
    fn();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-panel") || "body";
      var scope = document.querySelector(scopeSelector) || document;
      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));
      var input = panel.querySelector("[data-filter-keyword]");
      var region = panel.querySelector("[data-filter-region]");
      var year = panel.querySelector("[data-filter-year]");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial && input) {
        input.value = initial;
      }
      function apply() {
        var keyword = normalize(input && input.value);
        var selectedRegion = normalize(region && region.value);
        var selectedYear = normalize(year && year.value);
        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-year"),
            item.getAttribute("data-tags"),
            item.getAttribute("data-genre")
          ].join(" "));
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okRegion = !selectedRegion || normalize(item.getAttribute("data-region")) === selectedRegion;
          var okYear = !selectedYear || normalize(item.getAttribute("data-year")) === selectedYear;
          item.classList.toggle("hide", !(okKeyword && okRegion && okYear));
        });
      }
      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-stream]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("button");
      var streamUrl = player.getAttribute("data-stream");
      var started = false;
      function playVideo() {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }
      function attach() {
        if (!video || !streamUrl) {
          return;
        }
        if (!started) {
          started = true;
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              maxBufferLength: 30,
              enableWorker: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            player._hlsInstance = hls;
          } else {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
          }
        } else {
          playVideo();
        }
        player.classList.add("is-playing");
      }
      if (button) {
        button.addEventListener("click", attach);
      }
      player.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        attach();
      });
      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime < 0.1) {
            player.classList.remove("is-playing");
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
