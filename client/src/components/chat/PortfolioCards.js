import React from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiArrowUpRight } from 'react-icons/fi';
import { imageAssets, resolveExperienceLogo } from '../../content/assets';
import ContentImage from '../common/ContentImage';

const featured = [
  { id: 'inyo', title: 'Inyo', summary: 'AI-powered SMS matchmaking', match: (p) => p.id === 'inyo' },
  { id: 'financial-sentiment', title: 'LLaMA 3.1 Fine-Tuning', summary: 'QLoRA for financial language', match: (p) => p.id === 'financial-sentiment' },
  { id: 'mydian-dashboard', title: 'MyDian', summary: 'Manufacturer dashboard', match: (p) => /mydian/i.test(`${p.id} ${p.title}`) },
];
export function highlightedProjects(projects = []) {
  return featured.map(({ match, ...item }) => ({ ...item, data: projects.find(match) })).filter((project) => project.data);
}
export function ProjectThumbnail({ project }) {
  const image = project.data && imageAssets[project.data.image];
  const brandClass = ['mydian', 'inyo'].includes(project.data?.image) ? ` project-brand-${project.data.image}` : '';
  // The old generic portfolio screenshot is not a screenshot of these products.
  if (image && project.data.image !== 'portfolio') return <div className={`chat-project-image${brandClass}`}><img src={image} alt={project.data.imageAlt || project.title} /></div>;
  return <div className="chat-project-image thumbnail-placeholder"><FiGrid aria-hidden="true" /><span>Preview coming soon</span><div className="thumbnail-lines" aria-hidden="true"><i /><i /><i /></div></div>;
}
export function CompactProjectCard({ project }) {
  return <Link className="chat-project-card" to={`/projects/${project.data?.id || project.id}`}><ProjectThumbnail project={project} /><div className="chat-project-copy"><h3>{project.title}<FiArrowUpRight aria-hidden="true" /></h3><p>{project.summary || project.data?.description}</p></div></Link>;
}
export function CompactExperienceLogo({ experience }) {
  const logo = resolveExperienceLogo(experience);
  return <ContentImage media={logo} className="chat-experience-logo" imgClassName="chat-experience-logo-light" alt={`${experience.company || 'Company'} logo`} />;
}
