const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const revealItems = document.querySelectorAll(".reveal");
const typewriterItems = document.querySelectorAll("[data-typewriter-text]");
const trustedOrbitLogos = document.querySelectorAll(".trusted-orbit-logo");
const modal = document.querySelector("[data-scanner-modal]");
const modalPanel = document.querySelector("[data-modal-panel]");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");
let forms = [];

const MODAL_STORAGE_KEY = "sisu-scanner-dismissed-at";
const MODAL_DELAY_MS = 20000;
const MODAL_HIDE_MS = 1000 * 60 * 60;
const IMPULSA_API_BASE_URL = "https://impulsagroup.com/api";
const CONTACT_API_ENDPOINT = "https://impulsagroup.com/api/contact_form_landing_page/index.php";
const BLOG_API_ENDPOINT = "https://impulsagroup.com/api/blog_api/index.php";
const PRODUCT_API_ENDPOINT = "https://impulsagroup.com/api/producto_api/index.php";
const CONTACT_PUBLIC_KEY = "pk_56addd3b121a7c30977555dfb61e9a40";
const VISIT_TRACKER_SCRIPT_URL = "https://impulsagroup.com/assets/impulsa_material/js/visit-tracker.js";
const CHATBOT_SCRIPT_URL = `https://impulsagroup.com/api/chatbot_widget/widget.js?public_key=${CONTACT_PUBLIC_KEY}`;
const DEMO_CTA_LABEL = "Solicitar Demo Pausa Viva";
const BLOG_FALLBACK_POSTS = [
  {
    slug: "como-recuperar-foco-en-contextos-laborales-exigentes",
    title: "Como recuperar foco en contextos laborales exigentes",
    excerpt: "Un marco simple para detectar interrupciones, reducir friccion cognitiva y recuperar claridad operativa.",
    category: "Pausa Viva",
  },
  {
    slug: "por-que-necesitamos-pausar-el-valor-de-reconectar-sin-pantallas",
    title: "Por que necesitamos pausar: el valor de reconectar sin pantallas",
    excerpt: "Por que una pausa real puede bajar saturacion, recuperar presencia y mejorar la calidad del trabajo.",
    category: "Pausa Viva",
  },
  {
    slug: "la-mente-es-el-principal-activo-de-trabajo",
    title: "La mente es el principal activo de trabajo: por que cuidarla ya no es opcional",
    excerpt: "Una mirada estrategica sobre claridad mental, foco y energia como condiciones para trabajar mejor.",
    category: "Pausa Viva",
  },
  {
    slug: "estrategia-para-desembarcar-en-argentina",
    title: "Estrategia para desembarcar en Argentina",
    excerpt: "Factores operativos, comerciales y de representacion para construir presencia local con eficiencia.",
    category: "Consultoria",
  },
  {
    slug: "oficina-de-transicion-una-forma-eficiente-de-entrar-al-mercado-local",
    title: "Oficina de transicion: una forma eficiente de entrar al mercado local",
    excerpt: "Como expandirse con una estructura gradual y mas liviana antes de abrir operaciones propias.",
    category: "Consultoria",
  },
];

const scannerQuestions = [
  {
    text: "Notas que a tu equipo le cuesta mantener foco profundo en tareas complejas sin dispersarse con chat o notificaciones internas?",
    options: [
      { label: "Nunca", score: 0 },
      { label: "A veces", score: 1 },
      { label: "Frecuentemente", score: 2 },
    ],
  },
  {
    text: 'Percibis que los lideres o mandos medios toman decisiones reactivas, en "modo incendio", en lugar de operar con planificacion estrategica?',
    options: [
      { label: "Nunca", score: 0 },
      { label: "A veces", score: 1 },
      { label: "Frecuentemente", score: 2 },
    ],
  },
  {
    text: "Identificas un aumento en errores operativos simples, olvidos o demoras en entregas?",
    options: [
      { label: "Nunca", score: 0 },
      { label: "A veces", score: 1 },
      { label: "Frecuentemente", score: 2 },
    ],
  },
  {
    text: "Los niveles de ausentismo, licencias cortas por estres o rotacion de personal han mostrado un incremento en el ultimo semestre?",
    options: [
      { label: "Nunca", score: 0 },
      { label: "A veces", score: 1 },
      { label: "Frecuentemente", score: 2 },
    ],
  },
  {
    text: "Al final de la jornada laboral, el clima que se percibe en la oficina o canales virtuales es de saturacion y pesadez en lugar de motivacion?",
    options: [
      { label: "Nunca", score: 0 },
      { label: "A veces", score: 1 },
      { label: "Frecuentemente", score: 2 },
    ],
  },
  {
    text: "Se implementan en tu empresa pausas o protocolos con respaldo cientifico para que los colaboradores recuperen su foco y energia mental durante el dia?",
    options: [
      { label: "Nunca", score: 2 },
      { label: "A veces", score: 1 },
      { label: "Frecuentemente", score: 0 },
    ],
  },
];

const scannerZones = {
  green: {
    name: "Zona Verde",
    range: "0 a 4 puntos",
    title: "Capacidad mental disponible",
    copy: "La organizacion muestra buenos indicadores de claridad, foco y funcionamiento cotidiano. El objetivo es sostener esa capacidad frente a picos de exigencia.",
    recommendation: "Mantener habitos preventivos de recuperacion mental.",
    ctaLabel: "Conocer Pausa Viva",
    ctaHref: "pausa-viva.html",
  },
  yellow: {
    name: "Zona Amarilla",
    range: "5 a 8 puntos",
    title: "Senales de saturacion activa",
    copy: "El equipo muestra senales de desgaste que pueden afectar foco, energia, clima y capacidad de respuesta. Hay margen para intervenir de forma preventiva.",
    recommendation: "Revisar que condiciones estan drenando claridad.",
    ctaLabel: "Coordinar Demo",
    ctaHref: "contacto.html#formulario-contacto",
  },
  red: {
    name: "Zona Roja",
    range: "9 a 12 puntos",
    title: "Carga mental elevada",
    copy: "La organizacion muestra senales consistentes de saturacion mental. Esto puede impactar en errores, ausentismo, rotacion y desgaste de lideres.",
    recommendation: "Implementar una intervencion breve, medible y adaptada.",
    ctaLabel: "Coordinar Demo",
    ctaHref: "contacto.html#formulario-contacto",
  },
};

let lastFocusedElement = null;
let modalTimer = null;
let demoModal = null;
let demoModalPanel = null;

function loadExternalScript(src, options = {}) {
  if (!src) {
    return Promise.resolve();
  }

  const existingScript = document.querySelector(`script[src="${src}"]`);
  if (existingScript) {
    return Promise.resolve(existingScript);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    if (options.async !== undefined) {
      script.async = options.async;
    }
    if (options.defer !== undefined) {
      script.defer = options.defer;
    }
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`No pudimos cargar el script externo: ${src}`));
    (options.parent || document.head).appendChild(script);
  });
}

function initImpulsaIntegrations() {
  window.IMPULSA_API_CONFIG = {
    publicKey: CONTACT_PUBLIC_KEY,
    apiBaseUrl: IMPULSA_API_BASE_URL,
  };

  const currentProtocol = window.location.protocol;
  const currentHostname = window.location.hostname;
  if (currentProtocol === "file:" || currentHostname === "localhost" || currentHostname === "127.0.0.1") {
    console.warn(
      "El contador de visitas de Impulsa puede no registrar visitas desde file:// o localhost. Pruebalo desde el dominio publicado."
    );
  }

  Promise.all([
    loadExternalScript(VISIT_TRACKER_SCRIPT_URL, { async: false, defer: false, parent: document.body || document.head }),
    loadExternalScript(CHATBOT_SCRIPT_URL),
  ]).catch((error) => {
    console.error("Error al cargar integraciones externas de Impulsa:", error);
  });
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(responseText || `HTTP ${response.status}`);
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function pickFirstString(source, candidates) {
  if (!source || typeof source !== "object") {
    return "";
  }

  for (const key of candidates) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function pickFirstValue(source, candidates) {
  if (!source || typeof source !== "object") {
    return "";
  }

  for (const key of candidates) {
    const value = source[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
}

function extractApiCollection(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const collectionKeys = ["data", "items", "posts", "results", "blog", "productos", "products"];
  for (const key of collectionKeys) {
    if (Array.isArray(response[key])) {
      return response[key];
    }
  }

  return [];
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatBlogDate(value) {
  if (!value) {
    return "";
  }

  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) {
    return new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(directDate);
  }

  const normalizedValue = String(value).trim();
  const matched = normalizedValue.match(/^(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?$/);
  if (!matched) {
    return normalizedValue;
  }

  const day = Number(matched[1]);
  const month = Number(matched[2]) - 1;
  const yearRaw = matched[3] ? Number(matched[3]) : new Date().getFullYear();
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  const parsedDate = new Date(year, month, day);

  if (Number.isNaN(parsedDate.getTime())) {
    return normalizedValue;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function buildExcerpt(value) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177).trimEnd()}...`;
}

function normalizeBlogPost(rawPost, fallbackIndex = 0) {
  const title = pickFirstString(rawPost, ["title", "titulo", "name", "post_title"]) || `Articulo ${fallbackIndex + 1}`;
  const slug = pickFirstString(rawPost, ["slug", "post_slug", "url_slug"]) || slugify(title);
  const excerpt =
    pickFirstString(rawPost, ["excerpt", "resumen", "summary", "description", "meta_description"]) ||
    buildExcerpt(pickFirstString(rawPost, ["content", "contenido", "body", "post_content"]));
  const content = pickFirstString(rawPost, ["content", "contenido", "body", "post_content"]);
  const category =
    pickFirstString(rawPost, ["category", "categoria", "tag", "tipo", "section"]) || "Blog";
  const date =
    pickFirstValue(rawPost, ["published_at", "publish_date", "created_at", "fecha", "date"]) || "";
  const image =
    pickFirstString(rawPost, ["image", "image_url", "cover", "cover_image", "thumbnail"]) || "";

  return {
    slug,
    title,
    excerpt,
    content,
    category,
    date,
    image,
  };
}

function normalizeProduct(rawProduct, fallbackIndex = 0) {
  const title = pickFirstString(rawProduct, ["title", "titulo", "name", "product_name"]) || `Producto ${fallbackIndex + 1}`;
  const slug = pickFirstString(rawProduct, ["slug", "product_slug", "url_slug"]) || slugify(title);

  return {
    slug,
    title,
    description: pickFirstString(rawProduct, ["description", "descripcion", "summary"]),
    content: pickFirstString(rawProduct, ["content", "contenido", "body"]),
  };
}

async function listBlogPosts() {
  const response = await postJson(BLOG_API_ENDPOINT, {
    action: "list",
    public_key: CONTACT_PUBLIC_KEY,
  });

  const posts = extractApiCollection(response).map(normalizeBlogPost).filter((post) => post.slug && post.title);
  return posts.length > 0 ? posts : BLOG_FALLBACK_POSTS;
}

async function getBlogPostDetail(slug) {
  const response = await postJson(BLOG_API_ENDPOINT, {
    action: "detail",
    public_key: CONTACT_PUBLIC_KEY,
    slug,
  });

  const detailSource =
    Array.isArray(response) ? response[0] : response?.data || response?.post || response?.item || response;

  if (detailSource && typeof detailSource === "object") {
    return normalizeBlogPost(detailSource);
  }

  return BLOG_FALLBACK_POSTS.find((post) => post.slug === slug) || null;
}

async function listProducts() {
  const response = await postJson(PRODUCT_API_ENDPOINT, {
    action: "list",
    public_key: CONTACT_PUBLIC_KEY,
  });

  return extractApiCollection(response).map(normalizeProduct).filter((product) => product.slug && product.title);
}

async function getProductDetail(slug) {
  const response = await postJson(PRODUCT_API_ENDPOINT, {
    action: "detail",
    public_key: CONTACT_PUBLIC_KEY,
    slug,
  });

  const detailSource =
    Array.isArray(response) ? response[0] : response?.data || response?.product || response?.item || response;

  if (!detailSource || typeof detailSource !== "object") {
    return null;
  }

  return normalizeProduct(detailSource);
}

function renderRichText(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "<p>Este articulo todavia no tiene contenido disponible.</p>";
  }

  if (trimmed.includes("<") && trimmed.includes(">")) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function getBlogTagClass(category) {
  return /consult/i.test(category) ? "tag tag-secondary" : "tag";
}

function setBlogStatus(message, type = "") {
  const statusNode = document.querySelector("[data-blog-status]");
  if (!(statusNode instanceof HTMLElement)) {
    return;
  }

  statusNode.hidden = !message;
  statusNode.textContent = message;
  statusNode.className = "blog-status";
  if (type) {
    statusNode.classList.add(type);
  }
}

function renderBlogList(posts) {
  const listNode = document.querySelector("[data-blog-list-view]");
  const detailNode = document.querySelector("[data-blog-detail-view]");
  const headingNode = document.querySelector("[data-blog-list-heading]");

  if (!(listNode instanceof HTMLElement)) {
    return;
  }

  if (detailNode instanceof HTMLElement) {
    detailNode.hidden = true;
    detailNode.innerHTML = "";
  }

  if (headingNode instanceof HTMLElement) {
    headingNode.hidden = false;
  }

  listNode.hidden = false;
  listNode.innerHTML = posts
    .map((post) => {
      const safeSlug = encodeURIComponent(post.slug);
      const dateLabel = formatBlogDate(post.date);
      return `
        <article class="blog-card reveal is-visible">
          <a class="blog-card-link" href="blog.html?slug=${safeSlug}">
            <span class="${getBlogTagClass(post.category)}">${escapeHtml(post.category)}</span>
            <h2>${escapeHtml(post.title)}</h2>
            <p>${escapeHtml(post.excerpt || "Proximamente disponible.")}</p>
            <span class="blog-card-action">${dateLabel ? escapeHtml(dateLabel) : "Leer articulo"}</span>
          </a>
        </article>
      `;
    })
    .join("");
}

function renderBlogDetail(post) {
  const listNode = document.querySelector("[data-blog-list-view]");
  const detailNode = document.querySelector("[data-blog-detail-view]");
  const headingNode = document.querySelector("[data-blog-list-heading]");

  if (!(detailNode instanceof HTMLElement)) {
    return;
  }

  if (listNode instanceof HTMLElement) {
    listNode.hidden = true;
  }

  if (headingNode instanceof HTMLElement) {
    headingNode.hidden = true;
  }

  detailNode.hidden = false;
  detailNode.innerHTML = `
    <article class="blog-detail-card reveal is-visible">
      <a class="blog-detail-back" href="blog.html">Volver al blog</a>
      <span class="${getBlogTagClass(post.category)}">${escapeHtml(post.category)}</span>
      <h2>${escapeHtml(post.title)}</h2>
      ${post.date ? `<p class="blog-detail-meta">${escapeHtml(formatBlogDate(post.date))}</p>` : ""}
      <div class="blog-detail-content">
        ${renderRichText(post.content || post.excerpt)}
      </div>
    </article>
  `;
}

async function initBlogPage() {
  if (body?.dataset.page !== "blog") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  setBlogStatus("Cargando articulos...");

  try {
    if (slug) {
      const post = await getBlogPostDetail(slug);
      if (!post) {
        throw new Error("Articulo no encontrado");
      }

      renderBlogDetail(post);
      setBlogStatus("");
      document.title = `${post.title} | Blog | Sisu Group`;
      return;
    }

    const posts = await listBlogPosts();
    renderBlogList(posts);
    setBlogStatus("");
  } catch (error) {
    console.error("Error al cargar el blog:", error);

    if (slug) {
      const fallbackPost = BLOG_FALLBACK_POSTS.find((post) => post.slug === slug);
      if (fallbackPost) {
        renderBlogDetail(fallbackPost);
        setBlogStatus("Mostramos una version de respaldo del articulo.", "is-warning");
        return;
      }
    }

    renderBlogList(BLOG_FALLBACK_POSTS);
    setBlogStatus("No pudimos cargar el blog en este momento. Mostramos una version de respaldo.", "is-warning");
  }
}

window.SisuApi = {
  submitContact: submitApiForm,
  listBlogPosts,
  getBlogPostDetail,
  listProducts,
  getProductDetail,
};

function initTrustedOrbitTouchZoom() {
  if (trustedOrbitLogos.length === 0) {
    return;
  }

  const mobileQuery = window.matchMedia("(max-width: 680px)");
  let activeLogo = null;

  const clearActiveLogo = () => {
    if (activeLogo instanceof HTMLElement) {
      activeLogo.classList.remove("is-expanded");
      activeLogo.blur();
    }

    activeLogo = null;
  };

  const setActiveLogo = (logo) => {
    if (!(logo instanceof HTMLElement)) {
      return;
    }

    if (!mobileQuery.matches) {
      clearActiveLogo();
      return;
    }

    if (activeLogo === logo) {
      return;
    }

    clearActiveLogo();
    activeLogo = logo;
    activeLogo.classList.add("is-expanded");
    activeLogo.focus({ preventScroll: true });
  };

  trustedOrbitLogos.forEach((logo) => {
    logo.addEventListener("pointerdown", () => {
      setActiveLogo(logo);
    });

    logo.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveLogo(logo);
      }
    });
  });

  window.addEventListener(
    "scroll",
    () => {
      if (activeLogo) {
        clearActiveLogo();
      }
    },
    { passive: true }
  );

  mobileQuery.addEventListener("change", (event) => {
    if (!event.matches) {
      clearActiveLogo();
    }
  });
}

initImpulsaIntegrations();

function startTypewriter(element) {
  if (!(element instanceof HTMLElement) || element.dataset.typed === "true") {
    return;
  }

  const container = element.closest("[data-typewriter-container]");
  const fullText = element.dataset.typewriterFullText || element.textContent || "";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  element.dataset.typewriterFullText = fullText;

  if (prefersReducedMotion) {
    element.textContent = fullText;
    element.dataset.typed = "true";
    if (container) {
      container.classList.remove("is-typing");
      container.classList.add("is-typed");
    }
    return;
  }

  element.textContent = "";
  element.dataset.typed = "true";

  if (container) {
    container.classList.add("is-typing");
    container.classList.remove("is-typed");
  }

  let index = 0;
  const step = () => {
    index += 1;
    element.textContent = fullText.slice(0, index);

    if (index < fullText.length) {
      window.setTimeout(step, 22);
      return;
    }

    if (container) {
      container.classList.remove("is-typing");
      container.classList.add("is-typed");
    }
  };

  window.setTimeout(step, 180);
}

function ensureDemoModal() {
  if (demoModal) {
    return demoModal;
  }

  body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="modal-backdrop" data-demo-modal hidden>
        <div class="scanner-modal demo-modal" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title" aria-describedby="demo-modal-description" tabindex="-1" data-demo-modal-panel>
          <button class="modal-close" type="button" aria-label="Cerrar" data-demo-modal-close>&times;</button>
          <div class="demo-modal-copy">
            <p class="scanner-brand">Sistema Pausa Viva · Sisu Group</p>
            <h2 id="demo-modal-title">Conversemos sobre tu Demo Pausa Viva</h2>
            <p id="demo-modal-description">Con mucho gusto y sin compromiso, podemos coordinar un encuentro para conocernos mejor y contarles cómo podemos acompañarlos.</p>
            </div>
            <form class="contact-form demo-form" data-mail-form data-form-context="demo" novalidate>
            <div class="field-grid">
            <label>
            Nombre y Apellido
            <input type="text" name="nombre" autocomplete="name" required>
              </label>
              <label>
                Correo electronico
                <input type="email" name="email" autocomplete="email" required>
              </label>
              <label>
                WhatsApp
                <input type="tel" name="telefono" autocomplete="tel" required>
              </label>
              <label>
                Rubro de la empresa
                <input type="text" name="empresa" autocomplete="organization" required>
              </label>
            </div>
            <label>
              Mensaje
              <textarea name="mensaje" rows="5" required></textarea>
            </label>
            <div class="form-actions">
              <button class="button button-primary" type="submit">Enviar solicitud</button>
            </div>
            <p class="form-feedback" data-form-feedback role="status" aria-live="polite"></p>
            </form>
            <br>
            <p id="demo-modal-description">La cita tendrá una duración de 15 minutos.</p>
            </div>
      </div>
    `
  );

  demoModal = document.querySelector("[data-demo-modal]");
  demoModalPanel = document.querySelector("[data-demo-modal-panel]");

  if (demoModal) {
    demoModal.addEventListener("click", (event) => {
      if (event.target === demoModal) {
        closeDemoModal();
      }
    });
  }

  if (demoModalPanel) {
    demoModalPanel.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-demo-modal-close]")) {
        event.preventDefault();
        event.stopPropagation();
        closeDemoModal();
      }
    });
  }

  forms = document.querySelectorAll("[data-mail-form]");
  return demoModal;
}

function getOpenModalElements() {
  if (demoModal && !demoModal.hidden) {
    return { backdrop: demoModal, panel: demoModalPanel };
  }

  if (modal && !modal.hidden) {
    return { backdrop: modal, panel: modalPanel };
  }

  return null;
}

function releaseModalTrap() {
  if (!getOpenModalElements()) {
    document.removeEventListener("keydown", trapFocus);
    body.style.overflow = "";
  }
}

if (header) {
  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    });
  });
}

initTrustedOrbitTouchZoom();

if (revealItems.length > 0) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    typewriterItems.forEach((item) => startTypewriter(item));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            const typewriterTarget = entry.target.matches("[data-typewriter-container]")
              ? entry.target.querySelector("[data-typewriter-text]")
              : null;

            if (typewriterTarget) {
              startTypewriter(typewriterTarget);
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }
} else {
  typewriterItems.forEach((item) => startTypewriter(item));
}

const processAccordion = document.querySelector("[data-process-accordion]");

if (processAccordion) {
  const processItems = Array.from(processAccordion.querySelectorAll(".process-item"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stopProcessAnimation = (panel) => {
    if (!(panel instanceof HTMLElement)) {
      return;
    }

    if (panel.dataset.animationFrame) {
      window.cancelAnimationFrame(Number(panel.dataset.animationFrame));
      delete panel.dataset.animationFrame;
    }

    if (panel._processTransitionHandler) {
      panel.removeEventListener("transitionend", panel._processTransitionHandler);
      panel._processTransitionHandler = null;
    }
  };

  const expandProcessPanel = (panel, immediate = false) => {
    if (!(panel instanceof HTMLElement)) {
      return;
    }

    stopProcessAnimation(panel);
    panel.hidden = false;
    panel.style.overflow = "hidden";

    if (immediate || prefersReducedMotion) {
      panel.style.height = "auto";
      panel.style.opacity = "1";
      panel.style.marginTop = "0.65rem";
      return;
    }

    panel.style.height = "0px";
    panel.style.opacity = "0";
    panel.style.marginTop = "0";

    const frame = window.requestAnimationFrame(() => {
      panel.style.height = `${panel.scrollHeight}px`;
      panel.style.opacity = "1";
      panel.style.marginTop = "0.65rem";
    });

    panel.dataset.animationFrame = String(frame);

    const onTransitionEnd = (event) => {
      if (event.target !== panel || event.propertyName !== "height") {
        return;
      }

      panel.style.height = "auto";
      stopProcessAnimation(panel);
    };

    panel._processTransitionHandler = onTransitionEnd;
    panel.addEventListener("transitionend", onTransitionEnd);
  };

  const collapseProcessPanel = (panel, immediate = false) => {
    if (!(panel instanceof HTMLElement)) {
      return;
    }

    stopProcessAnimation(panel);

    if (immediate || prefersReducedMotion) {
      panel.hidden = true;
      panel.style.height = "0px";
      panel.style.opacity = "0";
      panel.style.marginTop = "0";
      return;
    }

    panel.hidden = false;
    panel.style.overflow = "hidden";
    panel.style.height = `${panel.scrollHeight}px`;
    panel.style.opacity = "1";
    panel.style.marginTop = "0.65rem";
    panel.getBoundingClientRect();

    const frame = window.requestAnimationFrame(() => {
      panel.style.height = "0px";
      panel.style.opacity = "0";
      panel.style.marginTop = "0";
    });

    panel.dataset.animationFrame = String(frame);

    const onTransitionEnd = (event) => {
      if (event.target !== panel || event.propertyName !== "height") {
        return;
      }

      panel.hidden = true;
      stopProcessAnimation(panel);
    };

    panel._processTransitionHandler = onTransitionEnd;
    panel.addEventListener("transitionend", onTransitionEnd);
  };

  const setOpenProcessItem = (nextItem) => {
    processItems.forEach((item) => {
      const trigger = item.querySelector("[data-process-trigger]");
      const panel = item.querySelector("[data-process-panel]");
      const isOpen = item === nextItem;

      item.classList.toggle("is-open", isOpen);

      if (trigger instanceof HTMLButtonElement) {
        trigger.setAttribute("aria-expanded", String(isOpen));
      }

      if (panel instanceof HTMLElement) {
        if (isOpen) {
          expandProcessPanel(panel);
        } else {
          collapseProcessPanel(panel);
        }
      }
    });
  };

  const closeAllProcessItems = (immediate = false) => {
    processItems.forEach((item) => {
      const trigger = item.querySelector("[data-process-trigger]");
      const panel = item.querySelector("[data-process-panel]");

      item.classList.remove("is-open");

      if (trigger instanceof HTMLButtonElement) {
        trigger.setAttribute("aria-expanded", "false");
      }

      if (panel instanceof HTMLElement) {
        collapseProcessPanel(panel, immediate);
      }
    });
  };

  processItems.forEach((item) => {
    const trigger = item.querySelector("[data-process-trigger]");
    if (!(trigger instanceof HTMLButtonElement)) {
      return;
    }

    trigger.addEventListener("click", () => {
      if (item.classList.contains("is-open")) {
        closeAllProcessItems(false);
        return;
      }

      setOpenProcessItem(item);
    });
  });

  closeAllProcessItems(true);
}

function bindDemoTriggers() {
  const triggerLinks = Array.from(document.querySelectorAll("a, button")).filter((node) => {
    if (!(node instanceof HTMLElement)) {
      return false;
    }

    return node.hasAttribute("data-demo-trigger") || node.textContent?.trim() === DEMO_CTA_LABEL;
  });

  triggerLinks.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openDemoModal();
    });
  });
}

function bindScannerTriggers() {
  const triggerLinks = document.querySelectorAll("[data-scanner-trigger]");

  triggerLinks.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });
}

ensureDemoModal();
bindDemoTriggers();
bindScannerTriggers();

function shouldShowModal() {
  if (!modal) {
    return false;
  }

  const dismissedAt = Number(sessionStorage.getItem(MODAL_STORAGE_KEY) || 0);
  return !dismissedAt || Date.now() - dismissedAt > MODAL_HIDE_MS;
}

function trapFocus(event) {
  const activeModal = getOpenModalElements();
  if (!activeModal?.backdrop) {
    return;
  }

  if (event.key === "Escape") {
    if (activeModal.backdrop === demoModal) {
      closeDemoModal();
    } else {
      closeModal();
    }
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = activeModal.backdrop.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])'
  );

  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openModal() {
  if (!modal || !modalPanel) {
    return;
  }

  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  body.style.overflow = "hidden";
  resetScanner();
  modalPanel.focus();
  document.addEventListener("keydown", trapFocus);
}

function closeModal() {
  if (!modal) {
    return;
  }

  modal.hidden = true;
  sessionStorage.setItem(MODAL_STORAGE_KEY, String(Date.now()));
  releaseModalTrap();

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function openDemoModal() {
  const dialog = ensureDemoModal();
  if (!dialog || !demoModalPanel) {
    return;
  }

  lastFocusedElement = document.activeElement;
  dialog.hidden = false;
  body.style.overflow = "hidden";

  const form = dialog.querySelector('form[data-form-context="demo"]');
  const feedback = dialog.querySelector("[data-form-feedback]");

  if (form instanceof HTMLFormElement) {
    form.reset();
  }

  setFeedback(feedback, "", "");
  demoModalPanel.focus();
  document.addEventListener("keydown", trapFocus);
}

function closeDemoModal() {
  if (!demoModal) {
    return;
  }

  demoModal.hidden = true;
  releaseModalTrap();

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

if (modal && shouldShowModal()) {
  modalTimer = window.setTimeout(openModal, MODAL_DELAY_MS);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
    });
  });
}

if (modalPanel) {
  modalPanel.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest("[data-modal-close]")) {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
    }
  });
}

const scannerApp = document.querySelector("[data-scanner-app]");
let currentQuestionIndex = 0;
let scannerAnswers = [];

function getScannerParts() {
  if (!scannerApp) {
    return null;
  }

  return {
    intro: scannerApp.querySelector('[data-scanner-screen="intro"]'),
    quiz: scannerApp.querySelector('[data-scanner-screen="quiz"]'),
    result: scannerApp.querySelector('[data-scanner-screen="result"]'),
    lead: scannerApp.querySelector('[data-scanner-screen="lead"]'),
    start: scannerApp.querySelector("[data-scanner-start]"),
    backResult: scannerApp.querySelector("[data-scanner-back-result]"),
    step: scannerApp.querySelector("[data-scanner-step]"),
    progressBar: scannerApp.querySelector("[data-scanner-progress-bar]"),
    index: scannerApp.querySelector("[data-scanner-index]"),
    question: scannerApp.querySelector("[data-scanner-question]"),
    options: scannerApp.querySelector("[data-scanner-options]"),
    range: scannerApp.querySelector("[data-scanner-range]"),
    zone: scannerApp.querySelector("[data-scanner-zone]"),
    resultTitle: scannerApp.querySelector("[data-scanner-result-title]"),
    resultCopy: scannerApp.querySelector("[data-scanner-result-copy]"),
    resultRecommendation: scannerApp.querySelector("[data-scanner-result-recommendation]"),
    resultLink: scannerApp.querySelector("[data-scanner-result-link]"),
    zoneInput: scannerApp.querySelector("[data-scanner-zone-input]"),
    resultForm: scannerApp.querySelector('.scanner-form[data-mail-form]'),
  };
}

function showScannerScreen(name) {
  const parts = getScannerParts();
  if (!parts) {
    return;
  }

  ["intro", "quiz", "result", "lead"].forEach((screenName) => {
    const screen = parts[screenName];
    if (!screen) {
      return;
    }

    const isActive = screenName === name;
    screen.hidden = !isActive;
    screen.classList.toggle("is-active", isActive);
  });
}

function renderScannerQuestion() {
  const parts = getScannerParts();
  const questionData = scannerQuestions[currentQuestionIndex];
  if (!parts || !questionData) {
    return;
  }

  parts.step.textContent = `Pregunta ${currentQuestionIndex + 1} de ${scannerQuestions.length}`;
  parts.index.textContent = String(currentQuestionIndex + 1);
  parts.question.textContent = questionData.text;
  parts.progressBar.style.width = `${((currentQuestionIndex + 1) / scannerQuestions.length) * 100}%`;
  parts.options.innerHTML = "";

  questionData.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scanner-option";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      scannerAnswers[currentQuestionIndex] = option.score;
      currentQuestionIndex += 1;

      if (currentQuestionIndex >= scannerQuestions.length) {
        renderScannerResult();
      } else {
        renderScannerQuestion();
      }
    });

    parts.options.appendChild(button);
  });
}

function getScannerZone(score) {
  if (score <= 4) {
    return scannerZones.green;
  }

  if (score <= 8) {
    return scannerZones.yellow;
  }

  return scannerZones.red;
}

function renderScannerResult() {
  const parts = getScannerParts();
  if (!parts) {
    return;
  }

  const totalScore = scannerAnswers.reduce((sum, value) => sum + value, 0);
  const zone = getScannerZone(totalScore);

  parts.range.textContent = zone.range;
  parts.range.dataset.zone = zone.name;
  parts.resultTitle.dataset.zone = zone.name;
  parts.zone.textContent = zone.name;
  parts.zone.dataset.zone = zone.name;
  parts.resultTitle.textContent = zone.title;
  parts.resultCopy.textContent = zone.copy;
  parts.resultRecommendation.textContent = zone.recommendation;
  parts.resultLink.textContent = zone.ctaLabel;
  parts.resultLink.href = zone.ctaHref;
  parts.zoneInput.value = zone.name;

  if (parts.resultForm instanceof HTMLFormElement) {
    parts.resultForm.reset();
    const zoneInput = parts.resultForm.querySelector('[name="zona"]');
    const messageField = parts.resultForm.querySelector('[name="mensaje"]');

    if (zoneInput instanceof HTMLInputElement) {
      zoneInput.value = zone.name;
    }

    if (messageField instanceof HTMLTextAreaElement) {
      messageField.value = "Esta solicitud vino del scaner mental";
    }
  }

  showScannerScreen("result");
}

function resetScanner() {
  currentQuestionIndex = 0;
  scannerAnswers = [];

  const parts = getScannerParts();
  if (!parts) {
    return;
  }

  const feedback = scannerApp.querySelector("[data-form-feedback]");
  if (feedback) {
    feedback.textContent = "";
    feedback.classList.remove("is-error", "is-success");
  }

  showScannerScreen("intro");
}

if (scannerApp) {
  const parts = getScannerParts();
  if (parts?.start) {
    parts.start.addEventListener("click", () => {
      showScannerScreen("quiz");
      renderScannerQuestion();
    });
  }

  if (parts?.resultLink) {
    parts.resultLink.addEventListener("click", (event) => {
      const href = parts.resultLink.getAttribute("href") || "";
      if (href.includes("contacto.html") || href.startsWith("#")) {
        event.preventDefault();
        showScannerScreen("lead");
      }
    });
  }

  if (parts?.backResult) {
    parts.backResult.addEventListener("click", () => {
      showScannerScreen("result");
    });
  }
}

function setFeedback(feedbackNode, message, type) {
  if (!(feedbackNode instanceof HTMLElement)) {
    return;
  }

  feedbackNode.textContent = message;
  feedbackNode.classList.remove("is-error", "is-success");
  if (type) {
    feedbackNode.classList.add(type);
  }
}

function setFormSubmitting(form, isSubmitting) {
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  if (!submitButton.dataset.defaultLabel) {
    submitButton.dataset.defaultLabel = submitButton.textContent || "";
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Enviando..." : submitButton.dataset.defaultLabel;
}

function getCurrentPageLabel() {
  return window.location.pathname || "/index.html";
}

function buildDescription(lines) {
  return lines.filter(Boolean).join("\n");
}

function buildApiPayload(formData) {
  const formContext = String(formData.get("form_context") || "").trim();
  const pageLabel = getCurrentPageLabel();
  const nombre = String(formData.get("nombre") || "").trim();
  const whatsapp = String(formData.get("telefono") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const empresa = String(formData.get("empresa") || formData.get("zona") || "").trim();
  const zona = String(formData.get("zona") || "").trim();
  const mensaje = String(formData.get("mensaje") || "").trim();

  if (formContext === "demo") {
    return {
      public_key: CONTACT_PUBLIC_KEY,
      page: pageLabel,
      contact_nombre: nombre,
      contact_whatsapp: whatsapp,
      contact_email: email,
      contact_description: empresa,
      contact_consultation: mensaje || "Solicitud de Demo Pausa Viva",
      state: "recibido",
    };
  }

  if (formContext === "scanner") {
    return {
      public_key: CONTACT_PUBLIC_KEY,
      page: `${pageLabel} - escaner`,
      contact_nombre: nombre,
      contact_whatsapp: whatsapp,
      contact_email: email,
      contact_description: zona ? `Zona detectada: ${zona}` : "",
      contact_consultation: mensaje || "Solicitud desde el escaner de carga mental organizacional",
      state: "recibido",
    };
  }

  return {
    public_key: CONTACT_PUBLIC_KEY,
    page: pageLabel,
    contact_nombre: nombre,
    contact_whatsapp: whatsapp,
    contact_email: email,
    contact_description: empresa || zona,
    contact_consultation: mensaje || "Formulario de contacto sitio web",
    state: "recibido",
  };
}

async function submitApiForm(payload) {
  return postJson(CONTACT_API_ENDPOINT, payload);
}

function bindApiForms() {
  forms = document.querySelectorAll("[data-mail-form]");

  forms.forEach((form) => {
    if (form.dataset.apiBound === "true") {
      return;
    }

    form.dataset.apiBound = "true";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const feedbackNode = form.querySelector("[data-form-feedback]");
      setFeedback(feedbackNode, "", "");

      const formData = new FormData(form);
      const requiredFields = Array.from(form.querySelectorAll("[name][required]"));
      const missingField = requiredFields.find((field) => !String(formData.get(field.getAttribute("name")) || "").trim());

      if (missingField) {
        setFeedback(feedbackNode, "Completa todos los campos obligatorios antes de enviar.", "is-error");
        if (missingField instanceof HTMLElement && missingField.type !== "hidden") {
          missingField.focus();
        }
        return;
      }

      const emailValue = String(formData.get("email") || "").trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailValue)) {
        setFeedback(feedbackNode, "Ingresa un email valido para continuar.", "is-error");
        const emailField = form.querySelector('[name="email"]');
        if (emailField instanceof HTMLElement) {
          emailField.focus();
        }
        return;
      }

      const context = form.dataset.formContext || "contacto";
      formData.set("form_context", context);
      const payload = buildApiPayload(formData);
      setFormSubmitting(form, true);

      try {
        await submitApiForm(payload);
        setFeedback(feedbackNode, "Formulario enviado correctamente.", "is-success");
        form.reset();

        if (context === "scanner") {
          window.setTimeout(() => {
            closeModal();
            window.location.assign("pausa-viva.html");
          }, 250);
        }

        if (context === "demo") {
          window.setTimeout(() => {
            closeDemoModal();
          }, 450);
        }
      } catch (error) {
        console.error("Error al enviar el formulario:", error);
        setFeedback(
          feedbackNode,
          "No pudimos enviar el formulario en este momento. Intenta nuevamente en unos minutos.",
          "is-error"
        );
      } finally {
        setFormSubmitting(form, false);
      }
    });
  });
}

bindApiForms();
initBlogPage();
