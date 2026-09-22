import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowUpRight } from 'react-icons/fi';
import { useContent } from '../content/ContentContext';
import { resolveLink } from '../content/assets';
import { highlightedProjects, ProjectThumbnail } from '../components/chat/PortfolioCards';
import SkillTags from '../components/common/SkillTags';
import EducationSection from '../components/sections/EducationSection';
import ExperienceSection from '../components/sections/ExperienceSection';
import SkillsSection from '../components/sections/SkillsSection';
import ContactSection from '../components/sections/ContactSection';
import AboutIndex from '../components/sections/AboutIndex';
import EducationIndexPage from './EducationIndexPage';
import ProjectsIndexPage from './ProjectsIndexPage';
import { UtilityLinks } from './HomePage';

export default function PortfolioContentPage({ section }) {
  const { content } = useContent();
  const { projectId } = useParams();
  const highlighted = highlightedProjects(content.projects);
  if (section === 'education') return <EducationIndexPage />;
  if (section === 'experience') return <main className="chat-content-view experience-content"><ExperienceSection /><div className="chat-reading-width"><EducationSection /><UtilityLinks /></div></main>;
  if (section === 'skills' || section === 'contact') return <main className="chat-content-view chat-reading-width">{section === 'skills' ? <SkillsSection detailed /> : <ContactSection />}<UtilityLinks /></main>;
  if (section === 'projects') {
    const selected = content.projects.find((project) => project.id === projectId);
    const feature = highlighted.find((project) => project.id === projectId || project.data?.id === projectId);
    if (projectId) return <main className="chat-content-view chat-reading-width"><Link className="chat-back" to="/projects"><FiArrowLeft />All projects</Link><p className="chat-overline">Project details</p><h1>{feature?.title || selected?.title || 'Project not found'}</h1>{selected ? <><p className="chat-intro">{selected.description}</p><ProjectThumbnail project={{ id: selected.id, title: selected.title, data: selected }} /><p className="chat-overline">{selected.category} {selected.year && ` / ${selected.year}`}</p><h2>What I built</h2><p>{selected.impact}</p>{selected.highlights?.length > 0 && <ul className="chat-detail-list">{selected.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>}<SkillTags items={selected.skills || []} />{selected.link && <a className="chat-project-destination" href={resolveLink(selected.link)} target="_blank" rel="noreferrer">{selected.linkLabel || 'Open project'}<FiArrowUpRight /></a>}</> : feature ? <><p className="chat-intro">{feature.summary}</p><ProjectThumbnail project={feature} /><p>Project details are coming soon. This is a placeholder; a case study has not been added yet.</p></> : <p>This project is not available. Browse the projects to find another.</p>}<UtilityLinks /></main>;
    const projects = [...highlighted, ...content.projects.filter((project) => !highlighted.some((item) => item.data?.id === project.id)).map((project) => ({ id: project.id, title: project.title, summary: project.description, data: project }))];
    return <ProjectsIndexPage projects={projects} />;
  }
  return <AboutIndex />;
}
