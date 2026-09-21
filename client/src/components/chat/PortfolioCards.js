import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiGrid, FiArrowUpRight } from 'react-icons/fi';
import { imageAssets } from '../../content/assets';

const featured = [
  { id: 'learnfromai', title: 'LearnFromAI', summary: 'AI learning companion', match: (p) => /learnfromai/i.test(`${p.id} ${p.title}`) },
  { id: 'financial-sentiment', title: 'Financial Sentiment', summary: 'Financial headline analysis', match: (p) => p.id === 'financial-sentiment' },
  { id: 'mydian-dashboard', title: 'MyDian', summary: 'Manufacturer dashboard', match: (p) => /mydian/i.test(`${p.id} ${p.title}`) },
];
export function highlightedProjects(projects = []) {
  return featured.map(({ match, ...item }) => ({ ...item, data: projects.find(match) }));
}
export function ProjectThumbnail({ project }) {
  const image = project.data && imageAssets[project.data.image];
  // The old generic portfolio screenshot is not a screenshot of these products.
  if (image && project.data.image !== 'portfolio') return <div className="chat-project-image"><img src={image} alt={project.data.imageAlt || project.title} /></div>;
  const Icon = project.id === 'learnfromai' ? FiBookOpen : FiGrid;
  return <div className={`chat-project-image thumbnail-placeholder ${project.id === 'learnfromai' ? 'thumbnail-learning' : ''}`}><Icon aria-hidden="true" /><span>Preview coming soon</span><div className="thumbnail-lines" aria-hidden="true"><i /><i /><i /></div></div>;
}
export function CompactProjectCard({ project }) {
  return <Link className="chat-project-card" to={`/projects/${project.data?.id || project.id}`}><ProjectThumbnail project={project} /><div className="chat-project-copy"><h3>{project.title}<FiArrowUpRight aria-hidden="true" /></h3><p>{project.summary || project.data?.description}</p></div></Link>;
}
