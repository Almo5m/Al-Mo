import type { Lang } from "../i18n";

// تحوّل الحروف عند تبديل اللغة: كل نص بيبدأ حروف عشوائية وبيستقر على الكلمة الجديدة بالتتابع.
// بيشتغل على النصوص اللي في الشاشة بس، وبيتخطى اللي معلّم data-no-scramble (زي الجملة الرئيسية بالجسيمات).
const AR = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";
const EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const LETTER = /\p{L}/u;
const DURATION = 700; // مدة استقرار كل نص
const STAGGER = 25; // فرق التوقيت بين نص والتاني
const MAX_DELAY = 300;
const STEP_MS = 45; // كل قد إيه الحروف العشوائية بتتغيّر

type Item = { node: Text; target: string; delay: number };

function scrambled(target: string, resolved: number, pool: string): string {
  let out = "";
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    out += i < resolved || !LETTER.test(ch) ? ch : pool[Math.floor(Math.random() * pool.length)];
  }
  return out;
}

export function scrambleTexts(root: HTMLElement | null, lang: Lang): void {
  if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const pool = lang === "ar" ? AR : EN;

  const items: Item[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n: Node) {
      if (!(n.nodeValue ?? "").trim()) return NodeFilter.FILTER_REJECT;
      const el = n.parentElement;
      if (!el || el.closest("canvas, svg, script, style, input, textarea, [data-no-scramble]")) return NodeFilter.FILTER_REJECT;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return NodeFilter.FILTER_REJECT; // اللي ظاهر بس
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    items.push({ node: n as Text, target: n.nodeValue ?? "", delay: Math.min(items.length * STAGGER, MAX_DELAY) });
  }
  if (!items.length) return;

  const t0 = performance.now();
  let last = 0;
  const tick = (now: number) => {
    let running = false;
    const refresh = now - last >= STEP_MS;
    for (const it of items) {
      const p = (now - t0 - it.delay) / DURATION;
      if (p >= 1) {
        if (it.node.nodeValue !== it.target) it.node.nodeValue = it.target;
        continue;
      }
      running = true;
      if (refresh) it.node.nodeValue = scrambled(it.target, Math.floor(Math.max(0, p) * it.target.length), pool);
    }
    if (refresh) last = now;
    if (running) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
