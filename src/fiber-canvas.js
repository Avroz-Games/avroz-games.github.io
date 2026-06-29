/**
 * Animated fiber-optic data streams — lightweight canvas background.
 */
function initFiberCanvas() {
  const canvas = document.getElementById("fiber-canvas");
  if (!canvas) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let streams = [];
  let rafId = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStreams();
  }

  function buildStreams() {
    const count = Math.max(8, Math.floor(width / 180));
    streams = Array.from({ length: count }, (_, i) => {
      const x1 = (width / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 80;
      const y1 = height + 40;
      const x2 = x1 + (Math.random() - 0.5) * width * 0.35;
      const y2 = -40;
      const cx = (x1 + x2) / 2 + (Math.random() - 0.5) * 120;
      const cy = height * (0.25 + Math.random() * 0.45);

      return {
        x1,
        y1,
        cx,
        cy,
        x2,
        y2,
        width: 0.6 + Math.random() * 1.2,
        alpha: 0.08 + Math.random() * 0.14,
        pulseSpeed: 0.00035 + Math.random() * 0.00055,
        pulseOffset: Math.random(),
        hue: 205 + Math.random() * 35,
        packets: Array.from({ length: 2 + Math.floor(Math.random() * 2) }, () => ({
          t: Math.random(),
          speed: 0.00025 + Math.random() * 0.00045,
          size: 2 + Math.random() * 2.5,
        })),
      };
    });
  }

  function pointOnQuad(t, s) {
    const u = 1 - t;
    return {
      x: u * u * s.x1 + 2 * u * t * s.cx + t * t * s.x2,
      y: u * u * s.y1 + 2 * u * t * s.cy + t * t * s.y2,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const s of streams) {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.quadraticCurveTo(s.cx, s.cy, s.x2, s.y2);
      ctx.strokeStyle = `hsla(${s.hue}, 85%, 55%, ${s.alpha})`;
      ctx.lineWidth = s.width;
      ctx.stroke();

      const glow = ctx.createLinearGradient(s.x1, s.y1, s.x2, s.y2);
      glow.addColorStop(0, `hsla(${s.hue}, 90%, 60%, 0)`);
      glow.addColorStop(0.5, `hsla(${s.hue}, 90%, 65%, ${s.alpha * 0.6})`);
      glow.addColorStop(1, `hsla(${s.hue}, 90%, 60%, 0)`);
      ctx.strokeStyle = glow;
      ctx.lineWidth = s.width + 2;
      ctx.globalCompositeOperation = "lighter";
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";

      for (const p of s.packets) {
        p.t = (p.t + p.speed) % 1;
        const pos = pointOnQuad(p.t, s);
        const trailT = (p.t - 0.06 + 1) % 1;
        const trail = pointOnQuad(trailT, s);

        const grad = ctx.createLinearGradient(trail.x, trail.y, pos.x, pos.y);
        grad.addColorStop(0, `hsla(${s.hue}, 95%, 70%, 0)`);
        grad.addColorStop(1, `hsla(${s.hue}, 95%, 72%, 0.85)`);

        ctx.beginPath();
        ctx.moveTo(trail.x, trail.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.globalCompositeOperation = "lighter";
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 100%, 78%, 0.95)`;
        ctx.shadowColor = `hsla(${s.hue}, 100%, 70%, 0.8)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  resize();
  draw();

  window.addEventListener("resize", resize);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      draw();
    }
  });
}

initFiberCanvas();
