import "./styles.css";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function animateCounter(el, target, duration = 1800) {
  const isCurrency = el.textContent.includes("R$") || el.closest(".kpi");
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);

    if (isCurrency && el.classList.contains("kpi-value")) {
      el.textContent = formatCurrency(current);
    } else {
      el.textContent = String(current);
    }

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.counter);
      if (!Number.isNaN(target)) {
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll("[data-counter]").forEach((el) => {
  counterObserver.observe(el);
});

const form = document.getElementById("contact-form");
const toast = document.getElementById("toast");

if (form && toast) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = form.querySelector("#nome");
    const email = form.querySelector("#email");
    const empresa = form.querySelector("#empresa");
    const clouds = form.querySelector("#clouds");

    let valid = true;

    [nome, email, empresa, clouds].forEach((field) => {
      if (!field || !(field instanceof HTMLInputElement || field instanceof HTMLSelectElement)) return;
      if (!field.value.trim()) {
        field.style.borderColor = "var(--danger)";
        valid = false;
      } else {
        field.style.borderColor = "";
      }
    });

    if (!valid) return;

    form.reset();
    toast.hidden = false;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.hidden = true;
      }, 350);
    }, 4000);
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const id = anchor.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

console.info(
  "%c Avroz Tecnologia — FinOps Multi-Cloud ",
  "background:#0ea5e9;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold;"
);
console.info("Ambiente de demonstração local. Domínio futuro: avroztecnologia.com");
