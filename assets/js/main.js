/* ============================================================
   NEOFORTUNITY INC. — main.js
   Shared behaviour for all pages. Vanilla JS, no dependencies.
   Respects prefers-reduced-motion throughout.
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---- current year in footer ---- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- preloader ---- */
  var pre = document.getElementById("preloader");
  if (pre) {
    var fill = document.getElementById("plFill");
    var p = 0;
    var t = setInterval(function () {
      p += Math.random() * 18;
      if (p >= 100) { p = 100; clearInterval(t); finish(); }
      if (fill) fill.style.width = p + "%";
    }, 95);

    var finished = false;
    function finish() {
      if (finished) return; finished = true;
      setTimeout(function () {
        pre.classList.add("done");
        var hero = document.querySelector(".hero");
        if (hero) hero.classList.add("in");
      }, 300);
    }
    window.addEventListener("load", function () {
      if (p < 100) { p = 100; if (fill) fill.style.width = "100%"; clearInterval(t); }
      finish();
    });
  }

  /* ---- header scroll state ---- */
  var header = document.getElementById("header");
  if (header && !header.classList.contains("solid")) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- mobile menu ---- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  if (burger && menu) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("open"); });
    });
  }

  /* ---- reveal on scroll (IntersectionObserver) ---- */
  var revealEls = document.querySelectorAll(".ros, .bar");
  if (revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          if (en.target.classList.contains("stat")) startCount(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- number count-up (easeOutCubic) ---- */
  function startCount(stat) {
    var el = stat.querySelector(".count");
    if (!el) return;
    var to = +el.dataset.to, dur = 1600, st = null;
    if (reduced) { el.textContent = to.toLocaleString(); return; }
    requestAnimationFrame(function step(ts) {
      if (!st) st = ts;
      var k = Math.min((ts - st) / dur, 1);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.floor(e * to).toLocaleString();
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = to.toLocaleString();
    });
  }

  /* ---- gentle hero parallax (desktop pointer only; rAF-throttled) ---- */
  var finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (!reduced && finePointer) {
    var bg = document.querySelector(".hero-bg");
    if (bg) {
      var bgTicking = false;
      window.addEventListener("scroll", function () {
        if (bgTicking) return;
        bgTicking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y < window.innerHeight) bg.style.transform = "translateY(" + (y * 0.12) + "px) scale(1.04)";
          bgTicking = false;
        });
      }, { passive: true });
    }
  }

  /* ---- scroll progress bar (rAF-throttled) ---- */
  if (!reduced) {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    var barTicking = false;
    var updateBar = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || window.scrollY) / max * 100 : 0;
      bar.style.width = pct + "%";
    };
    var onBarScroll = function () {
      if (barTicking) return;
      barTicking = true;
      requestAnimationFrame(function () { updateBar(); barTicking = false; });
    };
    updateBar();
    window.addEventListener("scroll", onBarScroll, { passive: true });
    window.addEventListener("resize", updateBar);
  }

  /* ---- card cursor-follow spotlight ---- */
  if (!reduced && window.matchMedia("(hover:hover)").matches) {
    var cards = document.querySelectorAll(".rcard, .scard, .tmember");
    cards.forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---- subtle 3D tilt on research/support cards ---- */
  if (!reduced && window.matchMedia("(hover:hover)").matches) {
    var tiltCards = document.querySelectorAll(".rcard, .scard");
    tiltCards.forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = "translateY(-5px) perspective(900px) rotateX(" + (-py * 3.2).toFixed(2) + "deg) rotateY(" + (px * 3.2).toFixed(2) + "deg)";
      });
      c.addEventListener("mouseleave", function () { c.style.transform = ""; });
    });
  }

  /* ---- back-to-top button with scroll-progress ring ---- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    var ring = document.getElementById("ringCircle");
    var circ = 2 * Math.PI * 23;
    if (ring) { ring.style.strokeDasharray = circ; ring.style.strokeDashoffset = circ; }
    var topTicking = false;
    var onTop = function () {
      if (topTicking) return;
      topTicking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        var sc = h.scrollTop || window.scrollY;
        var pct = max > 0 ? sc / max : 0;
        if (ring) ring.style.strokeDashoffset = circ * (1 - pct);
        toTop.classList.toggle("show", sc > 600);
        topTicking = false;
      });
    };
    onTop();
    window.addEventListener("scroll", onTop, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---- contact form: progressive enhancement ----
     Posts to forms/contact.php (BootstrapMade PHP Email Form library).
     On a static host without PHP the fetch will fail gracefully and we
     fall back to opening the visitor's mail client. */
  var form = document.querySelector(".php-email-form");
  if (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (status) { status.className = "form-status show"; status.textContent = "Sending your message…"; }

      var action = form.getAttribute("action");
      var data = new FormData(form);

      fetch(action, { method: "POST", body: data })
        .then(function (r) { return r.text().then(function (txt) { return { ok: r.ok, txt: txt }; }); })
        .then(function (res) {
          if (res.ok && res.txt.trim().toLowerCase() === "ok") {
            if (status) { status.className = "form-status show ok"; status.textContent = "Thank you — your message has been sent. We typically respond within two business days."; }
            form.reset();
          } else {
            throw new Error(res.txt || "Send failed");
          }
        })
        .catch(function () {
          // graceful fallback: hand off to the visitor's email client
          if (status) {
            status.className = "form-status show ok";
            status.textContent = "Opening your email app so you can reach us directly…";
          }
          var name = encodeURIComponent(data.get("name") || "");
          var subject = encodeURIComponent(data.get("subject") || "Website enquiry");
          var body = encodeURIComponent((data.get("message") || "") + "\n\n— " + (data.get("name") || "") + " (" + (data.get("email") || "") + ")");
          window.location.href = "mailto:admin@neofortunity.com?subject=" + subject + "&body=" + body;
        });
    });
  }
})();
