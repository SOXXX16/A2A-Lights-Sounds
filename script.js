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

  // Play the uploaded A2A track from the repository root.
  const musicButton = document.getElementById("musicToggle");
  const musicStatus = document.getElementById("musicStatus");
  const musicSlider = document.getElementById("musicVolume");
  if (musicButton && musicStatus && musicSlider) {
    const audio = new Audio("a2atrack.mp3");
    audio.loop = true;
    audio.preload = "metadata";
    audio.volume = Number(musicSlider.value);

    function setPlayingUI(playing) {
      musicButton.setAttribute("aria-pressed", String(playing));
      musicButton.setAttribute("aria-label", playing ? "Pause A2A track" : "Play A2A track");
      musicButton.querySelector(".music-icon").textContent = playing ? "Ⅱ" : "▶";
      musicButton.classList.toggle("is-playing", playing);
      musicStatus.textContent = playing ? "A2A track · Playing" : "A2A track · Paused";
    }

    musicButton.addEventListener("click", async () => {
      if (!audio.paused) {
        audio.pause();
        setPlayingUI(false);
        return;
      }
      try {
        await audio.play();
        setPlayingUI(true);
      } catch (error) {
        musicStatus.textContent = "Upload a2atrack.mp3 to the website repository";
        setPlayingUI(false);
      }
    });

    audio.addEventListener("play", () => setPlayingUI(true));
    audio.addEventListener("pause", () => setPlayingUI(false));
    audio.addEventListener("error", () => {
      musicStatus.textContent = "Track file not found · Add a2atrack.mp3";
      setPlayingUI(false);
    });
    musicSlider.addEventListener("input", () => {
      audio.volume = Number(musicSlider.value);
    });
  }
})();