(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  const progress = document.querySelector("[data-progress]");
  if (progress) {
    const setProgress = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
    };
    addEventListener("scroll", setProgress, { passive: true });
    setProgress();
  }

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  const date = document.querySelector("[data-local-date]");
  if (date) {
    const renderDate = () => {
      date.textContent = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
    };
    renderDate();
    setInterval(renderDate, 30000);
  }

  const notes = ["慢一点也没关系，重要的是还在向喜欢的方向靠近。", "把一个普通的下午过得认真，也是一种能力。", "未来不必急着被看见，先让今天好好发生。", "愿你拥有在喧闹里安静、在安静里明亮的能力。"];
  const note = document.querySelector("[data-note]");
  const noteButton = document.querySelector("[data-note-button]");
  if (note && noteButton) {
    let index = 0;
    noteButton.addEventListener("click", () => {
      index = (index + 1) % notes.length;
      note.textContent = "“" + notes[index] + "”";
    });
  }

  const music = document.querySelector("[data-music-player]");
  if (music) {
    const audio = music.querySelector("audio");
    const button = music.querySelector("button");
    const label = music.querySelector("[data-music-label]");
    button.addEventListener("click", async () => {
      try {
        if (audio.paused) {
          await audio.play();
          button.textContent = "暂停";
          label.textContent = "正在播放 · Ambient";
          music.classList.add("is-playing");
        } else audio.pause();
      } catch {
        label.textContent = "音源暂不可用，请稍后重试";
      }
    });
    audio.addEventListener("pause", () => {
      button.textContent = "播放";
      if (!audio.ended) label.textContent = "Ambient · Raspberrymusic";
      music.classList.remove("is-playing");
    });
  }

  const canvas = document.querySelector("[data-stars]");
  if (canvas && !reducedMotion) {
    const context = canvas.getContext("2d");
    let stars = [];
    let pointer = { x: -999, y: -999 };
    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      stars = Array.from({ length: Math.max(24, Math.floor(rect.width / 16)) }, () => ({ x: Math.random() * rect.width, y: Math.random() * rect.height, size: Math.random() * 1.4 + 0.4, opacity: Math.random() * 0.6 + 0.2 }));
    };
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      stars.forEach(star => {
        const distance = Math.hypot(star.x - pointer.x, star.y - pointer.y);
        if (distance < 130) {
          context.beginPath(); context.moveTo(star.x, star.y); context.lineTo(pointer.x, pointer.y);
          context.strokeStyle = "rgba(201,172,126," + ((1 - distance / 130) * 0.3) + ")";
          context.lineWidth = 0.7; context.stroke();
        }
        context.beginPath(); context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fillStyle = "rgba(240,239,231," + star.opacity + ")"; context.fill();
      });
      requestAnimationFrame(draw);
    };
    setup(); draw(); addEventListener("resize", setup);
    canvas.addEventListener("pointermove", event => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    });
    canvas.addEventListener("pointerleave", () => pointer = { x: -999, y: -999 });
  }

  const content = window.SHANHAI_CONTENT;
  const journalList = document.querySelector("[data-journal-list]");
  if (journalList && content) {
    journalList.innerHTML = content.articles.map(article =>
      '<article class="journal-item" data-reveal><p class="eyebrow">' + article.category + ' · ' + article.date + '</p><h2><a href="./posts/' + article.path + '">' + article.title + '</a></h2><p>' + article.excerpt + '</p><a class="text-link" href="./posts/' + article.path + '">阅读全文 <span>→</span></a></article>'
    ).join("");
    journalList.querySelectorAll("[data-reveal]").forEach(item => item.classList.add("is-visible"));
  }

  const articleNav = document.querySelector("[data-article-nav]");
  if (articleNav && content) {
    const current = content.articles.findIndex(article => article.slug === articleNav.dataset.articleNav);
    const makeLink = (article, label) => article
      ? '<a href="./' + article.path + '"><small>' + label + '</small><strong>' + article.title + '</strong></a>'
      : '<span class="article-nav-empty"><small>' + label + '</small><strong>暂时没有了</strong></span>';
    articleNav.innerHTML = makeLink(content.articles[current - 1], "上一篇") + makeLink(content.articles[current + 1], "下一篇");
  }

  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        event.preventDefault();
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });
})();