import { useEffect, useRef, type ReactNode } from "react";
import { attachSparks } from "../lib/sparks";
import "./ParticleButton.css";

// زرار بجسيمات ذهبية بتطلع من حدّه وتدور حواليه لما المؤشر يقف عليه
export default function ParticleButton({ href, variant, children }: { href: string; variant: "primary" | "secondary"; children: ReactNode }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const a = linkRef.current;
    const c = canvasRef.current;
    if (!a || !c) return;
    return attachSparks(a, c, { on: ["pointerenter", "focus"], off: ["pointerleave", "blur"] });
  }, []);

  return (
    <a ref={linkRef} className={`btn ${variant}`} href={href}>
      {children}
      <canvas ref={canvasRef} className="spark-fx" aria-hidden="true" />
    </a>
  );
}
