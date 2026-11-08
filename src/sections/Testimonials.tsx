import { useLang } from "../i18n/LangContext";
import { TESTIMONIALS } from "../i18n/sections";
import { useReviews } from "../lib/reviews";
import "./Testimonials.css";

// شريط متحرك بآراء العملاء اللي قبلتها من لوحة التحكم. القسم نفسه مش بيترسم غير لما يكون فيه آراء (شوف App.tsx).
// القائمة بتتكرر لحد ما النص الأول يملا الشاشة، وبعدين تتكرر مرتين عشان اللف يبان من غير فجوة.
export default function Testimonials() {
  const t = TESTIMONIALS[useLang()];
  const items = useReviews();
  const half = Array.from({ length: Math.max(1, Math.ceil(4 / items.length)) }).flatMap(() => items);
  const loop = [...half, ...half];
  return (
    <section id="testimonials" className="section testimonials">
      <h2>{t.title}</h2>
      <div className="marquee">
        <div className="marquee-track">
          {loop.map((it, i) => (
            <figure key={i} className="quote" aria-hidden={i >= items.length}>
              <blockquote>{it.body}</blockquote>
              <figcaption>{it.author_role ? `${it.author_name} · ${it.author_role}` : it.author_name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
