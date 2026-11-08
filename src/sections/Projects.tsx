import { useState } from "react";
import ProjectCard from "../components/ProjectCard";
import DemoWindow from "../components/DemoWindow";
import Reveal from "../components/Reveal";
import { useLang } from "../i18n/LangContext";
import { PROJECTS, PROJECTS_DATA } from "../i18n/sections";
import { track } from "../lib/track";
import "./Projects.css";

export default function Projects() {
  const t = PROJECTS[useLang()];
  const [demo, setDemo] = useState<{ title: string; url: string } | null>(null);

  return (
    <section id="projects" className="section projects">
      <h2>{t.title}</h2>
      <div className="cards">
        {PROJECTS_DATA.map((p, i) => (
          <Reveal key={p.id} delay={i * 120}>
            <ProjectCard
              title={t.items[i].title}
              desc={t.items[i].desc}
              impact={t.items[i].impact}
              tags={p.tags}
              preview={p.preview}
              labels={t}
              canDemo={Boolean(p.demoUrl)}
              onDemo={() => {
                track("demo", p.id);
                setDemo({ title: t.items[i].title, url: p.demoUrl });
              }}
            />
          </Reveal>
        ))}
      </div>
      {demo && <DemoWindow title={demo.title} url={demo.url} labels={t} onClose={() => setDemo(null)} />}
    </section>
  );
}
