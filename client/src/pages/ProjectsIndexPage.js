import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowDownRight, FiArrowUpRight, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { ProjectThumbnail } from '../components/chat/PortfolioCards';
import { useContent } from '../content/ContentContext';
import '../styles/editorial.css';

export function groupProjects(projects) {
  const ai = projects.filter((project) => /^(applied ai|ai\b|data\b|machine learning)/i.test(project.data?.category || project.summary || ''));
  return [{ id: 'ai-data', title: 'AI & data', projects: ai }, { id: 'product-platforms', title: 'Product & platforms', projects: projects.filter((project) => !ai.includes(project)) }].filter((group) => group.projects.length);
}

function ProjectShelf({ group }) {
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const element = track.current;
    const update = () => setEdges({ start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(element);
    return () => { element.removeEventListener('scroll', update); observer?.disconnect(); };
  }, [group.projects.length]);
  const move = (direction) => {
    const element = track.current;
    const first = element.firstElementChild;
    const step = first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(element).columnGap || 0) : element.clientWidth;
    element.scrollBy({ left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  return <section className="project-shelf" aria-labelledby={`shelf-${group.id}`}>
    <div className="project-shelf-heading"><h2 id={`shelf-${group.id}`}>{group.title} <span>{group.projects.length}</span></h2><div className="project-shelf-controls">
      <button type="button" aria-label={`Previous projects in ${group.title}`} aria-controls={`track-${group.id}`} disabled={edges.start} onClick={() => move(-1)}><FiArrowLeft aria-hidden="true" /></button>
      <button type="button" aria-label={`Next projects in ${group.title}`} aria-controls={`track-${group.id}`} disabled={edges.end} onClick={() => move(1)}><FiArrowRight aria-hidden="true" /></button>
    </div></div>
    <div className="project-shelf-track" ref={track} id={`track-${group.id}`}>
      {group.projects.map((project) => <Link className="project-shelf-card" key={project.id} to={`/projects/${project.data?.id || project.id}`}>
        <ProjectThumbnail project={project} />
        <div className="project-shelf-copy"><span className="project-index-category">{project.data?.category || 'Selected project'}</span><h3><span>{project.title}</span><FiArrowUpRight aria-hidden="true" /></h3><p>{project.data?.description || project.summary}</p><span className="project-index-action">{project.data ? 'Explore project' : 'Project preview'} <FiArrowUpRight aria-hidden="true" /></span></div>
      </Link>)}
    </div>
  </section>;
}

export default function ProjectsIndexPage({ projects }) {
  const { content } = useContent();
  return <main className="projects-index-page" aria-labelledby="projects-page-heading">
    <div className="editorial-meta"><span>Projects / {content.profile.name}</span><span>Portfolio</span></div>
    <header className="editorial-hero">
      <h1 id="projects-page-heading">Projects <FiArrowDownRight aria-hidden="true" /></h1><p>Applied AI, full-stack systems, and product-minded engineering.</p>
    </header>
    <div className="projects-editorial-list">{groupProjects(projects).map((group) => <ProjectShelf key={group.id} group={group} />)}</div>
    <footer className="editorial-footer"><span>Behind the work.</span><nav aria-label="Explore more of my portfolio"><Link to="/experience">Experience <FiArrowUpRight aria-hidden="true" /></Link><Link to="/education">Education <FiArrowUpRight aria-hidden="true" /></Link><Link to="/resume">Resume <FiArrowUpRight aria-hidden="true" /></Link></nav></footer>
  </main>;
}
