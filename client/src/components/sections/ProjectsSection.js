import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiExternalLink } from 'react-icons/fi';
import { imageAssets, resolveLink } from '../../content/assets';
import { useContent } from '../../content/ContentContext';
import SectionHeading from '../common/SectionHeading';
import SkillTags from '../common/SkillTags';
import Card from '../ui/Card';
import { AddControl, ItemControls } from '../editor/InlineEditorControls';

export function ProjectCard({ project, index = 0, editor }) {
  return (
    <Card className="project-card" index={index} whileHover={{ y: -6 }}>
      {editor && <ItemControls label={project.title || 'project'} onEdit={editor.onEdit} onDelete={editor.onDelete} />}
      <a className="project-image" href={resolveLink(project.link)} target="_blank" rel="noreferrer" aria-label={`${project.linkLabel}: ${project.title}`}>
        <img src={imageAssets[project.image]} alt={project.imageAlt} />
        <span><FiExternalLink /></span>
      </a>
      <div className="project-content">
        <div className="project-meta"><p className="card-kicker">{project.category}</p><span>{project.year}</span></div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <p className="project-impact"><b>What I built:</b> {project.impact}</p>
        <SkillTags items={project.skills} />
        <a className="card-link" href={resolveLink(project.link)} target="_blank" rel="noreferrer">{project.linkLabel} <FiArrowUpRight /></a>
      </div>
    </Card>
  );
}

export default function ProjectsSection({ limit, editor }) {
  const { content } = useContent();
  const projects = limit ? content.projects.slice(0, limit) : content.projects;

  return (
    <section id="projects" className="content-section" aria-labelledby="projects-heading">
      <SectionHeading id="projects-heading" eyebrow="Selected work" title="Selected projects." description="Applied AI, full-stack systems, and product-minded engineering. Each project pairs the problem with what I built and the tools I used." action={editor ? <AddControl label="Add project" onClick={editor.onAdd} /> : limit ? <Link className="text-link" to="/projects">All projects <FiArrowUpRight /></Link> : null} />
      <div className="projects-grid">
        {projects.map((project, index) => <ProjectCard project={project} index={index} key={project.id} editor={editor ? { onEdit: () => editor.onEdit(index), onDelete: () => editor.onDelete(index) } : null} />)}
      </div>
    </section>
  );
}
