// ─────────────────────────────────────────────
//  Carga navbar y footer, luego inicializa todo
// ─────────────────────────────────────────────
Promise.all([
  fetch("navbar.html").then(r => r.text()),
  fetch("footer.html").then(r => r.text())
]).then(([navHTML, footerHTML]) => {
  document.getElementById("navbar-container").innerHTML = navHTML;
  document.getElementById("footer-container").innerHTML = footerHTML;
  initNavbar();
});

// ─────────────────────────────────────────────
//  Navbar
// ─────────────────────────────────────────────
function initNavbar() {
  const navbar     = document.getElementById("navbar");
  const burger     = document.getElementById("nav-burger");
  const mobileMenu = document.getElementById("nav-mobile");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  });

  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    mobileMenu.classList.toggle("open");
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      burger.classList.remove("open");
      mobileMenu.classList.remove("open");
    });
  });
}

// ─────────────────────────────────────────────
//  Animaciones fade-in (IntersectionObserver)
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const fadeEls = document.querySelectorAll(".fade-in");
  if (fadeEls.length > 0) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity    = "1";
          entry.target.style.transform  = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(el => {
      el.style.opacity    = "0";
      el.style.transform  = "translateY(30px)";
      el.style.transition = "opacity .6s ease, transform .6s ease";
      observer.observe(el);
    });
  }

  // Filtros de proyectos
  initProjectFilters();

  // Formulario de contacto
  initContactForm();
});

// ─────────────────────────────────────────────
//  Filtros – proyectos.html
//  Lee ?filter=XXX desde el navbar
// ─────────────────────────────────────────────
function initProjectFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  if (filterBtns.length === 0) return;

  const categories = {
    "modelado3d":     document.getElementById("cat-modelado3d"),
    "branding":       document.getElementById("cat-branding"),
    "disenio-visual": document.getElementById("cat-disenio-visual")
  };

  function applyFilter(filter) {
    filterBtns.forEach(b => {
      b.classList.toggle("active", b.dataset.filter === filter);
    });

    Object.entries(categories).forEach(([key, el]) => {
      if (!el) return;
      if (filter === "all" || filter === key) {
        el.classList.remove("hidden");
        el.style.opacity   = "0";
        el.style.transform = "translateY(16px)";
        requestAnimationFrame(() => {
          el.style.transition = "opacity 0.35s ease, transform 0.35s ease";
          el.style.opacity    = "1";
          el.style.transform  = "translateY(0)";
        });
      } else {
        el.classList.add("hidden");
      }
    });
  }

  const params = new URLSearchParams(window.location.search);
  const urlFilter = params.get("filter");
  const initialFilter = urlFilter && categories[urlFilter] ? urlFilter : "all";
  applyFilter(initialFilter);

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });
}

// ─────────────────────────────────────────────
//  Formulario de contacto – contacto.html
//  (envío simulado — conectar backend más adelante)
// ─────────────────────────────────────────────
function initContactForm() {
  var form      = document.querySelector(".cp-form");
  var submitBtn = form ? form.querySelector(".cp-submit") : null;
  if (!form || !submitBtn) return;

  var allInputs = form.querySelectorAll("input");
  var nameEl    = null;
  var subjectEl = null;
  allInputs.forEach(function(inp) {
    var ph = inp.placeholder.toLowerCase();
    if (ph.includes("nombre"))                              nameEl    = inp;
    if (ph.includes("asunto") || ph.includes("hablar"))    subjectEl = inp;
  });
  var emailEl = form.querySelector("input[type='email']");
  var msgEl   = form.querySelector("textarea");

  submitBtn.addEventListener("click", function() {
    var nombre  = nameEl  ? nameEl.value.trim()  : "";
    var correo  = emailEl ? emailEl.value.trim()  : "";
    var mensaje = msgEl   ? msgEl.value.trim()    : "";

    if (!nombre || !correo || !mensaje) {
      showFormStatus(form, "error", "Por favor completa los campos obligatorios (nombre, correo y mensaje).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      showFormStatus(form, "error", "El correo electrónico no es válido.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Enviando\u2026 <i class='fa-solid fa-spinner fa-spin'></i>";

    setTimeout(function() {
      showFormStatus(form, "success", "\u00a1Mensaje enviado! Te responder\u00e9 pronto \uD83D\uDC9C");
      if (nameEl)    nameEl.value    = "";
      if (emailEl)   emailEl.value   = "";
      if (subjectEl) subjectEl.value = "";
      if (msgEl)     msgEl.value     = "";
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Enviar mensaje <i class='fa-solid fa-paper-plane'></i>";
    }, 1000);
  });
}

function showFormStatus(form, type, msg) {
  var statusEl = form.querySelector(".cp-status");
  if (!statusEl) {
    statusEl = document.createElement("p");
    statusEl.className = "cp-status";
    form.insertBefore(statusEl, form.querySelector(".cp-submit"));
  }
  statusEl.textContent = msg;
  statusEl.style.cssText = [
    "padding: 10px 16px",
    "border-radius: 8px",
    "font-size: 0.9rem",
    "font-weight: 500",
    "margin-bottom: 12px",
    type === "success"
      ? "background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7"
      : "background:#fce4ec; color:#c62828; border:1px solid #ef9a9a"
  ].join(";");
}


// ─────────────────────────────────────────────
//  Visor 3D – Modal Sketchfab
// ─────────────────────────────────────────────
(function () {
    var overlay  = document.getElementById("modal-3d");
    var iframe   = document.getElementById("modal3d-iframe");
    var titleEl  = document.getElementById("modal3d-title");
    var closeBtn = document.getElementById("modal3d-close");
    var extLink  = document.getElementById("modal3d-extlink");

    if (!overlay) return;

    // Derivar URL pública de Sketchfab desde el embed URL
    function embedToPublic(embedUrl) {
        var match = embedUrl.match(/models\/([a-f0-9]+)\/embed/);
        return match ? "https://sketchfab.com/models/" + match[1] : "#";
    }

    function openModal(embedUrl, title) {
        titleEl.textContent = title;
        iframe.src = embedUrl + "?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark_link=0&ui_watermark=0&camera=0";
        extLink.href = embedToPublic(embedUrl);
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        overlay.classList.remove("open");
        iframe.src = "";
        document.body.style.overflow = "";
    }

    // Activar cards 3D
    document.querySelectorAll(".proy-card--3d").forEach(function (card) {
        function activate() {
            var embedUrl = card.dataset.embed;
            var title    = card.dataset.title;
            if (embedUrl) openModal(embedUrl, title);
        }
        card.addEventListener("click", activate);
        card.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
        });
    });

    // Cerrar
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeModal();
    });
})();


// ─────────────────────────────────────────────
//  Modal de Proyecto — Branding / Diseño Visual
// ─────────────────────────────────────────────
(function () {
    var overlay   = document.getElementById("modal-proyecto");
    var closeBtn  = document.getElementById("modalproy-close");
    var titleEl   = document.getElementById("modalproy-title");
    var badgeEl   = document.getElementById("modalproy-badge");
    var imgEl     = document.getElementById("modalproy-img");
    var descEl    = document.getElementById("modalproy-desc");
    var toolsEl   = document.getElementById("modalproy-tools");
    var tagsEl    = document.getElementById("modalproy-tags");
    var galleryEl = document.getElementById("modalproy-gallery");

    if (!overlay) return;

    function makeTags(container, csvString) {
        container.innerHTML = "";
        if (!csvString) return;
        csvString.split(",").forEach(function (t) {
            var span = document.createElement("span");
            span.className = "modalproy-tag";
            span.textContent = t.trim();
            container.appendChild(span);
        });
    }

    function setActiveImg(src, thumbs) {
        imgEl.src = src;
        thumbs.forEach(function (th) {
            th.classList.toggle("active", th.dataset.src === src);
        });
    }

    function buildGallery(imgs) {
        galleryEl.innerHTML = "";
        if (!imgs || imgs.length <= 1) {
            galleryEl.classList.add("hidden");
            return;
        }
        galleryEl.classList.remove("hidden");
        var thumbs = [];
        imgs.forEach(function (src, i) {
            var th = document.createElement("img");
            th.className = "modalproy-thumb" + (i === 0 ? " active" : "");
            th.src = src.trim();
            th.alt = "Vista " + (i + 1);
            th.dataset.src = src.trim();
            th.addEventListener("click", function () {
                setActiveImg(src.trim(), thumbs);
            });
            galleryEl.appendChild(th);
            thumbs.push(th);
        });
    }

    function openModal(card) {
        var imgs = card.dataset.modalImgs
            ? card.dataset.modalImgs.split(",").map(function(s){ return s.trim(); })
            : (card.dataset.modalImg ? [card.dataset.modalImg] : []);

        titleEl.textContent  = card.dataset.modalTitle  || "";
        badgeEl.textContent  = card.dataset.modalBadge  || "";
        imgEl.src            = imgs[0] || "";
        imgEl.alt            = card.dataset.modalTitle  || "";
        descEl.textContent   = card.dataset.modalDesc   || "";
        makeTags(toolsEl, card.dataset.modalTools);
        makeTags(tagsEl,  card.dataset.modalTags);
        buildGallery(imgs);
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
    }

    document.querySelectorAll(".proy-card--info").forEach(function (card) {
        function activate() { openModal(card); }
        card.addEventListener("click", activate);
        card.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
        });
    });

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeModal();
    });
})();
