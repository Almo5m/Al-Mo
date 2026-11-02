import "./LogoMark.css";

// مكعب الشعار كـ SVG حقيقي: 4 أوجه مستقلة بتدرّجاتها الذهبية والبيضاء.
// اتتبّع من صورة المكعب (تطابق 99.4 في المية). لو عندك ملف الشعار الأصلي بصيغة vector نبدّله بيه.
const FACES: { id: string; cls: "top" | "left" | "right"; points: string; g: number[]; stops: [number, string][] }[] = [
  { id: "top", cls: "top", points: "333,0 47,172 335,345 621,173 593,154 561,137 531,117 525,116 496,96", g: [167.6, 314.0, 500.6, 31.2], stops: [[0,"rgb(233,159,30)"],[0.5,"rgb(236,170,48)"],[1,"rgb(252,239,149)"]] },
  { id: "left", cls: "left", points: "2,203 2,589 106,652 111,652 113,528 116,527 192,573 192,703 319,779 323,779 321,560 112,435 112,383 116,381 321,504 321,390 201,320 160,293 129,277 49,227 40,224 12,205", g: [142.3, 770.2, 170.0, 211.1], stops: [[0,"rgb(203,206,210)"],[0.5,"rgb(235,236,239)"],[1,"rgb(252,252,252)"]] },
  { id: "right-a", cls: "right", points: "663,203 654,205 343,392 343,502 347,504 545,386 547,387 547,657 551,657 663,590", g: [504.7, 648.8, 594.0, 189.6], stops: [[0,"rgb(204,132,27)"],[0.5,"rgb(229,161,42)"],[1,"rgb(252,234,129)"]] },
  { id: "right-b", cls: "right", points: "474,484 469,485 373,542 343,562 343,779 354,775 364,767 386,756 474,702", g: [469.7, 706.8, 347.1, 557.8], stops: [[0,"rgb(207,136,28)"],[0.5,"rgb(228,162,40)"],[1,"rgb(251,217,89)"]] },
];

export default function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg className={`lm ${className}`} viewBox="0 0 664 780" aria-hidden="true">
      <defs>
        {FACES.map((f) => (
          <linearGradient key={f.id} id={`lm-${f.id}`} gradientUnits="userSpaceOnUse" x1={f.g[0]} y1={f.g[1]} x2={f.g[2]} y2={f.g[3]}>
            {f.stops.map(([offset, color]) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
          </linearGradient>
        ))}
      </defs>
      {FACES.map((f) => (
        <polygon key={f.id} className={`lm-face lm-${f.cls}`} points={f.points} fill={`url(#lm-${f.id})`} />
      ))}
    </svg>
  );
}
