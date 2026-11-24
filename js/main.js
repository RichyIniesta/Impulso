const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
    mainNav.classList.toggle("is-open", !isOpen);
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
    });
  });
}

const year = document.querySelector("#current-year");
if (year) year.textContent = new Date().getFullYear();

/* Animaciones al entrar en el área visible */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll(
    ".intro-grid > *, .section-heading > *, .stat-card, .project-card, .values-list article, .goals-inner > *"
  );
  revealTargets.forEach((element, index) => {
    element.classList.add("js-reveal");
    if (element.matches("h1, h2, .project-visual")) element.classList.add("js-sweep");
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
