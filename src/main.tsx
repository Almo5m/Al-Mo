import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/global.css";

// الصفحات الجانبية (لوحة التحكم وصفحة تقييم العميل) بتتحمّل لوحدها عند الدخول عليها بس،
// فزائر الموقع العادي ما بيحمّلش أي كود منهم.
const Admin = lazy(() => import("./admin/AdminApp"));
const Review = lazy(() => import("./review/ReviewPage"));

const path = location.pathname.replace(/\/+$/, "");
const side = path === "/admin" || path === "/review";
const page = path === "/admin" ? <Admin /> : path === "/review" ? <Review /> : <App />;

// صورة الشعار بتتحمّل مسبقًا في الموقع الرئيسي بس (شاشة التحميل بتستخدمها)، مش في اللوحة وصفحة التقييم
if (!side) {
  const l = document.createElement("link");
  l.rel = "preload";
  l.as = "image";
  l.href = "/logo-full.webp";
  l.type = "image/webp";
  document.head.appendChild(l);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>{page}</Suspense>
  </StrictMode>
);
