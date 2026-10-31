import RuneFrame from "../components/RuneFrame";
import CompanionChat from "../components/CompanionChat";
import Reveal from "../components/Reveal";
import { useLang } from "../i18n/LangContext";
import { ABOUT } from "../i18n/about";
import "./About.css";

export default function About() {
  const t = ABOUT[useLang()];
  return (
    <section id="about" className="about">
      <div className="about-photo">
        <Reveal>
          <RuneFrame />
        </Reveal>
      </div>
      <div className="about-body">
        <Reveal delay={100}>
          <h2>{t.title}</h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="about-text">{t.body}</p>
        </Reveal>
        <Reveal delay={300}>
          <CompanionChat />
        </Reveal>
      </div>
    </section>
  );
}
