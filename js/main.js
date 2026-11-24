const year = document.querySelector("#current-year");
if (year) year.textContent = new Date().getFullYear();

/* Animaciones discretas para el contenido que aparece al desplazarse */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".intro-grid > *, .section-heading > *, .stat-card, .project-card, .values-list article, .goals-inner > *"
  );

  revealTargets.forEach((element, index) => {
    element.classList.add("js-reveal");
    if (element.matches("h2, .project-visual")) element.classList.add("js-sweep");
    element.style.transitionDelay = `${(index % 3) * 90}ms`;
  });

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

  revealTargets.forEach((element) => observer.observe(element));
}