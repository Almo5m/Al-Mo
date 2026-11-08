import { useEffect } from "react";
import { track } from "./track";

// زيارة + الأقسام اللي الزائر وصلها (قسم بيتعد لما 40% منه يظهر)
export function useAnalytics(ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    track("view");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          if (e.target.id && e.target.id !== "top") track("section", e.target.id);
          io.unobserve(e.target);
        }),
      { threshold: 0.4 }
    );
    document.querySelectorAll("main section[id]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready]);
}
