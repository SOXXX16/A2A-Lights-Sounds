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

  // Original A2A instrumental loop, synthesized locally with Web Audio.
  const musicButton = document.getElementById("musicToggle");
  const musicStatus = document.getElementById("musicStatus");
  const musicSlider = document.getElementById("musicVolume");
  if (musicButton && musicStatus && musicSlider) {
    let ctx, master, timer, active = false;
    const beat = 60 / 104, bar = beat * 4, bars = [
      [261.63,329.63,392,493.88,523.25,659.25,783.99,659.25],
      [220,261.63,329.63,392,493.88,523.25,659.25,783.99],
      [174.61,220,261.63,329.63,523.25,659.25,698.46,659.25],
      [196,246.94,293.66,392,587.33,659.25,783.99,880]
    ];
    function note(freq, at, len, wave, vol) {
      const osc=ctx.createOscillator(), gain=ctx.createGain();
      osc.type=wave; osc.frequency.setValueAtTime(freq,at);
      gain.gain.setValueAtTime(.0001,at);
      gain.gain.exponentialRampToValueAtTime(vol,at+.025);
      gain.gain.exponentialRampToValueAtTime(.0001,at+len);
      osc.connect(gain); gain.connect(master); osc.start(at); osc.stop(at+len+.03);
    }
    function playLoop() {
      const start=ctx.currentTime+.12;
      bars.forEach((notes,b)=>{
        const t=start+b*bar;
        [0,1,2,3].forEach((n)=>{
          note(notes[n],t,bar*.9,"sine",.018);
          if(n===0) note(notes[n]/2,t,beat*3.5,"triangle",.045);
        });
        notes.slice(4).forEach((freq,i)=>{ if(i!==1&&i!==4) note(freq,t+i*beat*.5,beat*.32,"triangle",.04); });
        for(let k=0;k<4;k++) {
          const kick=ctx.createOscillator(), g=ctx.createGain(), kt=t+k*beat;
          kick.type="sine"; kick.frequency.setValueAtTime(100,kt); kick.frequency.exponentialRampToValueAtTime(45,kt+.13);
          g.gain.setValueAtTime(.0001,kt); g.gain.exponentialRampToValueAtTime(.055,kt+.008); g.gain.exponentialRampToValueAtTime(.0001,kt+.15);
          kick.connect(g); g.connect(master); kick.start(kt); kick.stop(kt+.17);
        }
      });
    }
    async function start() {
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC){musicStatus.textContent="Audio is not supported";return;}
      if(!ctx){ctx=new AC();master=ctx.createGain();master.gain.value=Number(musicSlider.value);master.connect(ctx.destination);}
      await ctx.resume(); if(active)return; active=true; playLoop();
      timer=setInterval(playLoop,bar*4*1000);
      musicButton.setAttribute("aria-pressed","true");
      musicButton.setAttribute("aria-label","Pause A2A original background music");
      musicButton.querySelector(".music-icon").textContent="Ⅱ";
      musicButton.classList.add("is-playing"); musicStatus.textContent="Original A2A music · Playing";
    }
    async function stop() {
      active=false; clearInterval(timer); if(ctx) await ctx.suspend();
      musicButton.setAttribute("aria-pressed","false");
      musicButton.setAttribute("aria-label","Play A2A original background music");
      musicButton.querySelector(".music-icon").textContent="▶";
      musicButton.classList.remove("is-playing"); musicStatus.textContent="Background music · Paused";
    }
    musicButton.addEventListener("click",()=>active?stop():start().catch(()=>musicStatus.textContent="Tap Play to enable music"));
    musicSlider.addEventListener("input",()=>{if(master)master.gain.setTargetAtTime(Number(musicSlider.value),ctx.currentTime,.04);});
    document.addEventListener("visibilitychange",()=>{if(document.hidden&&active)stop();});
  }
\n})();