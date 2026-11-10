import { useEffect, useRef, useState } from "react";
import Robot from "./Robot";
import "./RuneFrame.css";

// إطار Rune بيحيط بالرفيق (روبوت 3D بيسمع أحداث الحوار: بيفكر ويتكلم ويتفاعل مع الزائر).
// الروبوت بيتحمّل لما الإطار يقرّب من الشاشة بس، عشان الصفحة تفتح خفيفة.
export default function RuneFrame() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="frame">
      <div className="frame-robot">{near && <Robot lookAtCursor listen greet />}</div>
      <svg viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true">
        <polygon
          className="edge"
          pathLength={1}
          points="0,14 12,0 42,0 46,4 54,4 58,0 88,0 100,14 100,106 88,120 12,120 0,106"
        />
        <path className="rune" d="M8 108V98M8 108H18M92 108V98M92 108H82" />
      </svg>
    </div>
  );
}
