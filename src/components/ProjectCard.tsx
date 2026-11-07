import { useRef, type PointerEvent } from "react";
import "./ProjectCard.css";

type Props = {
  title: string;
  desc: string;
  impact: string;
  tags: string[];
  preview?: string; // لقطة شاشة الديمو (اختياري)
  labels: { preview: string; impact: string; demo: string; soon: string };
  canDemo: boolean;
  onDemo: () => void;
};

// كارت مشروع بميل ثلاثي الأبعاد خفيف ولمعة ذهبية بتتبع المؤشر (على الأجهزة اللي فيها ماوس بس)
export default function ProjectCard({ title, desc, impact, tags, preview, labels, canDemo, onDemo }: Props) {
  const ref = useRef<HTMLElement>(null);

  function move(e: PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - y) * 8).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * 8).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
  }
  function leave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <article ref={ref} className="card" onPointerMove={move} onPointerLeave={leave}>
      {preview ? (
        <div className="preview has-img">
          <img src={preview} alt={title} width={1280} height={674} loading="lazy" decoding="async" />
        </div>
      ) : (
        <div className="preview" aria-hidden="true">
          <span>{labels.preview}</span>
        </div>
      )}
      <h3>{title}</h3>
      <p className="desc">{desc}</p>
      <ul className="tags">
        {tags.map((tag) => (
          <li key={tag} className="tag">
            [{tag}]
          </li>
        ))}
      </ul>
      <p className="impact">
        <b>{labels.impact}:</b> {impact}
      </p>
      <button type="button" className="card-btn" onClick={onDemo} disabled={!canDemo}>
        {canDemo ? labels.demo : labels.soon}
      </button>
    </article>
  );
}
