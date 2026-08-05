(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  /* ---- reveal on scroll ---- */
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  /* ---- smooth hash scroll ---- */
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });

  /* ---- back to top ---- */
  const toTop = document.createElement("button");
  toTop.type = "button"; toTop.className = "to-top"; toTop.textContent = "↑"; toTop.setAttribute("aria-label", "返回页面顶部");
  document.body.append(toTop);
  const toggleTop = () => toTop.classList.toggle("is-visible", scrollY > 600);
  addEventListener("scroll", toggleTop, { passive: true }); toggleTop();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));

  /* ---- particle canvas ---- */
  const canvas = document.querySelector("[data-particles]");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animating = true;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const ratio = devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = Math.min(rect.height, 500) * ratio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = Math.min(rect.height, 500) + "px";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const init = () => {
      resize();
      const w = canvas.width / (devicePixelRatio || 1);
      const h = canvas.height / (devicePixelRatio || 1);
      particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - .5) * .4,
        vy: (Math.random() - .5) * .4,
        r: Math.random() * 1.6 + .4,
        o: Math.random() * .5 + .2
      }));
    };

    const draw = () => {
      if (!animating) return;
      const w = canvas.width / (devicePixelRatio || 1);
      const h = canvas.height / (devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(124,111,247," + p.o + ")";
        ctx.fill();
      });

      // draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "rgba(124,111,247," + ((1 - d / 120) * .15) + ")";
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(draw);
    };

    init(); draw();
    addEventListener("resize", init);
    document.addEventListener("visibilitychange", () => { animating = !document.hidden; if (animating) draw(); });
  }
})();
