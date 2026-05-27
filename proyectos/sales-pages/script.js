const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");
const price = document.querySelector("[data-price]");
const options = document.querySelectorAll("[data-option]");

const prices = {
  ritual: "$1,480 MXN",
  atelier: "$2,240 MXN",
  refill: "$880 MXN",
};

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = navPanel?.classList.toggle("is-open") ?? false;
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navPanel?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    navPanel.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

options.forEach((option) => {
  option.addEventListener("click", () => {
    options.forEach((item) => item.classList.remove("is-active"));
    option.classList.add("is-active");

    if (price) {
      price.textContent = prices[option.dataset.option] || prices.ritual;
    }
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.14 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
