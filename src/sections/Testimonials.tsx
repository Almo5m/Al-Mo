import { useLang } from "../i18n/LangContext";
import { TESTIMONIALS } from "../i18n/sections";
import "./Testimonials.css";

// شريط متحرك. القائمة بتتكرر مرتين عشان اللف يبان من غير فجوة.
// TODO: الآراء دي مؤقتة، لازم تتحط آراء حقيقية بس.
export default function Testimonials() {
  const t = TESTIMONIALS[useLang()];
  const loop = [...t.items, ...t.items];
  return (
    <section id="testimonials" className="section testimonials">
      <h2>{t.title}</h2>
      <div className="marquee">
        <div className="marquee-track">
          {loop.map((it, i) => (
            <figure key={i} className="quote" aria-hidden={i >= t.items.length}>
              <blockquote>{it.text}</blockquote>
              <figcaption>{it.who}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
