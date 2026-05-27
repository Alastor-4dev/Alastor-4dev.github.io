(function () {
  "use strict";

  const data = window.__BRAND__ || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const escHTML = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  function mountDynamic() {
    const servicesTarget = $("[data-services]");
    if (servicesTarget && servicesTarget.children.length === 0 && data.services) {
      servicesTarget.innerHTML = data.services.map(s => `
        <article class="showcase-card">
          <img src="${escHTML(s.photo)}" alt="${escHTML(s.name)}" class="showcase-img" loading="lazy">
          <h3 class="showcase-title">${escHTML(s.name)}</h3>
          <p class="showcase-desc">${escHTML(s.desc)}</p>
        </article>
      `).join("");
    }

    const pricingTarget = $("[data-pricing]");
    if (pricingTarget && pricingTarget.children.length === 0 && data.pricing) {
      pricingTarget.innerHTML = data.pricing.map(p => `
        <div class="price-card">
          ${p.promo ? `<div class="promo-badge">${escHTML(p.promo)}</div>` : ''}
          <div class="price-name">${escHTML(p.name)}</div>
          <div class="price-val">${escHTML(p.price)}</div>
          <div class="price-desc">${escHTML(p.desc)}</div>
          <a href="#contacto" class="btn ${p.name === 'Pro' ? 'btn-primary' : 'btn-ghost'}">Elegir Plan</a>
        </div>
      `).join("");
    }
  }

  function initSplash() {
    if (reduced) return;
    const splash = $("#splash");
    if (!splash) return;
    setTimeout(() => {
      splash.classList.add("is-hidden");
    }, 1500);
  }

  function initHeader() {
    const header = $(".header");
    if (!header) return;
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }, { passive: true });
  }

  function initForm() {
    const form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector(".submit-btn");
      if(btn) {
        btn.classList.add("is-success");
        setTimeout(() => {
          form.reset();
          btn.classList.remove("is-success");
        }, 3000);
      }
    });
  }

  function initStatsCounters() {
    if (!window.gsap || !window.ScrollTrigger) return;
    $$("span[data-count-to]").forEach(el => {
      const endValue = parseFloat(el.getAttribute("data-count-to") || "0");
      const isFloat = endValue % 1 !== 0;
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: "top 90%" },
        innerHTML: endValue,
        duration: 2.5,
        ease: "power3.out",
        snap: { innerHTML: isFloat ? 0.1 : 1 },
        onUpdate: function() {
          if (isFloat) {
            el.innerHTML = Number(el.innerHTML).toFixed(1).replace('.', ',');
          } else {
            el.innerHTML = Math.round(Number(el.innerHTML));
          }
        }
      });
    });
  }

  function initReveals() {
    if (!window.gsap || !window.ScrollTrigger) return;
    setTimeout(() => { $$('.reveal[data-split]').forEach(el => el.classList.add("is-revealed")); }, 6000);

    $$('.reveal[data-split]').forEach(el => {
      if (!el.hasAttribute('data-splitted')) {
        const text = el.innerHTML;
        el.innerHTML = `<span class="split-line"><span class="split-line-inner">${text}</span></span>`;
        el.setAttribute('data-splitted', 'true');
      }
      ScrollTrigger.create({
        trigger: el, start: "top 90%", onEnter: () => el.classList.add("is-revealed")
      });
    });
  }

  function initShowcasePinned() {
    if (!window.gsap || !window.ScrollTrigger || reduced) return;
    const track = $(".showcase-track");
    const wrapper = $(".showcase-wrapper");
    if (!track || !wrapper) return;
    
    if (track.scrollWidth > window.innerWidth) {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth + 40),
        ease: "none",
        scrollTrigger: {
          trigger: ".pinned-showcase-section",
          start: "top top",
          end: () => "+=" + track.scrollWidth,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    }
  }

  function boot() {
    safe(mountDynamic, "mountDynamic");
    safe(initSplash, "initSplash");
    safe(initHeader, "initHeader");
    safe(initForm, "initForm");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initStatsCounters, "initStatsCounters");
      safe(initReveals, "initReveals");
      setTimeout(() => safe(initShowcasePinned, "initShowcasePinned"), 100);
    }
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
