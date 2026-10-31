import { useEffect, useRef, type ReactNode } from "react";
import { attachSparks } from "../lib/sparks";

// حاوية لخانة كتابة: الجسيمات بتطلع من حدّها لما تتعمل عليها focus
export default function SparkBox({ className = "", children }: { className?: string; children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!host.current || !canvas.current) return;
    return attachSparks(host.current, canvas.current, { on: ["focusin"], off: ["focusout"] });
  }, []);

  return (
    <div ref={host} className={`spark-host ${className}`}>
      {children}
      <canvas ref={canvas} className="spark-fx" aria-hidden="true" />
    </div>
  );
}
