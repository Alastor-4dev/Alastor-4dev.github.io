const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll(".device-controls span").forEach((button) => {
  button.addEventListener("click", () => {
    const screen = document.querySelector(".screen");
    if (!screen) {
      return;
    }

    screen.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-5px)" },
        { transform: "translateY(0)" }
      ],
      {
        duration: 260,
        easing: "steps(2, end)"
      }
    );

    button.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.86)" },
        { transform: "scale(1)" }
      ],
      {
        duration: 180,
        easing: "steps(2, end)"
      }
    );
  });
});
