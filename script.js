document.addEventListener("DOMContentLoaded", () => {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  const sections = document.querySelectorAll(".section, .hero");
  const navAnchors = navLinks.querySelectorAll(".nav__link");
  const progressBars = document.querySelectorAll("progress");
  const revealElements = document.querySelectorAll(
    ".section__label, .section__title, .section__subtitle, " +
      ".about__text p, .about__card-item, " +
      ".projects__card, .services__card, " +
      ".contact__info, .contact__form, " +
      ".hero__stats .stat",
  );
  const DISCORD_ID = "381393980434284544";
  const LANYARD_API = "https://api.lanyard.rest/v1/users/" + DISCORD_ID;
  const fabBtn = document.getElementById("fabBtn");
  const fabPanel = document.getElementById("discordPanel");
  const fabBtnDot = document.getElementById("fabBtnDot");
  const fabDot = document.getElementById("fabDot");
  const fabLabel = document.getElementById("fabLabel");
  const fabActivity = document.getElementById("fabActivity");
  const discordAvatar = document.getElementById("discordAvatar");
  const discordName = document.getElementById("discordName");
  const discordDiscrim = document.getElementById("discordDiscrim");
  const discordToasts = document.getElementById("discordToasts");
  const form = document.getElementById("contactForm");
  const stackSection = document.getElementById("stack");
  const CHARS =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:'\",.<>?/xZ";
  const SCRAMBLE = 150;
  const TIMED_GROUPS = [
    {
      selectors: [".hero__title-line", ".hero__label-text"],
      duration: 1000,
      mode: "parallel",
    },
    { selectors: [".hero__desc"], duration: 1500, mode: "parallel" },
    { selectors: [".hero__actions .btn"], duration: 1500, mode: "sequential" },
    { selectors: [".stat__num"], duration: 2000, mode: "sequential" },
    { selectors: [".stat__label"], duration: 2000, mode: "sequential" },
  ];
  const STATUS_LABELS = {
    online: "En linea",
    idle: "Ausente",
    dnd: "No molestar",
    offline: "Desconectado",
  };
  const STATUS_COLORS = {
    online: "#23a55a",
    idle: "#f0b232",
    dnd: "#f23f43",
    offline: "#747f8d",
  };
  const STATUS_MESSAGES = {
    online: [
      "Ya estoy por aqui",
      "Aqui estoy, que hay?",
      "Volviendo a la vida",
      "Conectado y listo",
    ],
    idle: [
      "Me he ido un momento",
      "Ausente temporalmente",
      "Volviendo en un rato",
      "No me mires, estoy AFK",
    ],
    dnd: [
      "No molestar, estoy en flows",
      "Silencio, que estoy programando",
      "No interrumpir - modo focus",
      "Estoy concentrado, ya vuelvo",
    ],
    offline: [
      "Me he desconectado",
      "Hasta luego, nos vemos",
      "Me fui, fue un placer",
      "Apagando luces...",
    ],
  };
  const ACTIVITY_MESSAGES = {
    playing: [
      "Jugando a {game}",
      "Jugando a {game}? Vamos!",
      "Modo gamer activado: {game}",
      "Un ratito de {game}",
    ],
    listening: [
      "Escuchando {name}",
      "Con {name} de fondo",
      "Musica sonando: {name}",
    ],
    streaming: [
      "En directo: {name}",
      "Transmitiendo {name} en vivo",
      "Live! {name}",
    ],
  };

  var prevStatus = null;
  var prevActivityName = null;
  var prevActivityType = null;
  var isFirstFetch = true;
  var progressAnimated = false;
  const targets = [];
  let observer;
  let stackObserver;
  const updateNav = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      nav.classList.toggle("nav--scrolled", window.scrollY > 60);
    } else {
      nav.classList.remove("nav--scrolled");
    }
  };
  const updateActiveLink = () => {
    let current = "";
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const offset = isMobile ? 120 : 20;
    sections.forEach((section) => {
      const top = section.offsetTop - offset;
      if (window.scrollY >= top) current = section.getAttribute("id");
    });
    navAnchors.forEach((a) => {
      var isActive = a.getAttribute("href") === "#" + current;
      a.classList.toggle("nav__link--active", isActive);
      if (isActive) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  };
  const initHeroReveal = () => {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const allGroups = [];
    hero.querySelectorAll("[data-text]").forEach((el) => {
      const text = el.getAttribute("data-text");
      const spans = [];
      el.innerHTML = "";
      text.split("").forEach((ch) => {
        const span = document.createElement("span");
        span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        el.appendChild(span);
        spans.push({ el: span, target: ch });
      });
      allGroups.push({ parent: el, spans, text });
    });
    const scrambleTimer = setInterval(() => {
      allGroups.forEach((g) => {
        g.spans.forEach((s) => {
          if (!s.el.classList.contains("locked"))
            s.el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        });
      });
    }, 55);
    let maxEnd = 0;
    TIMED_GROUPS.forEach((tg) => {
      const elems = [];
      tg.selectors.forEach((sel) => {
        hero.querySelectorAll(sel).forEach((el) => {
          const g = allGroups.find((gr) => gr.parent === el);
          if (g) elems.push(g);
        });
      });
      if (!elems.length) return;

      if (tg.mode === "parallel") {
        elems.forEach((g) => {
          const charDelay = tg.duration / Math.max(g.text.length - 1, 1);
          const isTitle = g.parent.classList.contains("hero__title-line");
          const isDesc = g.parent.classList.contains("hero__desc");

          g.spans.forEach((s, i) => {
            setTimeout(() => {
              s.el.textContent = s.target;
              s.el.classList.add("locked");
              if (isTitle) {
                const fernIdx = g.text.indexOf("Fern\u00e1ndez");
                if (fernIdx !== -1 && i >= fernIdx)
                  s.el.classList.add("gradient");
              }
              if (isDesc) {
                const javaIdx = g.text.indexOf("Java");
                if (javaIdx !== -1 && i >= javaIdx && i < javaIdx + 4)
                  s.el.classList.add("strong");
              }
            }, i * charDelay);
          });
        });
      } else {
        const totalChars = elems.reduce((sum, g) => sum + g.text.length, 0);
        const charDelay = tg.duration / Math.max(totalChars - 1, 1);
        let cursor = 0;

        elems.forEach((g) => {
          g.spans.forEach((s, i) => {
            setTimeout(
              () => {
                s.el.textContent = s.target;
                s.el.classList.add("locked");
              },
              (cursor + i) * charDelay,
            );
          });
          cursor += g.text.length;
        });
      }

      if (tg.duration > maxEnd) maxEnd = tg.duration;
    });

    setTimeout(
      () => {
        clearInterval(scrambleTimer);
        hero.classList.add("hero--revealed");
      },
      SCRAMBLE + maxEnd + 200,
    );
  };

  const animateProgress = () => {
    if (progressAnimated) return;
    progressAnimated = true;
    targets.forEach(({ el, target }, i) => {
      setTimeout(() => {
        const duration = 1200;
        const start = performance.now();
        const tick = (now) => {
          const elapsed = now - start;
          const p = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.value = eased * target;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, i * 80);
    });
  };

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showToast(icon, msg, color) {
    var toast = document.createElement("div");
    toast.className = "discord-fab__toast";
    toast.innerHTML =
      '<span class="discord-fab__toast-dot" style="background:' +
      color +
      '"></span>' +
      '<span class="discord-fab__toast-icon">' +
      icon +
      "</span>" +
      '<span class="discord-fab__toast-msg">' +
      msg +
      "</span>";
    discordToasts.appendChild(toast);
    setTimeout(function () {
      toast.classList.add("discord-fab__toast--leaving");
      var removed = false;
      function safeRemove() {
        if (!removed) {
          removed = true;
          toast.remove();
        }
      }
      toast.addEventListener("animationend", safeRemove);
      setTimeout(safeRemove, 600);
    }, 3500);
  }

  var updateStatusUI = function (data) {
    var status = data.discord_status || "offline";
    var user = data.discord_user || {};

    if (user.avatar) {
      var ext = user.avatar.startsWith("a_") ? "gif" : "png";
      discordAvatar.src =
        "https://cdn.discordapp.com/avatars/" +
        user.id +
        "/" +
        user.avatar +
        "." +
        ext +
        "?size=80";
    }

    discordName.textContent = user.global_name || user.username || "Discord";
    discordDiscrim.textContent = "@" + (user.username || "");
    discordAvatar.alt =
      "Avatar de " + (user.global_name || user.username || "Discord");

    fabBtnDot.className =
      "discord-fab__btn-dot discord-fab__btn-dot--" + status;
    fabDot.className = "discord-fab__dot discord-fab__dot--" + status;
    fabLabel.textContent = STATUS_LABELS[status] || "Offline";

    var activities = (data.activities || []).filter(function (a) {
      return a.type !== 4 && a.name !== "Spotify";
    });

    var currentActivityName = null;
    var currentActivityType = null;
    var actText = "";

    if (activities.length > 0) {
      var act = activities[0];
      var actType =
        act.type === 0
          ? "Jugando"
          : act.type === 1
            ? "Transmitiendo"
            : act.type === 2
              ? "Escuchando"
              : "";
      actText = (actType ? actType + " " : "") + act.name;
      currentActivityName = act.name;
      currentActivityType =
        act.type === 0
          ? "playing"
          : act.type === 1
            ? "streaming"
            : act.type === 2
              ? "listening"
              : null;
    }
    fabActivity.textContent = actText;

    if (isFirstFetch) {
      prevStatus = status;
      prevActivityName = currentActivityName;
      prevActivityType = currentActivityType;
      isFirstFetch = false;
      return;
    }

    if (status !== prevStatus) {
      var msgs = STATUS_MESSAGES[status] || STATUS_MESSAGES.offline;
      showToast("\uD83D\uDCAC", pickRandom(msgs), STATUS_COLORS[status]);
      prevStatus = status;
    }

    if (
      currentActivityName !== prevActivityName ||
      currentActivityType !== prevActivityType
    ) {
      if (currentActivityName && ACTIVITY_MESSAGES[currentActivityType]) {
        var actMsgs = ACTIVITY_MESSAGES[currentActivityType];
        var actMsg = pickRandom(actMsgs)
          .replace("{game}", currentActivityName)
          .replace("{name}", currentActivityName);
        var actIcon =
          currentActivityType === "playing"
            ? "\uD83C\uDFAE"
            : currentActivityType === "listening"
              ? "\uD83C\uDFB5"
              : "\uD83D\uDCFA";
        showToast(actIcon, actMsg, STATUS_COLORS[status] || "#5865F2");
      } else if (prevActivityName && !currentActivityName) {
        showToast(
          "\uD83D\uDECC",
          "Actividad finalizada",
          STATUS_COLORS[status] || "#747f8d",
        );
      }
      prevActivityName = currentActivityName;
      prevActivityType = currentActivityType;
    }
  };

  var fetchStatus = function () {
    fetch(LANYARD_API)
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (json.success) updateStatusUI(json.data);
      })
      .catch(function () {
        if (prevStatus && prevStatus !== "offline") {
          showToast("\uD83D\uDCA1", "Perdi conexion con Discord", "#747f8d");
        }
        fabBtnDot.className =
          "discord-fab__btn-dot discord-fab__btn-dot--offline";
        fabDot.className = "discord-fab__dot discord-fab__dot--offline";
        fabLabel.textContent = "Offline";
        fabActivity.textContent = "";
        discordName.textContent = "Sin conexion";
        discordDiscrim.textContent = "";
        prevStatus = "offline";
        prevActivityName = null;
        prevActivityType = null;
      });
  };

  window.addEventListener("scroll", updateNav, { passive: true });
  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateNav();
  updateActiveLink();
  initHeroReveal();

  const navCurtain = document.querySelector(".nav__curtain");

  const hamburgerColors = [
    "#7b61ff",
    "#6c63ff",
    "#5b72ff",
    "#4a82ff",
    "#39a0ff",
    "#28beea",
    "#18d4c8",
    "#00d4aa",
    "#20e0a0",
    "#40ebaa",
  ];
  const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  };
  const getRandomHamburgerColor = () =>
    hamburgerColors[Math.floor(Math.random() * hamburgerColors.length)];

  const closeMenu = () => {
    navToggle.classList.remove("nav__toggle--open");
    navLinks.classList.remove("nav__links--open");
    navCurtain.classList.remove("nav__curtain--open");
    nav.classList.remove("nav--menu-open");
    document.body.classList.remove("menu-open");
    document.documentElement.style.removeProperty("--hamburger-rnd");
    document.documentElement.style.removeProperty("--hamburger-rnd-rgb");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menÃº de navegaciÃ³n");
  };

  const openMenu = () => {
    const rnd = getRandomHamburgerColor();
    document.documentElement.style.setProperty("--hamburger-rnd", rnd);
    document.documentElement.style.setProperty(
      "--hamburger-rnd-rgb",
      hexToRgb(rnd),
    );
    navToggle.classList.add("nav__toggle--open");
    navLinks.classList.add("nav__links--open");
    navCurtain.classList.add("nav__curtain--open");
    nav.classList.add("nav--menu-open");
    document.body.classList.add("menu-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Cerrar menÃº de navegaciÃ³n");
  };

  navToggle.addEventListener("click", () => {
    if (navLinks.classList.contains("nav__links--open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navLinks.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  progressBars.forEach((bar) => {
    const t = parseFloat(bar.getAttribute("value")) || 10;
    const m = parseFloat(bar.max) || 10;
    targets.push({ el: bar, target: t, max: m });
    bar.value = 0;
  });

  revealElements.forEach((el) => el.classList.add("reveal"));

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = Array.from(revealElements).indexOf(el) % 6;
          el.style.transitionDelay = delay * 0.08 + "s";
          el.classList.add("reveal--visible");
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  revealElements.forEach((el) => observer.observe(el));

  if (stackSection) {
    stackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateProgress();
            stackObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    stackObserver.observe(stackSection);
  }

  fabBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    fabPanel.classList.toggle("discord-fab__panel--open");
    var expanded = fabPanel.classList.contains("discord-fab__panel--open");
    fabBtn.setAttribute("aria-expanded", expanded);
  });

  document.addEventListener("click", function (e) {
    if (!fabPanel.contains(e.target) && !fabBtn.contains(e.target)) {
      fabPanel.classList.remove("discord-fab__panel--open");
    }
  });

  fetchStatus();
  setInterval(fetchStatus, 30000);

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var message = form.querySelector('[name="message"]').value.trim();
      if (!name || !email || !message) return;

      var to = "javiercarceles@outlook.es";
      var subject = encodeURIComponent("Mensaje desde portfolio - " + name);
      var body = encodeURIComponent(
        "Nombre: " +
          name +
          "\n" +
          "Email: " +
          email +
          "\n\n" +
          "Mensaje:\n" +
          message,
      );
      window.location.href =
        "mailto:" + to + "?subject=" + subject + "&body=" + body;

      var btn = form.querySelector("button[type=submit]");
      var original = btn.textContent;
      btn.textContent = "Abriendo correo... \u2713";
      btn.style.background = "#00d4aa";
      setTimeout(function () {
        btn.textContent = original;
        btn.style.background = "";
        form.reset();
      }, 3000);
    });
  }

  (function () {
    var sphereContainer = document.getElementById("sphere-container");
    if (!sphereContainer) return;

    var techs = [
      { name: "Java", slug: "openjdk", color: "ED8B00" },
      { name: "Python", slug: "python", color: "3776AB" },
      { name: "Spring", slug: "spring", color: "6DB33F" },
      { name: "Docker", slug: "docker", color: "2496ED" },
      { name: "PostgreSQL", slug: "postgresql", color: "4169E1" },
      { name: "MySQL", slug: "mysql", color: "4479A1" },
      { name: "MongoDB", slug: "mongodb", color: "47A248" },
      { name: "React", slug: "react", color: "61DAFB" },
      { name: "Angular", slug: "angular", color: "DD0031" },
      { name: "JavaScript", slug: "javascript", color: "F7DF1E" },
      { name: "TypeScript", slug: "typescript", color: "3178C6" },
      { name: "Node.js", slug: "nodedotjs", color: "339933" },
      { name: "Git", slug: "git", color: "F05032" },
      { name: "GitHub", slug: "github", color: "FFFFFF" },
      { name: "Kafka", slug: "apachekafka", color: "FFFFFF" },
      { name: "HTML5", slug: "html5", color: "E34F26" },
      { name: "CSS3", slug: "css", color: "1572B6" },
      { name: "Linux", slug: "linux", color: "FCC624" },
      { name: "FastAPI", slug: "fastapi", color: "009688" },

      { name: "VS Code", slug: "intellijidea", color: "FE315D" },
      { name: "Gradle", slug: "gradle", color: "FFFFFF" },
      { name: "Postman", slug: "postman", color: "FF6C37" },
      { name: "Jira", slug: "jira", color: "0052CC" },
      { name: "SonarQube", slug: "sonarqubeserver", color: "4E9BCD" },
      { name: "IA", slug: "pytorch", color: "EE4C2C" },
      { name: "JSON", slug: "json", color: "FFFFFF" },
    ];

    var techToTag = {
      Java: "java",
      Python: "python",
      Spring: "spring",
      Docker: "docker",
      PostgreSQL: "postgresql",
      MySQL: "mysql",
      MongoDB: "mongodb",
      React: "react",
      Angular: "angular",
      JavaScript: "javascript",
      TypeScript: "typescript",
      "Node.js": "node",
      Git: "git",
      GitHub: "github",
      Kafka: "kafka",
      HTML5: "html",
      CSS3: "css",
      Linux: "linux",
      FastAPI: "fastapi",

      "VS Code": "vs code",
      Gradle: "gradle",
      Postman: "postman",
      Jira: "jira",
      SonarQube: "sonarqube",
      IA: "ia",
      JSON: "bases de datos",
    };
    function matchesTag(txt, term) {
      if (txt === term) return true;
      return txt.indexOf(term + " ") !== -1 || txt.indexOf(" " + term) !== -1;
    }

    var scene = document.createElement("div");
    scene.className = "sphere__scene";
    var pivot = document.createElement("div");
    pivot.className = "sphere__pivot";

    var n = techs.length;
    var sphereRadius = 170;
    var itemsArr = [];

    var phi = (1 + Math.sqrt(5)) / 2;
    for (var i = 0; i < techs.length; i++) {
      var lat = Math.asin(-1 + 2 * (i + 0.5) / techs.length);
      var lon = 2 * Math.PI * i / phi;

      var x = Math.cos(lat) * Math.cos(lon);
      var y = Math.sin(lat);
      var z = Math.cos(lat) * Math.sin(lon);

      var tech = techs[i];
      var item = document.createElement("div");
      item.className = "sphere__item";
      item.setAttribute("data-tech", tech.name);

      var img = document.createElement("img");
      img.src = "https://cdn.simpleicons.org/" + tech.slug + "/" + tech.color;
      img.alt = tech.name;
      img.title = tech.name;
      img.loading = "lazy";
      img.draggable = false;

      item.appendChild(img);
      pivot.appendChild(item);
      itemsArr.push({ el: item, img: img, x: x, y: y, z: z, name: tech.name });
    }

    var badgeColorMap = {
      "badge--purple": "#a855f7",
      "badge--red": "#ef4444",
      "badge--python": "#2563eb",
      "badge--fullstack": "#10b981",
      "badge--cyan": "#06b6d4",
      "badge--orange": "#f97316",
      "badge--pink": "#d946ef",
      "badge--amber": "#eab308",
    };

    var connMap = {};
    var cards = document.querySelectorAll(".projects__card");
    cards.forEach(function (card) {
      var tags = card.querySelectorAll(".projects__card-tags li");
      var badge = card.querySelector("[class*='badge--']");
      var lineColor = "#10b981";
      if (badge) {
        var cls = badge.className.split(" ");
        for (var k = 0; k < cls.length; k++) {
          if (badgeColorMap[cls[k]]) { lineColor = badgeColorMap[cls[k]]; break; }
        }
      }
      var found = [];
      tags.forEach(function (tag) {
        var txt = tag.textContent.toLowerCase();
        for (var i = 0; i < techs.length; i++) {
          var search = (techToTag[techs[i].name] || techs[i].name).toLowerCase();
          if (matchesTag(txt, search)) { found.push(techs[i].name); break; }
        }
      });
      for (var a = 0; a < found.length; a++) {
        for (var b = a + 1; b < found.length; b++) {
          var key = found[a] < found[b] ? found[a] + "|" + found[b] : found[b] + "|" + found[a];
          if (!connMap[key]) connMap[key] = [];
          connMap[key].push(lineColor);
        }
      }
    });

    var connPairs = [];
    Object.keys(connMap).forEach(function (key) {
      var pair = key.split("|");
      var ai = -1, bi = -1;
      for (var i = 0; i < itemsArr.length; i++) {
        if (itemsArr[i].name === pair[0]) ai = i;
        if (itemsArr[i].name === pair[1]) bi = i;
      }
      if (ai !== -1 && bi !== -1) connPairs.push([ai, bi, connMap[key].length]);
    });

    function scoreSA() {
      var s = 0;
      for (var i = 0; i < connPairs.length; i++) {
        var a = itemsArr[connPairs[i][0]], b = itemsArr[connPairs[i][1]];
        var dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        s += (dx * dx + dy * dy + dz * dz) * connPairs[i][2];
      }
      return s;
    }

    var bestScore = scoreSA();
    var bestPos = itemsArr.map(function (it) { return { x: it.x, y: it.y, z: it.z }; });
    var temp = 2.5;
    for (var iter = 0; iter < 10000; iter++) {
      var i1 = Math.floor(Math.random() * itemsArr.length);
      var i2 = Math.floor(Math.random() * itemsArr.length);
      while (i2 === i1) i2 = Math.floor(Math.random() * itemsArr.length);
      var tx = itemsArr[i1].x, ty = itemsArr[i1].y, tz = itemsArr[i1].z;
      itemsArr[i1].x = itemsArr[i2].x; itemsArr[i1].y = itemsArr[i2].y; itemsArr[i1].z = itemsArr[i2].z;
      itemsArr[i2].x = tx; itemsArr[i2].y = ty; itemsArr[i2].z = tz;
      var ns = scoreSA();
      if (ns > bestScore || Math.random() < Math.exp((ns - bestScore) / temp)) {
        bestScore = ns;
        bestPos = itemsArr.map(function (it) { return { x: it.x, y: it.y, z: it.z }; });
      } else {
        var rx = itemsArr[i1].x, ry = itemsArr[i1].y, rz = itemsArr[i1].z;
        itemsArr[i1].x = itemsArr[i2].x; itemsArr[i1].y = itemsArr[i2].y; itemsArr[i1].z = itemsArr[i2].z;
        itemsArr[i2].x = rx; itemsArr[i2].y = ry; itemsArr[i2].z = rz;
      }
      temp *= 0.997;
    }
    for (var i = 0; i < itemsArr.length; i++) {
      itemsArr[i].x = bestPos[i].x; itemsArr[i].y = bestPos[i].y; itemsArr[i].z = bestPos[i].z;
    }

    scene.appendChild(pivot);
    sphereContainer.appendChild(scene);

    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:50;";
    scene.appendChild(svg);
    var svgG = document.createElementNS(svgNS, "g");
    svg.appendChild(svgG);

    var svgLines = [];
    var shadowLines = [];
    Object.keys(connMap).forEach(function (key) {
      var pair = key.split("|");
      var colors = connMap[key];
      var fromIdx = -1, toIdx = -1;
      for (var i = 0; i < itemsArr.length; i++) {
        if (itemsArr[i].name === pair[0]) fromIdx = i;
        if (itemsArr[i].name === pair[1]) toIdx = i;
      }
      if (fromIdx === -1 || toIdx === -1) return;
      for (var c = 0; c < colors.length; c++) {
        var line = document.createElementNS(svgNS, "line");
        line.setAttribute("stroke", colors[c]);
        line.setAttribute("stroke-width", "1.5");
        line.setAttribute("stroke-opacity", "0.6");
        svgG.appendChild(line);
        svgLines.push({ el: line, from: fromIdx, to: toIdx, idx: c, total: colors.length });
      }
      var sline = document.createElementNS(svgNS, "line");
      sline.setAttribute("stroke", "#555");
      sline.setAttribute("stroke-width", "0.8");
      sline.setAttribute("stroke-opacity", "0");
      svgG.appendChild(sline);
      shadowLines.push({ el: sline, from: fromIdx, to: toIdx });
    });

    var coloredKeys = {};
    Object.keys(connMap).forEach(function (k) { coloredKeys[k] = true; });

    var greyLines = [];

    function norm3(x, y, z) {
      var len = Math.sqrt(x * x + y * y + z * z);
      return len > 0 ? [x / len, y / len, z / len] : [0, 0, 0];
    }
    function angDist3(a, b) {
      var dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      return Math.acos(Math.max(-1, Math.min(1, dot)));
    }

    for (var gi = 0; gi < itemsArr.length; gi++) {
      for (var gj = gi + 1; gj < itemsArr.length; gj++) {
        var na = itemsArr[gi].name, nb = itemsArr[gj].name;
        var gkey = na < nb ? na + "|" + nb : nb + "|" + na;
        if (coloredKeys[gkey]) continue;

        var ai = [itemsArr[gi].x, itemsArr[gi].y, itemsArr[gi].z];
        var bi = [itemsArr[gj].x, itemsArr[gj].y, itemsArr[gj].z];

        var mid = norm3(ai[0] + bi[0], ai[1] + bi[1], ai[2] + bi[2]);
        var halfDist = angDist3(ai, mid);

        var blocked = false;
        for (var gk = 0; gk < itemsArr.length; gk++) {
          if (gk === gi || gk === gj) continue;
          var ki = [itemsArr[gk].x, itemsArr[gk].y, itemsArr[gk].z];
          if (angDist3(ki, mid) < halfDist - 0.005) { blocked = true; break; }
        }

        if (!blocked) {
          var gline = document.createElementNS(svgNS, "line");
          gline.setAttribute("stroke", "#555");
          gline.setAttribute("stroke-width", "0.8");
          gline.setAttribute("stroke-opacity", "0.6");
          svgG.appendChild(gline);
          greyLines.push({ el: gline, from: gi, to: gj });
        }
      }
    }

    var rotX = 0.3;
    var rotY = 0;
    var autoSpeedX = 0.0015;
    var autoSpeedY = 0.004;
    var isDragging = false;
    var isPaused = false;
    var lastX = 0;
    var lastY = 0;
    var velX = 0;
    var velY = 0;
    var mouseDownX = 0;
    var mouseDownY = 0;
    var didDrag = false;
    var hoveredIdx = -1;

    function update() {
      if (!isDragging && !isPaused) {
        rotY += autoSpeedY;
        rotX += autoSpeedX;
      } else if (isDragging) {
        rotY += velX;
        rotX += velY;
        velX *= 0.92;
        velY *= 0.92;
      }

      var cx = Math.cos(-rotX),
        sx = Math.sin(-rotX);
      var cy = Math.cos(rotY),
        sy = Math.sin(rotY);

      for (var i = 0; i < itemsArr.length; i++) {
        var it = itemsArr[i];
        var x1 = it.x * cy + it.z * sy;
        var z1 = -it.x * sy + it.z * cy;
        var y2 = it.y * cx - z1 * sx;
        var z2 = it.y * sx + z1 * cx;
        var depth = (z2 + 1) * 0.5;
        var opacity = 0.35 + depth * 0.65;
        var scale = 0.7 + depth * 0.3;

        it.cx = x1 * sphereRadius;
        it.cy = y2 * sphereRadius;
        it.depth = depth;
        it.img.style.opacity = opacity;
        it.el.style.zIndex = it.el.matches(":hover") ? 200 : Math.round(depth * 100);
        it.el.style.transform =
          "translateX(" + it.cx.toFixed(1) + "px)" +
          " translateY(" + it.cy.toFixed(1) + "px)" +
          " scale(" + scale.toFixed(3) + ")";
      }

      svgG.setAttribute("transform", "translate(" + (scene.clientWidth / 2) + "," + (scene.clientHeight / 2) + ")");
      for (var j = 0; j < svgLines.length; j++) {
        var ln = svgLines[j];
        var a = itemsArr[ln.from], b = itemsArr[ln.to];
        var dx = b.cx - a.cx, dy = b.cy - a.cy;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) continue;
        var ux = dx / len, uy = dy / len;
        var nx = -uy, ny = ux;
        var iconR = 26;
        var spacing = 5;
        var offset = ln.total === 1 ? 0 : (ln.idx - (ln.total - 1) / 2) * spacing;
        var ox = nx * offset, oy = ny * offset;
        var x1 = (a.cx + ux * iconR + ox).toFixed(1);
        var y1 = (a.cy + uy * iconR + oy).toFixed(1);
        var x2 = (b.cx - ux * iconR + ox).toFixed(1);
        var y2 = (b.cy - uy * iconR + oy).toFixed(1);
        var showColor = hoveredIdx === -1 || ln.from === hoveredIdx || ln.to === hoveredIdx;
        ln.el.setAttribute("stroke-opacity", showColor ? "0.6" : "0");
        ln.el.setAttribute("x1", x1);
        ln.el.setAttribute("y1", y1);
        ln.el.setAttribute("x2", x2);
        ln.el.setAttribute("y2", y2);
      }


      for (var g = 0; g < greyLines.length; g++) {
        var gl = greyLines[g];
        var ga = itemsArr[gl.from], gb = itemsArr[gl.to];
        var gdx = gb.cx - ga.cx, gdy = gb.cy - ga.cy;
        var glen = Math.sqrt(gdx * gdx + gdy * gdy);
        if (glen < 1) continue;
        var gux = gdx / glen, guy = gdy / glen;
        var gAvgDepth = (ga.depth + gb.depth) / 2;
        var gOpacity = (0.15 + gAvgDepth * 0.55).toFixed(2);
        gl.el.setAttribute("stroke-opacity", gOpacity);
        gl.el.setAttribute("x1", (ga.cx + gux * 26).toFixed(1));
        gl.el.setAttribute("y1", (ga.cy + guy * 26).toFixed(1));
        gl.el.setAttribute("x2", (gb.cx - gux * 26).toFixed(1));
        gl.el.setAttribute("y2", (gb.cy - guy * 26).toFixed(1));
      }

      requestAnimationFrame(update);
    }
    update();

    scene.addEventListener("mousedown", function (e) {
      isDragging = true;
      didDrag = false;
      lastX = mouseDownX = e.clientX;
      lastY = mouseDownY = e.clientY;
      e.preventDefault();
    });
    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      var dx = e.clientX - mouseDownX;
      var dy = e.clientY - mouseDownY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag = true;
      velX = (lastX - e.clientX) * 0.006;
      velY = (e.clientY - lastY) * 0.006;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    document.addEventListener("mouseup", function () {
      isDragging = false;
    });

    scene.addEventListener(
      "touchstart",
      function (e) {
        isDragging = true;
        isPaused = true;
        didDrag = false;
        lastX = mouseDownX = e.touches[0].clientX;
        lastY = mouseDownY = e.touches[0].clientY;
      },
      { passive: true },
    );
    document.addEventListener(
      "touchmove",
      function (e) {
        if (!isDragging) return;
        var dx = e.touches[0].clientX - mouseDownX;
        var dy = e.touches[0].clientY - mouseDownY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag = true;
        velX = (lastX - e.touches[0].clientX) * 0.006;
        velY = (e.touches[0].clientY - lastY) * 0.006;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      },
      { passive: true },
    );
    document.addEventListener("touchend", function () {
      isDragging = false;
      isPaused = false;
    });

    scene.addEventListener("mouseenter", function () {
      isPaused = true;
    });
    scene.addEventListener("mouseleave", function () {
      isPaused = false;
    });

    var badgeColors = {
      "badge--purple": "#a855f7",
      "badge--red": "#ef4444",
      "badge--python": "#2563eb",
      "badge--fullstack": "#10b981",
      "badge--cyan": "#06b6d4",
      "badge--orange": "#f97316",
      "badge--pink": "#d946ef",
      "badge--amber": "#eab308",
    };

    var techUsage = {};
    cards.forEach(function (card) {
      var section = card.closest("section");
      var group = (section && section.id === "experience") ? "experience" : "projects";
      var titleEl = card.querySelector(".projects__card-title");
      var cardTitle = titleEl ? titleEl.textContent.trim() : "";
      var badge = card.querySelector("[class*='badge--']");
      var color = "#6c63ff";
      if (badge) {
        var cls = badge.className.split(" ");
        for (var b = 0; b < cls.length; b++) {
          if (badgeColors[cls[b]]) { color = badgeColors[cls[b]]; break; }
        }
      }
      var tags = card.querySelectorAll(".projects__card-tags li");
      tags.forEach(function (tag) {
        var txt = tag.textContent.toLowerCase();
        for (var i = 0; i < techs.length; i++) {
          var search = (techToTag[techs[i].name] || techs[i].name).toLowerCase();
          if (matchesTag(txt, search)) {
            var n = techs[i].name;
            if (!techUsage[n]) techUsage[n] = { projects: [], experience: [] };
            techUsage[n][group].push({ title: cardTitle, color: color, card: card, tag: tag });
            break;
          }
        }
      });
    });

    var techIconMap = {};
    techs.forEach(function (t) { techIconMap[t.name] = t; });
    var modal = document.createElement("div");
    modal.className = "tech-modal-overlay";
    modal.innerHTML =
      '<div class="tech-modal">' +
        '<button class="tech-modal__close" aria-label="Cerrar">&times;</button>' +
        '<div class="tech-modal__header">' +
          '<img class="tech-modal__icon" src="" alt="">' +
          '<h3 class="tech-modal__title"></h3>' +
        '</div>' +
        '<div class="tech-modal__body"></div>' +
      '</div>';
    document.body.appendChild(modal);

    function openTechModal(name) {
      var usage = techUsage[name];
      var info = techIconMap[name];
      if (!usage || !info) return;
      modal.querySelector(".tech-modal__title").textContent = name;
      modal.querySelector(".tech-modal__icon").src =
        "https://cdn.simpleicons.org/" + info.slug + "/" + info.color;
      modal.querySelector(".tech-modal__icon").alt = name;
      var body = modal.querySelector(".tech-modal__body");
      body.innerHTML = "";
      var groups = [
        { key: "projects", label: "Proyectos destacados", cls: "projects" },
        { key: "experience", label: "Experiencia Profesional", cls: "experience" },
      ];
      groups.forEach(function (g) {
        var items = usage[g.key];
        if (!items || items.length === 0) return;
        var div = document.createElement("div");
        div.className = "tech-modal__group";
        var h4 = document.createElement("h4");
        h4.className = "tech-modal__group-title tech-modal__group-title--" + g.cls;
        h4.textContent = g.label;
        div.appendChild(h4);
        var ul = document.createElement("ul");
        ul.className = "tech-modal__list";
        items.forEach(function (item) {
          var li = document.createElement("li");
          li.style.cursor = "pointer";
          var dot = document.createElement("span");
          dot.className = "tech-modal__dot";
          dot.style.background = item.color;
          li.appendChild(dot);
          li.appendChild(document.createTextNode(item.title));
          li.addEventListener("click", function () {
            modal.classList.remove("active");
            item.card.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(function () {
              var tagLi = item.tag;
              tagLi.classList.add("tag--glow");
              tagLi.style.borderColor = item.color;
              tagLi.style.boxShadow = "0 0 0 2px " + item.color + ", 0 0 18px " + item.color;
              setTimeout(function () {
                tagLi.style.borderColor = "";
                tagLi.style.boxShadow = "";
                setTimeout(function () {
                  tagLi.classList.remove("tag--glow");
                }, 1600);
              }, 2500);
            }, 500);
          });
          ul.appendChild(li);
        });
        div.appendChild(ul);
        body.appendChild(div);
      });
      modal.classList.add("active");
    }

    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.classList.contains("tech-modal__close"))
        modal.classList.remove("active");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") modal.classList.remove("active");
    });

    itemsArr.forEach(function (it) {
      it.el.addEventListener("click", function () {
        if (didDrag) return;
        openTechModal(it.name);
      });
    });

    itemsArr.forEach(function (it, idx) {
      it.el.addEventListener("mouseenter", function () {
        hoveredIdx = idx;
      });
      it.el.addEventListener("mouseleave", function () {
        hoveredIdx = -1;
      });
    });

    var projectCards = document.querySelectorAll(".projects__card");
    projectCards.forEach(function (card) {
      var raf = null;
      var t0 = 0;
      card.addEventListener("mouseenter", function () {
        t0 = performance.now();
        function tick(now) {
          var t = ((now - t0) % 2000) / 2000;
          card.style.setProperty("--sweep", (100 - t * 100) + "%");
          raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);
      });
      card.addEventListener("mouseleave", function () {
        cancelAnimationFrame(raf);
        card.style.setProperty("--sweep", "100%");
      });
    });
  })();
});
