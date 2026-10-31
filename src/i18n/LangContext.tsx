import { createContext, useContext } from "react";
import { DEFAULT_LANG, type Lang } from "./index";

// اللغة الحالية للموقع. أي مكوّن يقرأها بـ useLang() وبيتحدّث لوحده لما اللغة تتغيّر.
export const LangContext = createContext<Lang>(DEFAULT_LANG);
export const useLang = (): Lang => useContext(LangContext);
