const blogApiOrigin = "https://impulsagroup.com";
const blogApiUrl = `${blogApiOrigin}/api/v1/public/blog`;
const blogList = document.querySelector("[data-blog-list]");
const blogStatus = document.querySelector("[data-blog-status]");
const blogDialog = document.querySelector("[data-blog-dialog]");
const blogTitle = document.getElementById("blog-dialog-title");
const blogImage = document.querySelector("[data-blog-dialog-image]");
const blogDialogStatus = document.querySelector("[data-blog-dialog-status]");
const blogContent = document.querySelector("[data-blog-dialog-content]");
const articleTags = new Set([
  "A", "B", "BLOCKQUOTE", "BR", "CODE", "DIV", "EM", "FIGCAPTION", "FIGURE",
  "H2", "H3", "H4", "HR", "I", "IMG", "LI", "OL", "P", "PRE", "SPAN", "STRONG",
  "TABLE", "TBODY", "TD", "TH", "THEAD", "TR", "U", "UL",
]);
let blogRequestId = 0;
let blogTrigger = null;

async function requestBlog(slug = "") {
  const path = slug ? `/${encodeURIComponent(slug)}` : "";
  const url = new URL(blogApiUrl + path);
  url.searchParams.set("public_key", CONTACT_PUBLIC_KEY);

  const response = await fetch(url, {
    headers: { Accept: "application/json", "X-Impulsa-Public-Key": CONTACT_PUBLIC_KEY },
    credentials: "omit",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`Impulsa respondió con HTTP ${response.status}`);
  }

  return (await response.json()).data;
}

function blogPlainText(value) {
  const template = document.createElement("template");
  template.innerHTML = value || "";
  return template.content.textContent.trim();
}

function blogImageUrl(value) {
  if (!value || !URL.canParse(value, blogApiOrigin)) {
    return "";
  }

  const url = new URL(value, blogApiOrigin);
  return ["https:", "http:"].includes(url.protocol) ? url.href : "";
}

function renderArticleContent(value) {
  const template = document.createElement("template");
  template.innerHTML = value;
  if (!template.content.querySelector("*")) {
    const paragraph = document.createElement("p");
    paragraph.className = "blog-plain-text";
    paragraph.textContent = template.content.textContent;
    return paragraph;
  }

  template.content.querySelectorAll("script, style, template, iframe, object, svg, math").forEach((node) => node.remove());
  for (const element of template.content.querySelectorAll("*")) {
    if (!articleTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      continue;
    }

    const href = element.getAttribute("href");
    const src = element.getAttribute("src");
    const alt = element.getAttribute("alt");
    for (const attribute of element.getAttributeNames()) {
      element.removeAttribute(attribute);
    }

    if (element.tagName === "A" && href && URL.canParse(href, document.baseURI)) {
      const url = new URL(href, document.baseURI);
      if (["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) {
        element.href = url.href;
      }
    } else if (element.tagName === "IMG") {
      const url = blogImageUrl(src);
      if (url) {
        element.src = url;
        element.alt = alt || "";
        element.loading = "lazy";
      } else {
        element.remove();
      }
    }
  }

  return template.content;
}

function createBlogCard(post) {
  const card = document.createElement("article");
  card.className = "blog-card";

  const category = document.createElement("span");
  category.className = /consult/i.test(post.category) ? "tag tag-secondary" : "tag";
  category.textContent = post.category || "Blog";

  const title = document.createElement("h2");
  title.textContent = post.title;
  const excerpt = document.createElement("p");
  excerpt.textContent = blogPlainText(post.excerpt || post.subtitle);

  const button = document.createElement("button");
  button.className = "blog-card-action";
  button.type = "button";
  button.dataset.blogOpen = post.slug;
  button.setAttribute("aria-haspopup", "dialog");
  button.textContent = "Lectura breve";

  card.append(category, title, excerpt, button);
  return card;
}

async function loadBlogList() {
  blogStatus.textContent = "Cargando artículos…";
  try {
    const posts = await requestBlog();
    if (!Array.isArray(posts)) {
      throw new Error("Listado de artículos inválido");
    }

    const cards = posts.filter((post) => post?.slug && post.title).map(createBlogCard);
    blogList.replaceChildren(...cards);
    blogStatus.textContent = cards.length ? "" : "Todavía no hay artículos publicados.";
  } catch {
    blogStatus.textContent = "No pudimos cargar el listado. Mostramos las reseñas disponibles.";
  } finally {
    blogList.hidden = false;
  }
}

blogList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-blog-open]");
  if (!button || blogDialog.open) {
    return;
  }

  const card = button.closest(".blog-card");
  const excerpt = card.querySelector("p").textContent.trim();
  const slug = button.dataset.blogOpen;
  const requestId = ++blogRequestId;
  blogTrigger = button;
  blogTitle.textContent = card.querySelector("h2").textContent;
  blogImage.hidden = true;
  blogImage.removeAttribute("src");
  blogContent.replaceChildren();
  blogDialogStatus.textContent = slug ? "Cargando artículo…" : "Mostramos la reseña disponible.";
  blogDialog.showModal();
  blogContent.closest("article").scrollTop = 0;

  if (!slug) {
    blogContent.textContent = excerpt;
    return;
  }

  try {
    const post = await requestBlog(slug);
    if (requestId !== blogRequestId || !blogDialog.open) {
      return;
    }

    const content = post?.content || post?.description_html;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("El artículo no tiene contenido");
    }

    const image = blogImageUrl(post.cover_image_path_url || post.cover_image_url || post.image_url);
    if (image) {
      blogImage.src = image;
      blogImage.hidden = false;
    }
    blogContent.replaceChildren(renderArticleContent(content));
    blogDialogStatus.textContent = "";
  } catch {
    if (requestId === blogRequestId && blogDialog.open) {
      blogDialogStatus.textContent = "No pudimos cargar el artículo completo.";
      blogContent.textContent = excerpt;
    }
  }
});

blogImage.addEventListener("error", () => {
  blogImage.hidden = true;
});

blogDialog.addEventListener("click", (event) => {
  if (event.target === blogDialog) {
    blogDialog.close();
  }
});

blogDialog.addEventListener("close", () => {
  if (!blogDialog.open) {
    blogTrigger?.focus();
  }
});

loadBlogList();
