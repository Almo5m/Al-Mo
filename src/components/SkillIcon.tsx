import type { CSSProperties } from "react";
import "./SkillIcon.css";

// أيقونات مخصصة بلغة شعار AL MO: مكعبات ثلاثية الأوجه (فوق ذهبي، يسار أبيض، يمين ذهبي غامق)
// بينهم فواصل سودا رفيعة، ولما المؤشر يقف عليها الأوجه بتتركّب من جديد زي الشعار.
type Pt = [number, number];
const GOLD = "#E3B04B";
const DEEP = "#C98A1B";
const WHITE = "#FFFFFF";

const pts = (a: Pt[]) => a.map((p) => p.join(",")).join(" ");

function Cube({ cx, cy, r, d = 0 }: { cx: number; cy: number; r: number; d?: number }) {
  const dx = r * 0.866;
  const h = r / 2;
  const top: Pt[] = [[cx, cy - r], [cx + dx, cy - h], [cx, cy], [cx - dx, cy - h]];
  const left: Pt[] = [[cx - dx, cy - h], [cx, cy], [cx, cy + r], [cx - dx, cy + h]];
  const right: Pt[] = [[cx, cy], [cx + dx, cy - h], [cx + dx, cy + h], [cx, cy + r]];
  return (
    <g style={{ "--d": `${d}ms` } as CSSProperties}>
      <polygon className="face f-top" points={pts(top)} fill={GOLD} />
      <polygon className="face f-left" points={pts(left)} fill={WHITE} />
      <polygon className="face f-right" points={pts(right)} fill={DEEP} />
    </g>
  );
}

const cut = { stroke: "#000", strokeWidth: 1.4, strokeLinecap: "round" as const };

// مواقع: مكعب بشريط عنوان وخطوط محتوى محفورة فيه (نافذة متصفح)
function Web() {
  return (
    <>
      <Cube cx={24} cy={24} r={18} />
      <line x1={8.4} y1={22} x2={24} y2={31} {...cut} />
      <line x1={24} y1={31} x2={39.6} y2={22} {...cut} />
      <line x1={24} y1={36} x2={39.6} y2={27} {...cut} />
      <circle cx={24} cy={15} r={1.6} fill="#000" />
    </>
  );
}

// أنظمة إدارة: ثلاث صناديق متراصة (مخزن وطلبات)
function Systems() {
  return (
    <>
      <Cube cx={14.5} cy={32} r={9.5} />
      <Cube cx={33.5} cy={32} r={9.5} d={80} />
      <Cube cx={24} cy={18} r={9.5} d={160} />
    </>
  );
}

// موبايل: منشور طويل وشاشة محفورة في وجهه الأبيض
function Mobile() {
  const top: Pt[] = [[24, 5], [34, 10], [24, 15], [14, 10]];
  const left: Pt[] = [[14, 10], [24, 15], [24, 43], [14, 38]];
  const right: Pt[] = [[24, 15], [34, 10], [34, 38], [24, 43]];
  return (
    <>
      <g>
        <polygon className="face f-top" points={pts(top)} fill={GOLD} />
        <polygon className="face f-left" points={pts(left)} fill={WHITE} />
        <polygon className="face f-right" points={pts(right)} fill={DEEP} />
      </g>
      <polygon points="16.2,13.4 22,16.8 22,37.2 16.2,33.8" fill="#000" opacity="0.9" />
    </>
  );
}

// أتمتة وAI: مكعب مركزي متوصل بعقد (شبكة)
function Network() {
  const nodes: Pt[] = [[8, 11], [40, 11], [8, 37], [40, 37]];
  return (
    <>
      {nodes.map((n, i) => (
        <line key={`l${i}`} x1={n[0]} y1={n[1]} x2={24} y2={24} stroke={GOLD} strokeWidth={1.2} opacity={0.7} />
      ))}
      <Cube cx={24} cy={24} r={10} />
      {nodes.map((n, i) => (
        <circle key={`n${i}`} className="node" cx={n[0]} cy={n[1]} r={2.6} fill={GOLD} style={{ "--d": `${i * 70}ms` } as CSSProperties} />
      ))}
    </>
  );
}

const ICONS = [Web, Systems, Mobile, Network];

export default function SkillIcon({ index, size }: { index: number; size?: number }) {
  const Icon = ICONS[index % ICONS.length];
  return (
    <svg className="sicon" viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <Icon />
    </svg>
  );
}
