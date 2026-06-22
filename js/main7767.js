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
    date: "2026-06-16",
    image: "idea/blog/img/La mente es el principal 1-6.png",
    content:
      "Un marco simple para detectar interrupciones, reducir friccion cognitiva y recuperar claridad operativa en equipos que trabajan bajo demanda constante.",
  },
  {
    slug: "por-que-necesitamos-pausar-el-valor-de-reconectar-sin-pantallas",
    title: "Por que necesitamos pausar: el valor de reconectar sin pantallas",
    excerpt: "Por que una pausa real puede bajar saturacion, recuperar presencia y mejorar la calidad del trabajo.",
    category: "Pausa Viva",
    date: "2025-12-05",
    image: "idea/blog/img/Porque necesitamos pausar 5-12.png",
    content:
      "Las pantallas aceleraron el ritmo de trabajo y multiplicaron interrupciones, reuniones y demanda de respuesta. Pausar de verdad ayuda a bajar saturacion, recuperar presencia y volver con mayor claridad.",
  },
  {
    slug: "la-mente-es-el-principal-activo-de-trabajo",
    title: "La mente es el principal activo de trabajo: por que cuidarla ya no es opcional",
    excerpt: "Una mirada estrategica sobre claridad mental, foco y energia como condiciones para trabajar mejor.",
    category: "Pausa Viva",
    date: "2026-06-01",
    image: "idea/blog/img/La mente es el principal 1-6.png",
    content:
      "La claridad mental, el foco y la energia no son recursos infinitos. Cuidarlos es una decision estrategica para sostener productividad, criterio y calidad de trabajo.",
  },
  {
    slug: "estrategia-para-desembarcar-en-argentina",
    title: "Estrategia para desembarcar en Argentina",
    excerpt: "Factores operativos, comerciales y de representacion para construir presencia local con eficiencia.",
    category: "Consultoria",
    date: "2025-02-04",
    image: "idea/blog/img/Suc propia vs socio estrategico 4-2-25.png",
    content:
      "Expandirse a un nuevo pais requiere definir estructura, socio local, operacion y velocidad de entrada. La estrategia correcta reduce riesgo y acelera resultados.",
  },
  {
    slug: "oficina-de-transicion-una-forma-eficiente-de-entrar-al-mercado-local",
    title: "Oficina de transicion: una forma eficiente de entrar al mercado local",
    excerpt: "Como expandirse con una estructura gradual y mas liviana antes de abrir operaciones propias.",
    category: "Consultoria",
    date: "2025-03-28",
    image: "idea/blog/img/Errores comunies 28-3-25.png",
    content:
      "Una estructura transicional permite validar mercado, construir red comercial y aprender rapido antes de asumir el costo completo de una operacion propia.",
  },
];

const BLOG_IMAGE_OVERRIDES = [
  {
    matchers: [
      "por-que-necesitamos-pausar",
      "reconectar-sin-pantallas",
      "valor de reconectar sin pantallas",
      "porque necesitamos pausar",
    ],
    image: "idea/blog/img/Porque necesitamos pausar 5-12.png",
  },
  {
    matchers: [
      "la-mente-es-el-principal-activo-de-trabajo",
      "principal activo de trabajo",
      "por-que-cuidarla-ya-no-es-opcional",
      "mente es el principal",
    ],
    image: "idea/blog/img/La mente es el principal 1-6.png",
  },
  {
    matchers: [
      "arquitectura-de-foco",
      "disenar-entornos-que-ayuden-a-pensar-mejor",
      "arquitectura de foco",
    ],
    image: "idea/blog/img/Arquitectura de foto 10-6.png",
  },
  {
    matchers: [
      "sucursal-propia-vs-socio-estrategico",
      "socio estrategico",
      "desembarcar-en-argentina",
      "sucursal propia",
    ],
    image: "idea/blog/img/Suc propia vs socio estrategico 4-2-25.png",
  },
  {
    matchers: [
      "errores-comunes",
      "errores comunes",
      "mercado argentino",
      "oficina-de-transicion",
    ],
    image: "idea/blog/img/Errores comunies 28-3-25.png",
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
    ctaHref: "pausa-viva.php",
  },
  yellow: {
    name: "Zona Amarilla",
    range: "5 a 8 puntos",
    title: "Senales de saturacion activa",
    copy: "El equipo muestra senales de desgaste que pueden afectar foco, energia, clima y capacidad de respuesta. Hay margen para intervenir de forma preventiva.",
    recommendation: "Revisar que condiciones estan drenando claridad.",
    ctaLabel: "Coordinar Demo",
    ctaHref: "contacto.php#formulario-contacto",
  },
  red: {
    name: "Zona Roja",
    range: "9 a 12 puntos",
    title: "Carga mental elevada",
    copy: "La organizacion muestra senales consistentes de saturacion mental. Esto puede impactar en errores, ausentismo, rotacion y desgaste de lideres.",
    recommendation: "Implementar una intervencion breve, medible y adaptada.",
    ctaLabel: "Coordinar Demo",
    ctaHref: "contacto.php#formulario-contacto",
  },
};

let lastFocusedElement = null;
let modalTimer = null;
let demoModal = null;
let demoModalPanel = null;
let blogModal = null;
let blogModalPanel = null;
let blogModalBody = null;
const blogPostsCache = new Map();

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

function toDebugValue(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return value;
}

function logBlogCollectionDebug(records) {
  if (!Array.isArray(records)) {
    console.log("[Sisu][Blog][DB] La respuesta de listado no trajo un array:", records);
    return;
  }

  const normalizedRows = records.map((record, index) => {
    const row = { __index: index };

    if (!record || typeof record !== "object") {
      row.__value = toDebugValue(record);
      return row;
    }

    Object.keys(record).forEach((key) => {
      row[key] = toDebugValue(record[key]);
    });

    return row;
  });

  console.log("[Sisu][Blog][DB] Registros crudos del listado:", records);
  console.table(normalizedRows);
}

function logBlogDetailDebug(slug, record) {
  if (!record || typeof record !== "object") {
    console.log(`[Sisu][Blog][DB] Detalle crudo para "${slug}":`, record);
    return;
  }

  const rows = Object.keys(record).map((key) => ({
    field: key,
    value: toDebugValue(record[key]),
  }));

  console.log(`[Sisu][Blog][DB] Detalle crudo para "${slug}":`, record);
  console.table(rows);
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

function findMappedBlogImage(post) {
  const candidates = [
    post?.slug,
    post?.title,
    post?.excerpt,
    post?.content,
  ]
    .map((value) => slugify(String(value || "").slice(0, 180)))
    .filter(Boolean);

  for (const entry of BLOG_IMAGE_OVERRIDES) {
    const matched = entry.matchers.some((matcher) => {
      const normalizedMatcher = slugify(matcher);
      return candidates.some((candidate) => candidate.includes(normalizedMatcher));
    });

    if (matched) {
      return entry.image;
    }
  }

  return "";
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

function normalizeLineBreaks(value) {
  return String(value || "").replace(/\r\n?/g, "\n");
}

function looksLikeImagePath(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return false;
  }

  return /^data:image\//i.test(normalized) || /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(normalized);
}

function extractFirstImageFromHtml(value) {
  const matched = String(value || "").match(/<img[^>]+src=["']([^"']+)["']/i);
  return matched?.[1]?.trim() || "";
}

function normalizeBlogImageUrl(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  if (/^data:image\//i.test(normalized) || /^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("//")) {
    return `https:${normalized}`;
  }

  if (normalized.startsWith("/")) {
    try {
      return new URL(normalized, "https://impulsagroup.com").toString();
    } catch {
      return normalized;
    }
  }

  if (/^(uploads|impulsa_emprende\/uploads)\//i.test(normalized)) {
    try {
      return new URL(normalized.replace(/^\/+/, ""), "https://impulsagroup.com/").toString();
    } catch {
      return normalized;
    }
  }

  return normalized;
}

function resolveBlogImage(rawPost) {
  const directImage =
    pickFirstString(rawPost, [
      "image",
      "image_url",
      "cover",
      "cover_image",
      "thumbnail",
      "imagen",
      "featured_image",
      "cover_image_path_url",
      "cover_image_url",
      "cover_image_path",
      "attachment_path_url",
      "attachment_url",
      "attachment_path",
      "path_url",
      "path",
      "file_url",
      "media_url",
    ]) || "";

  if (looksLikeImagePath(directImage)) {
    return normalizeBlogImageUrl(directImage);
  }

  const htmlImage = extractFirstImageFromHtml(
    pickFirstString(rawPost, [
      "content",
      "contenido",
      "body",
      "post_content",
      "article",
      "articulo",
      "html",
      "contenido_html",
    ])
  );
  if (looksLikeImagePath(htmlImage)) {
    return normalizeBlogImageUrl(htmlImage);
  }

  const nestedValues = Object.values(rawPost || {});
  for (const value of nestedValues) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (!item || typeof item !== "object") {
          continue;
        }

        const nestedImage = resolveBlogImage(item);
        if (looksLikeImagePath(nestedImage)) {
          return nestedImage;
        }
      }
    }

    if (!value || typeof value !== "object") {
      continue;
    }

    const nestedImage = resolveBlogImage(value);
    if (looksLikeImagePath(nestedImage)) {
      return nestedImage;
    }
  }

  return "";
}

function getLongestTextField(source, excludedKeys = []) {
  if (!source || typeof source !== "object") {
    return "";
  }

  const excluded = new Set(excludedKeys.map((key) => String(key).toLowerCase()));
  let longestValue = "";

  Object.entries(source).forEach(([key, value]) => {
    if (excluded.has(String(key).toLowerCase())) {
      return;
    }

    if (typeof value !== "string") {
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    if (trimmed.length > longestValue.length) {
      longestValue = trimmed;
    }
  });

  return longestValue;
}

function resolveBlogContent(rawPost) {
  const preferredContent = pickFirstString(rawPost, [
    "content",
    "contenido",
    "body",
    "post_content",
    "article",
    "articulo",
    "text",
    "texto",
    "detail",
    "detalle",
    "full_text",
    "html",
    "contenido_html",
    "description_long",
    "descripcion_larga",
  ]);

  if (preferredContent) {
    return preferredContent;
  }

  return getLongestTextField(rawPost, [
    "id",
    "slug",
    "post_slug",
    "url_slug",
    "title",
    "titulo",
    "name",
    "post_title",
    "category",
    "categoria",
    "tag",
    "tipo",
    "section",
    "date",
    "fecha",
    "published_at",
    "publish_date",
    "created_at",
    "image",
    "image_url",
    "cover",
    "cover_image",
    "thumbnail",
    "imagen",
    "featured_image",
    "excerpt",
    "resumen",
    "summary",
    "meta_description",
  ]);
}

function hasFullBlogContent(post) {
  const content = String(post?.content || "").trim();
  const excerpt = String(post?.excerpt || "").trim();
  return content.length > 220 || (content && content !== excerpt);
}

function normalizeBlogPost(rawPost, fallbackIndex = 0) {
  const title = pickFirstString(rawPost, ["title", "titulo", "name", "post_title"]) || `Articulo ${fallbackIndex + 1}`;
  const slug = pickFirstString(rawPost, ["slug", "post_slug", "url_slug"]) || slugify(title);
  const content = resolveBlogContent(rawPost);
  const excerpt =
    pickFirstString(rawPost, ["excerpt", "resumen", "summary", "description", "meta_description"]) ||
    buildExcerpt(content);
  const category =
    pickFirstString(rawPost, ["category", "categoria", "tag", "tipo", "section"]) || "Blog";
  const date =
    pickFirstValue(rawPost, ["published_at", "publish_date", "created_at", "fecha", "date"]) || "";
  const image = resolveBlogImage(rawPost);

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

  const rawPosts = extractApiCollection(response);
  logBlogCollectionDebug(rawPosts);
  const posts = rawPosts.map(normalizeBlogPost).filter((post) => post.slug && post.title);
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
  logBlogDetailDebug(slug, detailSource);

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
  const trimmed = normalizeLineBreaks(value).trim();
  if (!trimmed) {
    return "<p>Este articulo todavia no tiene contenido disponible.</p>";
  }

  if (trimmed.includes("<") && trimmed.includes(">")) {
    return trimmed;
  }

  return trimmed
    .split(/\n\s*\n+/)
    .map((block) => block.split("\n").map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0)
    .map((lines) => {
      const isBulletList = lines.every((line) => /^[-*•]\s+/.test(line));
      if (isBulletList) {
        const items = lines
          .map((line) => line.replace(/^[-*•]\s+/, "").trim())
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      return `<p>${escapeHtml(lines.join(" "))}</p>`;
    })
    .join("");
}

function mergeBlogPost(basePost = {}, incomingPost = {}) {
  return {
    slug: incomingPost.slug || basePost.slug || "",
    title: incomingPost.title || basePost.title || "",
    excerpt: incomingPost.excerpt || basePost.excerpt || "",
    content: incomingPost.content || basePost.content || "",
    category: incomingPost.category || basePost.category || "",
    date: incomingPost.date || basePost.date || "",
    image: incomingPost.image || basePost.image || "",
  };
}

function getBlogTagClass(category) {
  return /consult/i.test(category) ? "tag tag-secondary" : "tag";
}

function getBlogFallbackImage(post) {
  if (post.image) {
    return post.image;
  }

  const mappedImage = findMappedBlogImage(post);
  if (mappedImage) {
    return mappedImage;
  }

  return /consult/i.test(post.category)
    ? "idea/blog/img/Suc propia vs socio estrategico 4-2-25.png"
    : "idea/blog/img/Porque necesitamos pausar 5-12.png";
}

function getBlogImageFallbackChain(post) {
  const candidates = [findMappedBlogImage(post)];

  if (/consult/i.test(post?.category || "")) {
    candidates.push("idea/blog/img/Suc propia vs socio estrategico 4-2-25.png");
  } else {
    candidates.push("idea/blog/img/Porque necesitamos pausar 5-12.png");
  }

  return candidates.filter((value, index, array) => value && array.indexOf(value) === index);
}

function renderBlogImageMarkup(post, image, className) {
  if (!image) {
    return `<div class="${escapeHtml(`${className} blog-card-image-fallback`)}" aria-hidden="true"><span>${escapeHtml(post.category || "Blog")}</span></div>`;
  }

  const fallbackSources = getBlogImageFallbackChain(post).filter((candidate) => candidate !== image);
  const fallbackAttr = fallbackSources.length > 0 ? ` data-fallback-src="${escapeHtml(fallbackSources.join("|"))}"` : "";

  return `<img class="${escapeHtml(className)}" src="${escapeHtml(image)}" alt="${escapeHtml(post.title)}" data-category="${escapeHtml(post.category || "Blog")}" loading="lazy" decoding="async"${fallbackAttr}>`;
}

function replaceBrokenBlogImage(imageNode) {
  const mediaNode = imageNode.closest(".blog-card-media, .blog-modal-media");
  if (!mediaNode) {
    return;
  }

  const category = imageNode.getAttribute("data-category") || "Blog";
  mediaNode.innerHTML = `<div class="blog-card-image blog-card-image-fallback" aria-hidden="true"><span>${escapeHtml(category)}</span></div>`;
}

function bindBlogImageFallbacks(root = document) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  root.querySelectorAll("img[data-fallback-src]").forEach((imageNode) => {
    if (!(imageNode instanceof HTMLImageElement) || imageNode.dataset.fallbackBound === "true") {
      return;
    }

    imageNode.dataset.fallbackBound = "true";

    imageNode.addEventListener("error", () => {
      const fallbackList = String(imageNode.dataset.fallbackSrc || "")
        .split("|")
        .map((value) => value.trim())
        .filter(Boolean);

      const nextFallback = fallbackList.shift();
      imageNode.dataset.fallbackSrc = fallbackList.join("|");

      if (nextFallback && imageNode.src !== nextFallback) {
        imageNode.src = nextFallback;
        return;
      }

      replaceBrokenBlogImage(imageNode);
    });
  });
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

  if (!(listNode instanceof HTMLElement)) {
    return;
  }

  listNode.hidden = false;
  listNode.innerHTML = posts
    .map((post) => {
      const image = getBlogFallbackImage(post);
      return `
        <article class="blog-card reveal is-visible">
          <button class="blog-card-trigger" type="button" data-blog-open="${escapeHtml(post.slug)}" aria-label="Abrir articulo ${escapeHtml(post.title)}">
            <div class="blog-card-media">
              ${
                image
                  ? renderBlogImageMarkup(post, image, "blog-card-image")
                  : `<div class="blog-card-image blog-card-image-fallback" aria-hidden="true"><span>${escapeHtml(post.category || "Blog")}</span></div>`
              }
            </div>
            <div class="blog-card-body">
              <span class="${getBlogTagClass(post.category)}">${escapeHtml(post.category)}</span>
              <h2>${escapeHtml(post.title)}</h2>
            </div>
          </button>
        </article>
      `;
    })
    .join("");

  bindBlogImageFallbacks(listNode);
}

function ensureBlogModalElements() {
  if (!blogModal) {
    blogModal = document.querySelector("[data-blog-modal]");
    blogModalPanel = document.querySelector("[data-blog-modal-panel]");
    blogModalBody = document.querySelector("[data-blog-modal-body]");
  }

  return blogModal && blogModalPanel && blogModalBody;
}

function setBlogModalLoading() {
  if (!ensureBlogModalElements()) {
    return;
  }

  blogModalBody.innerHTML = `<p class="blog-status">Cargando articulo...</p>`;
}

function renderBlogModal(post) {
  if (!ensureBlogModalElements()) {
    return;
  }

  const image = getBlogFallbackImage(post);
  blogModalBody.innerHTML = `
    <article class="blog-modal-content">
      <div class="blog-modal-media">
        ${
          image
            ? renderBlogImageMarkup(post, image, "blog-modal-image")
            : `<div class="blog-modal-image blog-card-image-fallback" aria-hidden="true"><span>${escapeHtml(post.category || "Blog")}</span></div>`
        }
      </div>
      <div class="blog-modal-copy">
        <span class="${getBlogTagClass(post.category)}">${escapeHtml(post.category)}</span>
        <h2 id="blog-modal-title">${escapeHtml(post.title)}</h2>
        <p class="blog-detail-meta" id="blog-modal-description">${post.date ? escapeHtml(formatBlogDate(post.date)) : "Articulo del blog"}</p>
        <div class="blog-detail-content">
          ${renderRichText(post.content || post.excerpt)}
        </div>
      </div>
    </article>
  `;

  bindBlogImageFallbacks(blogModalBody);
}

function openBlogModalFrame(slug = "") {
  if (!ensureBlogModalElements()) {
    return;
  }

  lastFocusedElement = document.activeElement;
  blogModal.hidden = false;
  body.style.overflow = "hidden";
  blogModalPanel.focus();
  document.addEventListener("keydown", trapFocus);
}

function closeBlogModal() {
  if (!blogModal) {
    return;
  }

  blogModal.hidden = true;
  document.title = "Blog | Sisu Group";
  releaseModalTrap();

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

async function openBlogModalBySlug(slug) {
  if (!slug) {
    return;
  }

  openBlogModalFrame(slug);
  setBlogModalLoading();

  const cachedPost = blogPostsCache.get(slug);
  if (cachedPost && hasFullBlogContent(cachedPost)) {
    renderBlogModal(cachedPost);
  }

  try {
    const detailPost = await getBlogPostDetail(slug);
    if (!detailPost) {
      throw new Error("Articulo no encontrado");
    }

    const mergedPost = mergeBlogPost(cachedPost, detailPost);
    blogPostsCache.set(slug, mergedPost);
    renderBlogModal(mergedPost);
    document.title = `${mergedPost.title} | Blog | Sisu Group`;
  } catch (error) {
    console.error("Error al cargar el detalle del blog:", error);
    if (cachedPost) {
      renderBlogModal(cachedPost);
      document.title = `${cachedPost.title} | Blog | Sisu Group`;
      return;
    }

    blogModalBody.innerHTML = `<p class="blog-status is-warning">No pudimos cargar este articulo en este momento.</p>`;
  }
}

function bindBlogModal() {
  if (!ensureBlogModalElements() || blogModal.dataset.bound === "true") {
    return;
  }

  blogModal.dataset.bound = "true";

  blogModal.addEventListener("click", (event) => {
    if (event.target === blogModal) {
      closeBlogModal();
    }
  });

  blogModalPanel.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest("[data-blog-modal-close]")) {
      event.preventDefault();
      event.stopPropagation();
      closeBlogModal();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const trigger = target.closest("[data-blog-open]");
    if (!trigger) {
      return;
    }

    event.preventDefault();
    openBlogModalBySlug(trigger.getAttribute("data-blog-open") || "");
  });
}

async function initBlogPage() {
  if (body?.dataset.page !== "blog") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  setBlogStatus("Cargando articulos...");
  bindBlogModal();

  try {
    const posts = await listBlogPosts();
    posts.forEach((post) => {
      blogPostsCache.set(post.slug, post);
    });
    renderBlogList(posts);
    setBlogStatus("");

    if (slug) {
      openBlogModalBySlug(slug);
    }
  } catch (error) {
    console.error("[Sisu][Blog] Error al cargar el blog:", error);
    BLOG_FALLBACK_POSTS.forEach((post) => {
      blogPostsCache.set(post.slug, post);
    });
    renderBlogList(BLOG_FALLBACK_POSTS);
    setBlogStatus("No pudimos cargar el blog en este momento. Mostramos una version de respaldo.", "is-warning");

    if (slug) {
      openBlogModalBySlug(slug);
    }
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
            <p id="demo-modal-description">Con mucho gusto y sin compromiso, podemos coordinar un breve encuentro para conocernos mejor y contarles cómo podemos acompañarlos.</p>
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
  if (blogModal && !blogModal.hidden) {
    return { backdrop: blogModal, panel: blogModalPanel };
  }

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
    if (activeModal.backdrop === blogModal) {
      closeBlogModal();
    } else if (activeModal.backdrop === demoModal) {
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

if (modal) {
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

if (modal && shouldShowModal()) {
  modalTimer = window.setTimeout(openModal, MODAL_DELAY_MS);
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
      if (href.includes("contacto.php") || href.startsWith("#")) {
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
  return window.location.pathname || "/index.php";
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
            window.location.assign("pausa-viva.php");
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
