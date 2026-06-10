const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const revealItems = document.querySelectorAll(".reveal");
const modal = document.querySelector("[data-scanner-modal]");
const modalPanel = document.querySelector("[data-modal-panel]");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");
const forms = document.querySelectorAll("[data-mail-form]");

const MODAL_STORAGE_KEY = "sisu-scanner-dismissed-at";
const MODAL_DELAY_MS = 20000;
const MODAL_HIDE_MS = 1000 * 60 * 60 * 24 * 7;

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

function shouldShowModal() {
  if (!modal) {
    return false;
  }

  const dismissedAt = Number(localStorage.getItem(MODAL_STORAGE_KEY) || 0);
  return !dismissedAt || Date.now() - dismissedAt > MODAL_HIDE_MS;
}

function trapFocus(event) {
  if (!modal || modal.hasAttribute("hidden")) {
    return;
  }

  if (event.key === "Escape") {
    closeModal();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusable = modal.querySelectorAll(
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
  body.style.overflow = "";
  localStorage.setItem(MODAL_STORAGE_KEY, String(Date.now()));
  document.removeEventListener("keydown", trapFocus);

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

function buildApiPayload(formData) {
  const formContext = String(formData.get("form_context") || "").trim();
  const pageLabel = formContext === "scanner" ? "Escaner" : "Formulario de contacto";

  return {
    public_key: "pk_56addd3b121a7c30977555dfb61e9a40",
    page: pageLabel,
    contact_nombre: String(formData.get("nombre") || "").trim(),
    contact_whatsapp: String(formData.get("telefono") || "").trim(),
    contact_email: String(formData.get("email") || "").trim(),
    contact_description: String(formData.get("zona") || "").trim(),
    contact_consultation: String(formData.get("mensaje") || "").trim(),
    state: "recibido",
  };
}

function simulateApiSubmission(payload, context) {
  console.group(`Simulacion API formulario (${context})`);
  console.log("Endpoint:", "https://impulsagroup.com/api/contact_form_landing_page/index.php");
  console.log("Metodo:", "POST");
  console.log("Headers:", { "Content-Type": "application/json" });
  console.log("Body:", payload);
  console.groupEnd();
}

forms.forEach((form) => {
  form.addEventListener("submit", (event) => {
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

    simulateApiSubmission(payload, context);
    setFeedback(feedbackNode, "Formulario simulado en consola con el formato de la API.", "is-success");

    if (context === "scanner") {
      window.setTimeout(() => {
        closeModal();
        window.location.assign("pausa-viva.html");
      }, 250);
    }
  });
});
