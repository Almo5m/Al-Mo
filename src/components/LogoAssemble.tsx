import LogoMark from "./LogoMark";
import "./LogoAssemble.css";

// الشعار بيتركّب من العدم: الحلقة بتترسم، أوجه المكعب بتتجمّع، وبعدها الاسم والوصف بيظهروا تحته.
// الحركة كلها بالـ CSS ومرتبطة بتوقيت واحد (شوف LogoAssemble.css). play = ابدأ الحركة.
export default function LogoAssemble({ play }: { play: boolean }) {
  return (
    <div className={`asm ${play ? "play" : ""}`} role="img" aria-label="AL MO Digital Solutions">
      <div className="asm-glow" />
      <div className="asm-layer asm-ring" />
      <LogoMark className="asm-cube" />
      <div className="asm-layer asm-name" />
      <div className="asm-layer asm-sub" />
    </div>
  );
}
