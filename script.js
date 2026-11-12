(() => {
  "use strict";

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const header = document.querySelector(".site-header");
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  function setMenu(open, returnFocus = false) {
    if (!menuToggle || !mainNav) return;
    mainNav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    if (returnFocus) menuToggle.focus();
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  mainNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("click", (event) => {
    if (mobileQuery.matches && header && !header.contains(event.target)) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      setMenu(false, true);
    }
  });

  mobileQuery.addEventListener?.("change", (event) => {
    if (!event.matches) setMenu(false);
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mark the current section in the navigation without relying on scroll polling.
  if ("IntersectionObserver" in window && mainNav) {
    const navLinks = [...mainNav.querySelectorAll('a[href^="#"]')];
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === "#" + entry.target.id) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }
})();