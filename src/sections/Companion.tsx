import RuneFrame from "../components/RuneFrame";
import CompanionChat from "../components/CompanionChat";
import Reveal from "../components/Reveal";
import { useLang } from "../i18n/LangContext";
import { COMPANION } from "../i18n/companion";
import "./Companion.css";

export default function Companion() {
  const t = COMPANION[useLang()];
  return (
    <section id="companion" className="companion">
      <div className="companion-mark">
        <Reveal>
          <RuneFrame />
        </Reveal>
      </div>
      <div className="companion-body">
        <Reveal delay={100}>
          <h2>{t.title}</h2>
        </Reveal>
        <Reveal delay={200}>
          <CompanionChat />
        </Reveal>
      </div>
    </section>
  );
}
