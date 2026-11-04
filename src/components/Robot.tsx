import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n/LangContext";
import type { RobotControl, RobotOptions } from "../lib/robot3d";
import "./Robot.css";

type Props = RobotOptions & { className?: string; walking?: boolean; facing?: number };

// الروبوت 3D. كود الـ three.js بيتحمّل في الخلفية عشان الصفحة تفتح بسرعة.
export default function Robot({ className = "", walking = false, facing = 0, ...opts }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ctl = useRef<RobotControl | null>(null);
  const [ready, setReady] = useState(false);
  const lang = useLang();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dead = false;
    let local: RobotControl | null = null;
    import("../lib/robot3d")
      .then((m) => m.createRobot(canvas, opts))
      .then((c) => {
        if (dead) {
          c.dispose();
          return;
        }
        local = c;
        ctl.current = c;
        setReady(true);
      })
      .catch(() => {
        /* لو WebGL أو الموديل مش شغال، المكان بيفضل بالضوء الذهبي بس */
      });
    return () => {
      dead = true;
      local?.dispose();
      ctl.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ctl.current?.setWalking(walking);
  }, [walking, ready]);
  useEffect(() => {
    ctl.current?.setFacing(facing);
  }, [facing, ready]);

  return <canvas ref={ref} className={`robot ${ready ? "ready" : ""} ${className}`} role="img" aria-label={lang === "ar" ? "الرفيق" : "The companion robot"} />;
}
