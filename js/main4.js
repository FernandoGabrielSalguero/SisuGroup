const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const revealItems = document.querySelectorAll(".reveal");
const typewriterItems = document.querySelectorAll("[data-typewriter-text]");
const trustedOrbitLogos = document.querySelectorAll(".trusted-orbit-logo");
const modal = document.querySelector("[data-scanner-modal]");
let forms = [];

const MODAL_STORAGE_KEY = "sisu-scanner-dismissed-at";
const MODAL_DELAY_MS = 20000;
const MODAL_HIDE_MS = 1000 * 60 * 60;
const CONTACT_API_ENDPOINT = "https://impulsagroup.com/api/contact_form_landing_page/index.php";
const CONTACT_PUBLIC_KEY = "pk_56addd3b121a7c30977555dfb61e9a40";
const DEMO_CTA_LABEL = "Solicitar Demo Pausa Viva";
const SCANNER_WHATSAPP_URL = "https://wa.me/5491121753936";

const scannerQuestions = [
  "¿Con qué frecuencia a tu equipo le cuesta sostener la concentración en tareas complejas, entre mensajes, reuniones e interrupciones?",
  "¿Con qué frecuencia las decisiones se demoran o se toman en “modo incendio”, reaccionando a lo urgente?",
  "¿Con qué frecuencia aparecen errores simples, olvidos o retrabajo en tareas que el equipo domina?",
  "¿Con qué frecuencia el equipo espera indicaciones en lugar de proponer y anticiparse?",
  "¿Con qué frecuencia la coordinación entre personas o áreas genera fricción, malentendidos o idas y vueltas?",
  "¿Con qué frecuencia los resultados del área (plazos, calidad, ventas, servicio) se resienten, aunque el esfuerzo del equipo aumenta?",
];

const scannerOptions = [
  { label: "Nunca", score: 0 },
  { label: "A veces", score: 1 },
  { label: "Frecuentemente", score: 2 },
];

const scannerZones = {
  green: {
    color: "verde",
    title: "Capacidad de respuesta disponible",
    copy: "Tu equipo muestra buena capacidad para enfocarse, decidir y ejecutar. El desafío es sostenerla en los picos de exigencia.",
    nextStep: "Si querés anticiparte a esos picos, el siguiente paso es el Escáner de Saturación Mental, un diagnóstico de cortesía.",
    ctaLabel: "Conocer el Escáner",
  },
  yellow: {
    color: "amarillo",
    title: "Capacidad de respuesta en tensión",
    copy: "Aparecen señales de que la capacidad del equipo empieza a quedar corta frente a la exigencia. Es el mejor momento para intervenir, antes de que impacte en los resultados.",
    nextStep: "Escáner de Saturación Mental: una breve conversación y un análisis más profundo para identificar qué capacidad conviene recuperar primero. De cortesía.",
    ctaLabel: "Quiero mi Escáner",
  },
  red: {
    color: "rojo",
    title: "Capacidad de respuesta comprometida",
    copy: "Las señales son consistentes: la exigencia supera la capacidad disponible del equipo y puede estar afectando errores, plazos, rotación y el desgaste de los líderes. Conviene profundizar pronto para definir cómo intervenir.",
    nextStep: "Escáner de Saturación Mental, para obtener un diagnóstico preliminar y definir por dónde empezar. De cortesía.",
    ctaLabel: "Quiero mi Escáner",
  },
};

let lastFocusedElement = null;
let modalTimer = null;
let modalPanel = null;
let demoModal = null;
let demoModalPanel = null;

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

function renderScannerModal() {
  if (!modal) {
    return;
  }

  const contactLinks = `
    <a href="mailto:contacto@sisu-group.net">contacto@sisu-group.net</a>
    <span><span class="scanner-contact-separator" aria-hidden="true">·</span><a href="${SCANNER_WHATSAPP_URL}" target="_blank" rel="noopener">WhatsApp +54 9 11 2175 3936</a></span>
  `;

  modal.innerHTML = `
    <div class="scanner-modal capacity-modal" role="dialog" aria-modal="true" aria-labelledby="scanner-title" tabindex="-1" data-modal-panel>
      <button class="modal-close" type="button" aria-label="Cerrar" data-modal-close>&times;</button>
      <div class="scanner-flow" data-scanner-app>
        <section class="scanner-screen" data-scanner-screen="intro">
          <p class="eyebrow">AUTODIAGNÓSTICO DE 2 MINUTOS</p>
          <h2 id="scanner-title">Semáforo de Capacidad de Respuesta</h2>
          <p id="scanner-description">¿Con qué capacidad está respondiendo hoy un equipo de tu empresa? Seis preguntas para saberlo.</p>
          <div class="scanner-badges">
            <span>6 preguntas</span>
            <span>2 minutos</span>
            <span>Resultado inmediato</span>
          </div>
          <p class="scanner-instruction">Pensá en un equipo o área que hoy te preocupe y en cómo funcionó en los últimos 3 meses.</p>
          <button class="button button-primary scanner-start" type="button" data-scanner-start>Comenzar diagnóstico</button>
        </section>
        <section class="scanner-screen" data-scanner-screen="quiz" hidden>
          <p class="scanner-step" id="scanner-step" data-scanner-step></p>
          <span class="scanner-progress" aria-hidden="true"><span data-scanner-progress-bar></span></span>
          <div class="scanner-question-card">
            <h2 id="scanner-question" tabindex="-1" data-scanner-question></h2>
          </div>
          <div class="scanner-options" role="group" aria-labelledby="scanner-question" data-scanner-options></div>
        </section>
        <section class="scanner-screen" data-scanner-screen="result" hidden>
          <div class="scanner-result-card">
            <div class="scanner-traffic-light" role="img" id="scanner-light" data-scanner-light>
              <span class="scanner-lamp scanner-lamp-red"></span>
              <span class="scanner-lamp scanner-lamp-yellow"></span>
              <span class="scanner-lamp scanner-lamp-green"></span>
            </div>
            <p class="scanner-result-score" aria-describedby="scanner-light" tabindex="-1" data-scanner-score></p>
            <h2 id="scanner-result-title" data-scanner-result-title></h2>
            <p data-scanner-result-copy></p>
            <p><strong>Próximo paso</strong><br><span data-scanner-next-step></span></p>
            <a class="button button-primary scanner-result-link" target="_blank" rel="noopener" data-scanner-result-link></a>
          </div>
          <div class="scanner-contacts">${contactLinks}</div>
          // <section class="scanner-path" aria-labelledby="scanner-path-title">
          //   <h3 id="scanner-path-title">Un camino paso a paso</h3>
          //   <ol>
          //     <li><strong>Semáforo de Capacidad de Respuesta</strong><p>Lo que acabás de hacer: una primera lectura en 2 minutos.</p></li>
          //     <li><strong>Escáner de Saturación Mental</strong><p>Una conversación breve para entender tu situación y un análisis de 15 a 20 preguntas adaptado a tu equipo. Resultado: un diagnóstico preliminar. De cortesía.</p></li>
          //     <li><strong>Demo de 30 minutos</strong><p>Tu equipo vive una intervención breve y ve el cambio medido.</p></li>
          //     <li><strong>Plan a medida</strong><p>Intervención de Conciencia (60 min), Ciclo Inicial (3 meses) o Plan Continuo (6 meses).</p></li>
          //   </ol>
          // </section>
          // <footer class="scanner-footer">
          //   <h3>Recuperamos la capacidad de respuesta de los equipos</h3>
          //   <p>Intervenciones breves y medibles, integradas a la jornada laboral.</p>
          //   <p class="scanner-signature">El arte de pausar para avanzar</p>
          //   <div class="scanner-contacts">
          //     <a href="https://www.sisu-group.net/">www.sisu-group.net</a>
          //     <span aria-hidden="true">·</span>
          //     ${contactLinks}
          //   </div>
          // </footer>
        </section>
      </div>
    </div>
  `;
  modalPanel = modal.querySelector("[data-modal-panel]");
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

renderScannerModal();
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

  const focusable = Array.from(activeModal.backdrop.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input:not([type="hidden"]), select, [tabindex]:not([tabindex="-1"])'
  )).filter((element) => !element.closest("[hidden]"));

  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && (document.activeElement === first || document.activeElement === activeModal.panel)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openModal() {
  if (!modal || !modalPanel || !modal.hidden || (demoModal && !demoModal.hidden)) {
    return;
  }

  window.clearTimeout(modalTimer);
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
    if (event.target === modal || event.target.closest("[data-modal-close]")) {
      closeModal();
    }
  });

  if (shouldShowModal()) {
    modalTimer = window.setTimeout(openModal, MODAL_DELAY_MS);
  }
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
    start: scannerApp.querySelector("[data-scanner-start]"),
    step: scannerApp.querySelector("[data-scanner-step]"),
    progressBar: scannerApp.querySelector("[data-scanner-progress-bar]"),
    question: scannerApp.querySelector("[data-scanner-question]"),
    options: scannerApp.querySelector("[data-scanner-options]"),
    light: scannerApp.querySelector("[data-scanner-light]"),
    score: scannerApp.querySelector("[data-scanner-score]"),
    resultTitle: scannerApp.querySelector("[data-scanner-result-title]"),
    resultCopy: scannerApp.querySelector("[data-scanner-result-copy]"),
    nextStep: scannerApp.querySelector("[data-scanner-next-step]"),
    resultLink: scannerApp.querySelector("[data-scanner-result-link]"),
  };
}

function showScannerScreen(name) {
  const parts = getScannerParts();
  if (!parts) {
    return;
  }

  ["intro", "quiz", "result"].forEach((screenName) => {
    parts[screenName].hidden = screenName !== name;
  });
  modalPanel.setAttribute("aria-labelledby", parts[name].querySelector("h2").id);
  if (name === "intro") {
    modalPanel.setAttribute("aria-describedby", "scanner-description");
  } else {
    modalPanel.removeAttribute("aria-describedby");
  }
  scannerApp.scrollTop = 0;
}

function renderScannerQuestion() {
  const parts = getScannerParts();
  const question = scannerQuestions[currentQuestionIndex];
  if (!parts || !question) {
    return;
  }

  parts.step.textContent = `Pregunta ${currentQuestionIndex + 1} de ${scannerQuestions.length}`;
  parts.question.textContent = question;
  parts.progressBar.style.width = `${((currentQuestionIndex + 1) / scannerQuestions.length) * 100}%`;
  parts.options.innerHTML = "";

  scannerOptions.forEach((option) => {
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
  parts.question.focus();
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

  const message = `Hola, hice el Semáforo y me dio ${zone.color}. Quiero el Escáner.`;
  parts.light.dataset.color = zone.color;
  parts.light.setAttribute("aria-label", `Semáforo: ${zone.color}`);
  parts.score.textContent = `Tu resultado: ${totalScore} de ${scannerQuestions.length * 2} puntos`;
  parts.resultTitle.textContent = zone.title;
  parts.resultCopy.textContent = zone.copy;
  parts.nextStep.textContent = zone.nextStep;
  parts.resultLink.textContent = zone.ctaLabel;
  parts.resultLink.href = `${SCANNER_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;

  showScannerScreen("result");
  parts.score.focus({ preventScroll: true });
}

function resetScanner() {
  currentQuestionIndex = 0;
  scannerAnswers = [];

  showScannerScreen("intro");
}

if (scannerApp) {
  getScannerParts().start.addEventListener("click", () => {
    showScannerScreen("quiz");
    renderScannerQuestion();
  });
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
