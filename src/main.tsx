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
const page = path === "/admin" ? <Admin /> : path === "/review" ? <Review /> : <App />;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>{page}</Suspense>
  </StrictMode>
);
