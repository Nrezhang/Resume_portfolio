import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowDownRight, FiArrowUpRight } from 'react-icons/fi';
import { ProjectThumbnail } from '../components/chat/PortfolioCards';
import { useContent } from '../content/ContentContext';
import { resolveLink } from '../content/assets';
import '../styles/editorial.css';

export function groupProjects(projects) {
  const ai = projects.filter((project) => /^(applied ai|ai\b|data\b|machine learning)/i.test(project.data?.category || project.summary || ''));
  return [{ id: 'product-platforms', title: 'Product & platforms', projects: projects.filter((project) => !ai.includes(project)) }, { id: 'ai-data', title: 'AI & data', projects: ai }].filter((group) => group.projects.length);
}

function ProjectShelf({ group, index }) {
  return <section className="project-shelf" aria-labelledby={`shelf-${group.id}`}>
    <div className="project-shelf-heading"><div className="project-shelf-label"><span className="project-shelf-number" aria-hidden="true">{String(index + 1).padStart(2, '0')} /</span><h2 id={`shelf-${group.id}`}>{group.title}</h2><span className="project-shelf-count">{group.projects.length} projects</span></div></div>
    <div className="project-shelf-track" id={`track-${group.id}`} role="region" aria-label={`Scroll ${group.title} projects`} tabIndex={0}>
      {group.projects.map((project) => <article className="project-shelf-card" key={project.id}>
        <Link className="project-shelf-preview" to={`/projects/${project.data?.id || project.id}`} aria-label={`Open project: ${project.title}`}><ProjectThumbnail project={project} /></Link>
        <div className="project-shelf-copy">
          <span className="project-index-category">{project.data?.category || 'Selected project'}</span>
          <h3>{project.data?.link
            ? <a href={resolveLink(project.data.link)} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} (opens in a new tab)`}><span>{project.title}</span><FiArrowUpRight aria-hidden="true" /></a>
            : <Link to={`/projects/${project.data?.id || project.id}`}><span>{project.title}</span><FiArrowUpRight aria-hidden="true" /></Link>}
          </h3>
          <p>{project.data?.description || project.summary}</p>
          <Link className="project-index-action" to={`/projects/${project.data?.id || project.id}`} aria-label={`${project.data ? 'Explore project' : 'Project preview'}: ${project.title}`}>{project.data ? 'Explore project' : 'Project preview'} <FiArrowUpRight aria-hidden="true" /></Link>
        </div>
      </article>)}
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
    <div className="projects-editorial-list">{groupProjects(projects).map((group, index) => <ProjectShelf key={group.id} group={group} index={index} />)}</div>
    <footer className="editorial-footer"><span>Behind the work.</span><nav aria-label="Explore more of my portfolio"><Link to="/experience">Experience <FiArrowUpRight aria-hidden="true" /></Link><Link to="/education">Education <FiArrowUpRight aria-hidden="true" /></Link><Link to="/resume">Resume <FiArrowUpRight aria-hidden="true" /></Link></nav></footer>
  </main>;
}
