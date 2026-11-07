import { Fragment, useEffect, useRef, useState } from "react";
import "./ParticleHeadline.css";

type Point = { x: number; y: number };
type Mode = "pending" | "live" | "plain";

const FLOATS = 7; // لكل جسيمة: هدف(2) + بذور(4) + نوع(1)
const MOBILE = () => window.innerWidth < 700;

const VERT = `
precision highp float;
attribute vec2 aTarget;
attribute vec4 aSeed;
attribute float aKind;
uniform float uT;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform float uDpr;
varying float vA;
varying float vGold;
void main() {
  float minDim = min(uRes.x, uRes.y);
  vec2 pos;
  float alpha;
  float size = 1.0 + aSeed.z * 1.8;
  if (aKind > 0.5) {
    // غبار بيدور دايمًا حوالين مركز الجملة
    float r = (0.15 + aSeed.y * 0.85) * max(uRes.x, uRes.y) * 0.55;
    float a = aSeed.x * 6.2831 + uT * 0.12 * (1.3 - aSeed.y);
    pos = uCenter + vec2(cos(a) * r * 1.2, sin(a) * r * 0.6);
    alpha = 0.22 * smoothstep(0.0, 1.0, uT * 0.8);
    size *= 0.8;
  } else {
    // دوامة بتتلف وتتشد ناحية مكان الحرف
    float k = clamp((uT - aSeed.w * 0.8) / 2.4, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - k, 3.0);
    float r = 40.0 + aSeed.y * 0.45 * minDim;
    float a = aSeed.x * 6.2831 + uT * (1.2 + (1.0 - aSeed.y) * 1.6);
    vec2 swirl = uCenter + vec2(cos(a), sin(a)) * r;
    pos = mix(swirl, aTarget, e);
    pos += vec2(sin(uT * 2.0 + aSeed.x * 40.0), cos(uT * 1.7 + aSeed.y * 40.0)) * 0.9 * e;
    alpha = 0.25 + 0.75 * e;
  }
  // المؤشر بيبعثر الجسيمات اللي حواليه
  vec2 d = pos - uMouse;
  float push = smoothstep(120.0, 0.0, length(d)) * uMouseOn;
  pos += normalize(d + vec2(0.0001)) * push * 70.0;

  gl_Position = vec4(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0, 0.0, 1.0);
  gl_PointSize = size * uDpr;
  vA = alpha;
  vGold = step(0.15, fract(aSeed.x * 97.0));
}`;

const FRAG = `
precision mediump float;
varying float vA;
varying float vGold;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  vec3 col = mix(vec3(1.0), vec3(0.89, 0.69, 0.29), vGold);
  gl_FragColor = vec4(col, vA * smoothstep(0.5, 0.15, d));
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
  return s;
}

// بنرسم كل كلمة في مكانها الحقيقي ونجمع نقاط الحروف.
// القياس بقياسات الـ layout (offset) عشان انعكاس الصفحة عند تبديل اللغة ما يبوّظش الأماكن.
function sampleWords(h1: HTMLElement, cvs: HTMLElement, cap: number): Point[] {
  const off = document.createElement("canvas");
  off.width = Math.max(1, h1.offsetWidth);
  off.height = Math.max(1, h1.offsetHeight);
  const ctx = off.getContext("2d", { willReadFrequently: true })!;
  const cs = getComputedStyle(h1);
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  ctx.direction = cs.direction as CanvasDirection;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  h1.querySelectorAll("span").forEach((node) => {
    const s = node as HTMLElement;
    ctx.fillText(
      s.textContent ?? "",
      s.offsetLeft - h1.offsetLeft + s.offsetWidth / 2,
      s.offsetTop - h1.offsetTop + s.offsetHeight / 2
    );
  });

  const { data, width, height } = ctx.getImageData(0, 0, off.width, off.height);
  const ox = h1.offsetLeft - cvs.offsetLeft;
  const oy = h1.offsetTop - cvs.offsetTop;
  const pts: Point[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 128) pts.push({ x: x + ox, y: y + oy });
    }
  }
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  return pts.slice(0, cap);
}

export default function ParticleHeadline({ text }: { text: string }) {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const words = text.split(" ");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMode("plain");
      return;
    }
    let cancelled = false;
    let teardown = () => {};

    function init(): () => void {
      const h1 = h1Ref.current;
      const cvs = canvasRef.current;
      if (!h1 || !cvs) return () => {};
      try {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = cvs.offsetWidth;
        const H = cvs.offsetHeight;
        if (!W || !H) return () => {};
        cvs.width = W * dpr;
        cvs.height = H * dpr;
        const gl = cvs.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
        if (!gl) throw new Error("no webgl");

        const textCap = MOBILE() ? 9000 : 22000;
        const dustCount = MOBILE() ? 1500 : 4000;
        const pts = sampleWords(h1, cvs, textCap);
        const n = pts.length + dustCount;
        const data = new Float32Array(n * FLOATS);
        for (let i = 0; i < n; i++) {
          const o = i * FLOATS;
          const isText = i < pts.length;
          data[o] = isText ? pts[i].x : 0;
          data[o + 1] = isText ? pts[i].y : 0;
          data[o + 2] = Math.random();
          data[o + 3] = Math.random();
          data[o + 4] = Math.random();
          data[o + 5] = Math.random();
          data[o + 6] = isText ? 0 : 1;
        }

        const prog = gl.createProgram()!;
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        const stride = FLOATS * 4;
        const attr = (name: string, size: number, offset: number) => {
          const loc = gl.getAttribLocation(prog, name);
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
        };
        attr("aTarget", 2, 0);
        attr("aSeed", 4, 8);
        attr("aKind", 1, 24);

        const u = (name: string) => gl.getUniformLocation(prog, name);
        const uT = u("uT"), uMouse = u("uMouse"), uMouseOn = u("uMouseOn");
        gl.uniform2f(u("uRes"), W, H);
        gl.uniform2f(u("uCenter"), pts.reduce((s, p) => s + p.x, 0) / Math.max(1, pts.length), pts.reduce((s, p) => s + p.y, 0) / Math.max(1, pts.length));
        gl.uniform1f(u("uDpr"), dpr);

        gl.viewport(0, 0, cvs.width, cvs.height);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);

        let tx = -9999, ty = -9999, sx = -9999, sy = -9999, tOn = 0, sOn = 0;
        // الماوس: التأثير بيتبع المؤشر ويختفي لما يخرج من الصفحة.
        // اللمس: مفيش "مؤشر بيخرج"، فالتأثير بيشتغل والإصبع نازل بس ويتشال أول ما يتشال أو يبدأ سكرول (pointercancel).
        // من غير كده التأثير كان بيفضل عالق في مكان آخر لمسة.
        let touching = false;
        const setPos = (e: PointerEvent) => {
          const r = cvs.getBoundingClientRect();
          tx = e.clientX - r.left;
          ty = e.clientY - r.top;
          if (sOn < 0.05) { sx = tx; sy = ty; }
          tOn = 1;
        };
        const onMove = (e: PointerEvent) => {
          if (e.pointerType === "touch" && !touching) return;
          setPos(e);
        };
        const onDown = (e: PointerEvent) => {
          if (e.pointerType !== "touch") return;
          touching = true;
          setPos(e);
        };
        const onUp = (e: PointerEvent) => {
          if (e.pointerType !== "touch") return;
          touching = false;
          tOn = 0;
        };
        const onLeave = () => { tOn = 0; };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
        document.documentElement.addEventListener("pointerleave", onLeave);

        const t0 = performance.now();
        let raf = 0;
        const frame = (now: number) => {
          sx += (tx - sx) * 0.2;
          sy += (ty - sy) * 0.2;
          sOn += (tOn - sOn) * 0.1;
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.uniform1f(uT, (now - t0) / 1000);
          gl.uniform2f(uMouse, sx, sy);
          gl.uniform1f(uMouseOn, sOn);
          gl.drawArrays(gl.POINTS, 0, n);
          raf = requestAnimationFrame(frame);
        };
        // بنوقف الرسم لما الـ Hero يطلع من الشاشة (توفير بطارية)
        const io = new IntersectionObserver(([en]) => {
          if (en.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
          else { cancelAnimationFrame(raf); raf = 0; }
        });
        io.observe(cvs);

        setMode("live");
        return () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);
          document.documentElement.removeEventListener("pointerleave", onLeave);
          gl.deleteBuffer(buf);
          gl.deleteProgram(prog);
        };
      } catch {
        setMode("plain"); // لو WebGL مش شغال، النص العادي يظهر
        return () => {};
      }
    }

    let timer = 0;
    let firstResize = true;
    let ro: ResizeObserver | null = null;
    (async () => {
      await document.fonts.ready;
      if (cancelled) return;
      teardown = init();
      const cvs = canvasRef.current;
      if (!cvs) return;
      ro = new ResizeObserver(() => {
        if (firstResize) { firstResize = false; return; }
        clearTimeout(timer);
        timer = window.setTimeout(() => { teardown(); teardown = init(); }, 250);
      });
      ro.observe(cvs);
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      ro?.disconnect();
      teardown();
    };
  }, [text]);

  return (
    <div className="ph">
      <canvas ref={canvasRef} className="ph-canvas" aria-hidden="true" />
      <h1 ref={h1Ref} className={`ph-h1 ${mode}`} data-no-scramble>
        {words.map((w, i) => (
          <Fragment key={i}>
            <span>{w}</span>{" "}
          </Fragment>
        ))}
      </h1>
    </div>
  );
}
