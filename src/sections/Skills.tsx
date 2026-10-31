import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import Reveal from "../components/Reveal";
import SkillIcon from "../components/SkillIcon";
import { useLang } from "../i18n/LangContext";
import { SKILLS } from "../i18n/sections";
import "./Skills.css";

export default function Skills() {
  const t = SKILLS[useLang()];
  const grid = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  // الخلية بتتوسع: التفاصيل بتتكشف بدايرة بتكبر من مركز الخلية اللي اتضغط عليها
  function choose(i: number, el: HTMLElement) {
    const g = grid.current!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setOrigin({ x: r.left - g.left + r.width / 2, y: r.top - g.top + r.height / 2 });
    setIdx(i);
    setOpen(true);
  }

  const rows: number[][] = [];
  for (let i = 0; i < t.items.length; i += 2) rows.push([i, i + 1].filter((n) => n < t.items.length));

  return (
    <section id="skills" className="section skills">
      <h2>{t.title}</h2>
      <Reveal>
        <div ref={grid} className="hex-grid">
          {rows.map((row, ri) => (
            <div key={ri} className="hex-row">
              {row.map((i) => (
                <button key={i} type="button" className="hex" onClick={(e: MouseEvent<HTMLButtonElement>) => choose(i, e.currentTarget)}>
                  <SkillIcon index={t.items[i].icon} />
                  <span className="hex-name">{t.items[i].name}</span>
                </button>
              ))}
            </div>
          ))}

          <div
            className={`skill-panel ${open ? "open" : ""}`}
            style={{ "--ox": `${origin.x}px`, "--oy": `${origin.y}px` } as CSSProperties}
            aria-hidden={!open}
          >
            <SkillIcon index={t.items[idx].icon} size={64} />
            <h3>{t.items[idx].name}</h3>
            <p>{t.items[idx].detail}</p>
            <button type="button" className="skill-close" onClick={() => setOpen(false)}>
              {t.close}
            </button>
          </div>
        </div>
        <p className="hint">{t.hint}</p>
      </Reveal>
    </section>
  );
}
