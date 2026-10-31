import type { Lang } from "./index";

type AboutText = {
  title: string;
  body: string;
  chatTitle: string;
  opener: string;
  placeholder: string;
  send: string;
  thinking: string;
  offline: string;
  limit: string;
  error: string;
};

// النبذة بصوت معاذ. الترجمة الإنجليزي محتاجة مراجعته.
export const ABOUT: Record<Lang, AboutText> = {
  ar: {
    title: "نبذة عن معاذ",
    body: "أنا معاذ أحمد أمين. هدفي هو التغيير وترك أثر جميل في الحياة، مش بس أقدّم خدمة أو فكرة. كل مشروع بشتغله كأنه الأول بالنسبة لي، وبحب أتعلم دايمًا وأكون سابق نفسي بخطوة. مش بهتم بكلام الناس طول ما أنا ماشي صح، وبحاول دايمًا أقدّم أحسن ما عندي لكل اللي حواليا.",
    chatTitle: "اتكلم مع الرفيق",
    opener: "أهلًا. أنا الرفيق، مساعد AI شغّال مع معاذ. إيه اللي جابك هنا؟",
    placeholder: "اكتب رسالتك",
    send: "إرسال",
    thinking: "بيكتب...",
    offline: "الرفيق لسه مش متوصّل بالسيرفر (وضع تجريبي).",
    limit: "وصلت للحد المسموح. جرّب بعد شوية.",
    error: "حصلت مشكلة. جرّب تاني.",
  },
  en: {
    title: "About Moaz",
    body: "I'm Moaz Ahmed Amin. My goal is to make a change and leave a beautiful mark on life, not just to deliver a service or an idea. I work on every project as if it were my first. I love to keep learning and to stay one step ahead of my past self. I don't mind what people say as long as I'm on the right path, and I always try to give the best I have to everyone around me.",
    chatTitle: "Talk to the companion",
    opener: "Hi. I'm the companion, an AI assistant working with Moaz. What brings you here?",
    placeholder: "Type your message",
    send: "Send",
    thinking: "typing...",
    offline: "The companion isn't connected to the server yet (demo mode).",
    limit: "You've reached the limit. Try again in a bit.",
    error: "Something went wrong. Try again.",
  },
};
