import { createMessages as createPtMessages } from "./messages-pt.js";
import { createEnMessages } from "./messages-en.js";
import { createEsMessages } from "./messages-es.js";

export const SUPPORTED_LOCALES = [
  { code: "pt-BR", label: "PT", name: "Português (Brasil)" },
  { code: "en-US", label: "EN", name: "English (US)" },
  { code: "es", label: "ES", name: "Español" },
];

const STORAGE_KEY = "avroz-locale";

let currentLocale = "pt-BR";
let messages = {};

function buildCatalog() {
  const pt = createPtMessages()["pt-BR"];
  return {
    "pt-BR": pt,
    "en-US": createEnMessages(),
    es: createEsMessages(),
  };
}

function getNested(obj, path) {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

export function t(key, vars = {}) {
  let value = getNested(messages, key) ?? key;
  if (typeof value === "string") {
    Object.entries(vars).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, String(v));
    });
  }
  return value;
}

export function getLocale() {
  return currentLocale;
}

export function getCurrencyConfig() {
  return messages.currency ?? { locale: "pt-BR", code: "BRL" };
}

function detectInitialLocale() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LOCALES.some((l) => l.code === stored)) return stored;

  const nav = navigator.language || "pt-BR";
  if (nav.startsWith("pt")) return "pt-BR";
  if (nav.startsWith("es")) return "es";
  if (nav.startsWith("en")) return "en-US";
  return "pt-BR";
}

function applyTextNodes() {
  const year = new Date().getFullYear();

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const vars = key === "footer.legal1" ? { year } : {};
    el.textContent = t(key, vars);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (key) el.innerHTML = t(key);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (key) el.setAttribute("aria-label", t(key));
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) el.setAttribute("placeholder", t(key));
  });
}

function applyMeta() {
  document.documentElement.lang = currentLocale === "es" ? "es" : currentLocale;
  document.title = t("meta.title");

  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", t("meta.description"));
}

function applySelectOptions() {
  const select = document.getElementById("clouds");
  if (!select) return;

  const value = select.value;
  const options = select.querySelectorAll("option");
  options.forEach((opt) => {
    const key = opt.getAttribute("data-i18n");
    if (key && opt.value === "") opt.textContent = t(key);
  });
  select.value = value;
}

function updateLangButtons() {
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    const active = btn.getAttribute("data-lang") === currentLocale;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

export function setLocale(locale) {
  const catalog = buildCatalog();
  if (!catalog[locale]) return;

  currentLocale = locale;
  messages = catalog[locale];
  localStorage.setItem(STORAGE_KEY, locale);

  applyMeta();
  applyTextNodes();
  applySelectOptions();
  updateLangButtons();

  window.dispatchEvent(new CustomEvent("localechange", { detail: { locale } }));
}

export function initI18n() {
  const catalog = buildCatalog();
  currentLocale = detectInitialLocale();
  messages = catalog[currentLocale];

  applyMeta();
  applyTextNodes();
  applySelectOptions();
  updateLangButtons();

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLocale(btn.getAttribute("data-lang"));
    });
  });
}
