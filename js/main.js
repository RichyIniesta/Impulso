const year = document.querySelector("#current-year");
if (year) year.textContent = new Date().getFullYear();

/* Progreso de lectura: una línea fina acompaña el desplazamiento */
const progressBar = document.querySelector(".scroll-progress");
let progressTicking = false;

function updateScrollProgress() {
  if (!progressBar) return;

  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0
    ? window.scrollY / scrollableHeight
    : 0;

  progressBar.style.setProperty(
    "--scroll-progress",
    Math.min(Math.max(progress, 0), 1)
  );
  progressTicking = false;
}

if (progressBar) {
  updateScrollProgress();

  window.addEventListener("scroll", () => {
    if (!progressTicking) {
      window.requestAnimationFrame(updateScrollProgress);
      progressTicking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", updateScrollProgress);
}

/* Revelado progresivo de secciones al entrar en pantalla */
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".intro-grid > *, .section-heading > *, .stat-card, " +
    ".project-card, .values-list article, .goals-inner > *"
  );

  revealTargets.forEach((element, index) => {
    element.classList.add("js-reveal");

    if (element.matches("h2, .project-visual")) {
      element.classList.add("js-sweep");
    }

    element.style.transitionDelay = `${(index % 3) * 100}ms`;
  });

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -45px 0px"
  });

  revealTargets.forEach((element) => observer.observe(element));
}
