(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var pageLoadTime = Date.now();

  /* Helpers */
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* ==================== NAV ==================== */
  function initNav() {
    var nav = $(".nav");
    if (!nav) return;
    var update = function () {
      if (scrollY > 80) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });

    /* Hamburger */
    var btn = $(".nav-hamburger");
    var mobile = $(".nav-mobile");
    if (btn && mobile) {
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", !open);
        mobile.setAttribute("aria-hidden", open);
      });
      $$("a", mobile).forEach(function (a) {
        a.addEventListener("click", function () {
          btn.setAttribute("aria-expanded", "false");
          mobile.setAttribute("aria-hidden", "true");
        });
      });
    }
  }

  /* ==================== SMOOTH ANCHORS ==================== */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 80;
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - navOffset,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ==================== REVEALS ==================== */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    /* Safety net: at 6s, reveal anything still hidden above the fold */
    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-revealed");
        }
      });
    }, 6000);
  }

  /* ==================== MOUSE-FOLLOW GLOW ==================== */
  function initMouseGlow() {
    var glow = $("[data-mouse-glow]");
    if (!glow || !fineHover) return;
    var mx = 30, my = 40, tx = 30, ty = 40;
    document.addEventListener("mousemove", function (e) {
      tx = (e.clientX / innerWidth) * 100;
      ty = (e.clientY / innerHeight) * 100;
    }, { passive: true });
    function frame() {
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      document.documentElement.style.setProperty("--mx", mx + "%");
      document.documentElement.style.setProperty("--my", my + "%");
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ==================== TYPEWRITER ==================== */
  function initTypewriter() {
    var el = $("[data-typewriter]");
    if (!el) return;
    var html = el.innerHTML;
    el.innerHTML = "";
    el.style.visibility = "visible";

    /* Strip HTML tags and rebuild with tags as markers */
    var segments = [];
    var regex = /(<[^>]+>)|([^<]+)/g;
    var m;
    while ((m = regex.exec(html)) !== null) {
      if (m[1]) segments.push({ type: "tag", value: m[1] });
      else if (m[2]) segments.push({ type: "text", value: m[2] });
    }

    var result = "";
    var charIndex = 0;
    var totalChars = 0;
    segments.forEach(function (s) { if (s.type === "text") totalChars += s.value.length; });

    var cursor = document.createElement("span");
    cursor.className = "typewriter-cursor";

    function type() {
      var done = 0;
      result = "";
      for (var i = 0; i < segments.length; i++) {
        var s = segments[i];
        if (s.type === "tag") {
          result += s.value;
        } else {
          var remaining = charIndex - done;
          if (remaining >= s.value.length) {
            result += s.value;
            done += s.value.length;
          } else if (remaining > 0) {
            result += s.value.substring(0, remaining);
            done += remaining;
          }
        }
      }
      el.innerHTML = result;
      el.appendChild(cursor);

      if (charIndex < totalChars) {
        charIndex++;
        setTimeout(type, 35 + Math.random() * 25);
      } else {
        setTimeout(function () { cursor.remove(); }, 2000);
      }
    }
    setTimeout(type, 600);
  }

  /* ==================== COUNT UP ==================== */
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      var target = parseFloat(el.dataset.countTo);
      var decimals = (el.dataset.countTo.split(".")[1] || "").length;
      var counted = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !counted) {
            counted = true;
            io.unobserve(e.target);
            var start = performance.now();
            var duration = 1400;
            function tick(now) {
              var t = Math.min((now - start) / duration, 1);
              var ease = 1 - Math.pow(1 - t, 3);
              el.textContent = (target * ease).toFixed(decimals);
              if (t < 1) requestAnimationFrame(tick);
              else el.textContent = target.toFixed(decimals);
            }
            requestAnimationFrame(tick);
          }
        });
      }, { threshold: 0.01 });
      io.observe(el);
    });
  }

  /* ==================== PRODUCT 3D ROTATE ==================== */
  function initProductRotate() {
    var wrap = $("[data-product-rotate]");
    if (!wrap || !fineHover) return;
    var img = $("img", wrap);
    if (!img) return;
    document.addEventListener("mousemove", function (e) {
      var rx = ((e.clientY / innerHeight) - 0.5) * -12;
      var ry = ((e.clientX / innerWidth) - 0.5) * 20;
      img.style.transform = "translateY(" + (Math.sin(Date.now() / 1000) * 8) + "px) rotateX(" + rx.toFixed(1) + "deg) rotateY(" + ry.toFixed(1) + "deg)";
    }, { passive: true });
  }

  /* ==================== CONTACT FORM ==================== */
  function setupContactForm() {
    var form = $("[data-contact-form]");
    var success = $("[data-contact-success]");
    if (!form || !success) return;
    var submitBtn = form.querySelector("[type=submit]");
    var msg = $("[data-contact-success-msg]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      /* Honeypot */
      var honeypot = form.querySelector('[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        showSuccess();
        return;
      }

      /* Time-based anti-bot */
      if (Date.now() - pageLoadTime < 3000) {
        showSuccess();
        return;
      }

      if (form.classList.contains("is-sending")) return;
      if (!form.reportValidity()) return;

      form.classList.add("is-sending");
      submitBtn.disabled = true;

      setTimeout(function () {
        var firstName = (form.elements.name.value || "").trim().split(/\s+/)[0];
        if (msg) msg.textContent = firstName + ", hemos registrado tu reserva. Te escribimos cuando esten listos.";
        form.classList.add("is-sent");
        showSuccess();
      }, 700 + Math.random() * 500);
    });

    function showSuccess() {
      success.setAttribute("aria-hidden", "false");
      success.classList.add("is-visible");
    }
  }

  /* ==================== BOOT ==================== */
  function boot() {
    safe(initNav, "initNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initMouseGlow, "initMouseGlow");
    safe(initTypewriter, "initTypewriter");
    safe(initCountUp, "initCountUp");
    safe(initProductRotate, "initProductRotate");
    safe(setupContactForm, "setupContactForm");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
