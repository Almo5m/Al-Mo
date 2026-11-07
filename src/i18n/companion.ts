import type { Lang } from "./index";

type CompanionText = {
  title: string;
  chatTitle: string;
  floatHint: string;
  opener: string;
  placeholder: string;
  send: string;
  thinking: string;
  offline: string;
  limit: string;
  error: string;
  handoff: string;
  handoffTitle: string;
  yourName: string;
  yourEmail: string;
  consent: string;
  handoffSend: string;
  cancel: string;
  handoffOk: string;
  handoffInvalid: string;
};

// الرفيق بيتكلم باسم AL MO Digital Solutions. الترجمة الإنجليزي محتاجة مراجعة.
export const COMPANION: Record<Lang, CompanionText> = {
  ar: {
    title: "الرفيق",
    chatTitle: "اتكلم مع الرفيق",
    floatHint: "عندك فكرة؟ احكيلي عنها.",
    opener: "أهلًا. أنا الرفيق، مساعد AI بتاع AL MO Digital Solutions. إيه اللي جابك هنا؟",
    placeholder: "اكتب رسالتك",
    send: "إرسال",
    thinking: "بيكتب...",
    offline: "الرفيق مش متاح دلوقتي. تقدر تكلّمنا مباشرة من قنوات التواصل.",
    limit: "وصلت للحد المسموح. جرّب بعد شوية.",
    error: "حصلت مشكلة. جرّب تاني.",
    handoff: "ابعت طلبي",
    handoffTitle: "بيانات التواصل",
    yourName: "اسمك",
    yourEmail: "إيميلك",
    consent: "أوافق إن ملخص حواري مع الرفيق يتبعت لـ AL MO عشان يتم التواصل معايا.",
    handoffSend: "إرسال",
    cancel: "إلغاء",
    handoffOk: "وصل طلبك وهنتواصل معاك قريب.",
    handoffInvalid: "اكتب اسمك وإيميلك صح ووافق عشان نبعت.",
  },
  en: {
    title: "The companion",
    chatTitle: "Talk to the companion",
    floatHint: "Got an idea? Tell me about it.",
    opener: "Hi. I'm the companion, the AI assistant of AL MO Digital Solutions. What brings you here?",
    placeholder: "Type your message",
    send: "Send",
    thinking: "typing...",
    offline: "The companion isn't available right now. You can reach us directly through the contact channels.",
    limit: "You've reached the limit. Try again in a bit.",
    error: "Something went wrong. Try again.",
    handoff: "Send my request",
    handoffTitle: "Your contact details",
    yourName: "Your name",
    yourEmail: "Your email",
    consent: "I agree to send a summary of my chat with the companion to AL MO so they can contact me.",
    handoffSend: "Send",
    cancel: "Cancel",
    handoffOk: "Your request has been received. We'll be in touch soon.",
    handoffInvalid: "Enter a valid name and email and agree so we can send it.",
  },
};
