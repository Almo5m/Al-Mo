import "./CompanionBubble.css";

// فقاعة كلام الرفيق للرسائل (نجاح بالذهبي، خطأ بالأحمر المطفي)
export default function CompanionBubble({ who, text, kind }: { who: string; text: string; kind: "ok" | "error" }) {
  return (
    <div className={`bubble-msg ${kind}`} role="status">
      <span className="who">{who}</span>
      <p>{text}</p>
    </div>
  );
}
