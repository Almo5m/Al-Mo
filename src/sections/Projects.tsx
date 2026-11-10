import { useState } from "react";
import ProjectCard from "../components/ProjectCard";
import DemoWindow from "../components/DemoWindow";
import Reveal from "../components/Reveal";
import { useLang } from "../i18n/LangContext";
import { PROJECTS } from "../i18n/sections";
import { useContent } from "../lib/content";
import { track } from "../lib/track";
import "./Projects.css";

export default function Projects() {
  const lang = useLang();
  const t = PROJECTS[lang];
  const { projects } = useContent();
  const [demo, setDemo] = useState<{ title: string; url: string } | null>(null);

  if (!projects.length) return null;
  return (
    <section id="projects" className="section projects">
      <h2>{t.title}</h2>
      <div className="cards">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={i * 120}>
            <ProjectCard
              title={p.title[lang]}
              desc={p.desc[lang]}
              impact={p.impact[lang]}
              tags={p.tags}
              preview={p.preview}
              labels={t}
              canDemo={Boolean(p.demoUrl)}
              onDemo={() => {
                track("demo", p.id);
                setDemo({ title: p.title[lang], url: p.demoUrl });
              }}
            />
          </Reveal>
        ))}
      </div>
      {demo && <DemoWindow title={demo.title} url={demo.url} labels={t} onClose={() => setDemo(null)} />}
    </section>
  );
}
