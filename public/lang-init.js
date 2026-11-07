// اللغة والاتجاه قبل أول رسم (نفس منطق detectLang في src/i18n).
// ملف خارجي مش سكريبت جوه index.html، عشان سياسة الأمان (CSP) بتمنع أي سكريبت مكتوب جوه الصفحة.
try {
  var l = localStorage.getItem("almo_lang");
  if (l !== "ar" && l !== "en") {
    l = ((navigator.languages && navigator.languages[0]) || navigator.language || "en").toLowerCase().indexOf("ar") === 0 ? "ar" : "en";
  }
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
} catch (e) {}
