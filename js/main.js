const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const revealItems = document.querySelectorAll(".reveal");
const modal = document.querySelector("[data-scanner-modal]");
const modalPanel = document.querySelector("[data-modal-panel]");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");
let forms = [];

const MODAL_STORAGE_KEY = "sisu-scanner-dismissed-at";
const MODAL_DELAY_MS = 20000;
const MODAL_HIDE_MS = 1000 * 60 * 60 * 24 * 7;
const CONTACT_API_ENDPOINT = "https://impulsagroup.com/api/contact_form_landing_page/index.php";
const CONTACT_PUBLIC_KEY = "pk_56addd3b121a7c30977555dfb61e9a40";
const DEMO_CTA_LABEL = "Solicitar Demo Pausa Viva";

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
    ctaLabel: "Coordinar Demo Express",
    ctaHref: "contacto.html#formulario-contacto",
  },
  red: {
    name: "Zona Roja",
    range: "9 a 12 puntos",
    title: "Carga mental elevada",
    copy: "La organizacion muestra senales consistentes de saturacion mental. Esto puede impactar en errores, ausentismo, rotacion y desgaste de lideres.",
    recommendation: "Implementar una intervencion breve, medible y adaptada.",
    ctaLabel: "Coordinar Demo Express",
    ctaHref: "contacto.html#formulario-contacto",
  },
};

let lastFocusedElement = null;
let modalTimer = null;
let demoModal = null;
let demoModalPanel = null;

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

if (revealItems.length > 0) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }
}

const processAccordion = document.querySelector("[data-process-accordion]");

if (processAccordion) {
  const processItems = Array.from(processAccordion.querySelectorAll(".process-item"));

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
        panel.hidden = !isOpen;
      }
    });
  };

  const closeAllProcessItems = () => {
    processItems.forEach((item) => {
      const trigger = item.querySelector("[data-process-trigger]");
      const panel = item.querySelector("[data-process-panel]");

      item.classList.remove("is-open");

      if (trigger instanceof HTMLButtonElement) {
        trigger.setAttribute("aria-expanded", "false");
      }

      if (panel instanceof HTMLElement) {
        panel.hidden = true;
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
        closeAllProcessItems();
        return;
      }

      setOpenProcessItem(item);
    });
  });

  closeAllProcessItems();
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

  const dismissedAt = Number(localStorage.getItem(MODAL_STORAGE_KEY) || 0);
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
  localStorage.setItem(MODAL_STORAGE_KEY, String(Date.now()));
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
  const page = body?.dataset.page?.trim();
  if (page) {
    return page;
  }

  const path = window.location.pathname.split("/").pop() || "index.html";
  return path;
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
  const empresa = String(formData.get("empresa") || "").trim();
  const zona = String(formData.get("zona") || "").trim();
  const mensaje = String(formData.get("mensaje") || "").trim();

  if (formContext === "demo") {
    return {
      public_key: CONTACT_PUBLIC_KEY,
      page: pageLabel,
      contact_nombre: nombre,
      contact_whatsapp: whatsapp,
      contact_email: email,
      contact_description: buildDescription([
        empresa ? `Empresa: ${empresa}` : "",
        mensaje ? `Mensaje: ${mensaje}` : "",
      ]),
      contact_consultation: "Formulario Solicitar Demo Pausa Viva",
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
      contact_description: buildDescription([
        zona ? `Zona detectada: ${zona}` : "",
        mensaje,
      ]),
      contact_consultation: "Formulario Escaner de Carga Mental Organizacional",
      state: "recibido",
    };
  }

  return {
    public_key: CONTACT_PUBLIC_KEY,
    page: pageLabel,
    contact_nombre: nombre,
    contact_whatsapp: whatsapp,
    contact_email: email,
    contact_description: buildDescription([
      zona ? `Zona: ${zona}` : "",
      mensaje ? `Mensaje: ${mensaje}` : "",
    ]),
    contact_consultation: "Formulario de contacto sitio web",
    state: "recibido",
  };
}

async function submitApiForm(payload) {
  const response = await fetch(CONTACT_API_ENDPOINT, {
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

  return responseText;
}

forms.forEach((form) => {
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
