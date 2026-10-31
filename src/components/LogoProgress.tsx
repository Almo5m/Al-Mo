import "./LogoProgress.css";

// الشعار بيتملّي بنسبة التحميل (المتغير --p من 0 لـ 1 جاي من الـ Loader).
// كل الطبقات من نفس صورة الشعار، وكل طبقة بتظهر جزء منها.
export default function LogoProgress() {
  return (
    <div className="logo" role="img" aria-label="AL MO Digital Solutions">
      <div className="layer ring-ghost" />
      <div className="layer ring" />
      <div className="layer cube-ghost" />
      <div className="layer cube-fill" />
      <div className="layer word" />
    </div>
  );
}
