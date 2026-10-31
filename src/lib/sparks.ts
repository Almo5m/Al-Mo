// جسيمات ذهبية بتطلع من حدّ عنصر وتدور حواليه. بتُستخدم في الأزرار وخانات الكتابة.
export const SPARK_PAD = 28; // مساحة الـ canvas حوالين العنصر

type Spark = { x: number; y: number; vx: number; vy: number; life: number; size: number };

export function attachSparks(
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  opts: { on: string[]; off: string[] }
): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const gold = getComputedStyle(document.documentElement).getPropertyValue("--gold").trim() || "#e3b04b";

  let w = 0, h = 0, raf = 0, hot = false;
  let sparks: Spark[] = [];

  const resize = () => {
    w = host.offsetWidth;
    h = host.offsetHeight;
    canvas.width = (w + SPARK_PAD * 2) * dpr;
    canvas.height = (h + SPARK_PAD * 2) * dpr;
    canvas.style.width = `${w + SPARK_PAD * 2}px`;
    canvas.style.height = `${h + SPARK_PAD * 2}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawn = () => {
    const per = 2 * (w + h);
    const s = Math.random() * per;
    let x: number, y: number, nx: number, ny: number;
    if (s < w) { x = s; y = 0; nx = 0; ny = -1; }
    else if (s < w + h) { x = w; y = s - w; nx = 1; ny = 0; }
    else if (s < 2 * w + h) { x = 2 * w + h - s; y = h; nx = 0; ny = 1; }
    else { x = 0; y = per - s; nx = -1; ny = 0; }
    const out = 0.3 + Math.random() * 0.7;
    const side = (Math.random() - 0.5) * 1.2; // دوران حوالين الحد
    sparks.push({ x: x + SPARK_PAD, y: y + SPARK_PAD, vx: nx * out - ny * side, vy: ny * out + nx * side, life: 1, size: 0.8 + Math.random() * 1.6 });
  };

  const frame = () => {
    ctx.clearRect(0, 0, w + SPARK_PAD * 2, h + SPARK_PAD * 2);
    if (hot) for (let i = 0; i < 3; i++) spawn();
    sparks = sparks.filter((p) => p.life > 0);
    ctx.fillStyle = gold;
    for (const p of sparks) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.022;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    raf = hot || sparks.length ? requestAnimationFrame(frame) : 0;
  };

  const on = () => { hot = true; resize(); if (!raf) raf = requestAnimationFrame(frame); };
  const off = () => { hot = false; };
  opts.on.forEach((e) => host.addEventListener(e, on));
  opts.off.forEach((e) => host.addEventListener(e, off));
  return () => {
    cancelAnimationFrame(raf);
    opts.on.forEach((e) => host.removeEventListener(e, on));
    opts.off.forEach((e) => host.removeEventListener(e, off));
  };
}
