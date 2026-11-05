import LogoMark from "./LogoMark";
import "./RuneFrame.css";

// إطار Rune بيحيط بمكعب الشعار.
export default function RuneFrame() {
  return (
    <div className="frame">
      <div className="frame-mark">
        <LogoMark />
      </div>
      <svg viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true">
        <polygon
          className="edge"
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          points="0,14 12,0 42,0 46,4 54,4 58,0 88,0 100,14 100,106 88,120 12,120 0,106"
        />
        <path className="rune" vectorEffect="non-scaling-stroke" d="M8 108V98M8 108H18M92 108V98M92 108H82" />
      </svg>
    </div>
  );
}
