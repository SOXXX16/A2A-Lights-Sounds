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

  // Play the uploaded A2A track and drive the hero equalizer from its live audio.
  const musicButton = document.getElementById("musicToggle");
  const musicStatus = document.getElementById("musicStatus");
  const musicSlider = document.getElementById("musicVolume");
  const equalizerBars = [...document.querySelectorAll(".equalizer i")];

  if (musicButton && musicStatus && musicSlider) {
    const audio = new Audio("a2atrack.mp3");
    audio.loop = true;
    audio.preload = "metadata";
    audio.volume = Number(musicSlider.value);

    let audioContext = null;
    let analyser = null;
    let frequencyData = null;
    let animationFrame = 0;
    let sourceConnected = false;

    function setPlayingUI(playing) {
      musicButton.setAttribute("aria-pressed", String(playing));
      musicButton.setAttribute("aria-label", playing ? "Pause A2A track" : "Play A2A track");
      musicButton.querySelector(".music-icon").textContent = playing ? "Ⅱ" : "▶";
      musicButton.classList.toggle("is-playing", playing);
      document.querySelector(".equalizer")?.classList.toggle("is-playing", playing);
      musicStatus.textContent = playing ? "A2A track · Playing" : "A2A track · Paused";
    }

    function resetWave() {
      equalizerBars.forEach((bar) => {
        bar.style.setProperty("--level", ".12");
      });
    }

    function animateWave() {
      if (!analyser || audio.paused) return;
      analyser.getByteFrequencyData(frequencyData);
      const binCount = frequencyData.length;

      equalizerBars.forEach((bar, index) => {
        // Spread the bars across the full audible spectrum, with more detail in the bass.
        const position = index / Math.max(1, equalizerBars.length - 1);
        const center = Math.min(binCount - 1, Math.floor(Math.pow(position, 2.15) * (binCount - 1)));
        const from = Math.max(0, center - 1);
        const to = Math.min(binCount, center + 2);
        let peak = 0;
        for (let bin = from; bin < to; bin++) peak = Math.max(peak, frequencyData[bin]);
        const level = Math.max(0, (peak - 7) / 248);
        const scale = .22 + Math.pow(level, .82) * 1.85;
        bar.style.setProperty("--level", scale.toFixed(3));
      });

      animationFrame = requestAnimationFrame(animateWave);
    }

    async function prepareAudioAnalysis() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContext) {
        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = .68;
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        const source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        sourceConnected = true;
      }
      if (audioContext.state === "suspended") await audioContext.resume();
    }

    musicButton.addEventListener("click", async () => {
      if (!audio.paused) {
        audio.pause();
        return;
      }
      try {
        await prepareAudioAnalysis();
        await audio.play();
      } catch (error) {
        musicStatus.textContent = "Tap Play to enable the A2A track";
        setPlayingUI(false);
      }
    });

    audio.addEventListener("play", () => {
      setPlayingUI(true);
      cancelAnimationFrame(animationFrame);
      animateWave();
    });
    audio.addEventListener("pause", () => {
      setPlayingUI(false);
      cancelAnimationFrame(animationFrame);
      resetWave();
    });
    audio.addEventListener("ended", () => {
      setPlayingUI(false);
      cancelAnimationFrame(animationFrame);
      resetWave();
    });
    audio.addEventListener("error", () => {
      musicStatus.textContent = "Track file not found · Check a2atrack.mp3";
      setPlayingUI(false);
      cancelAnimationFrame(animationFrame);
      resetWave();
    });
    musicSlider.addEventListener("input", () => {
      audio.volume = Number(musicSlider.value);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && !audio.paused) audio.pause();
    });
    resetWave();
  }
})();