import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DraftContentProvider } from '../content/ContentContext';
import content from '../content/defaultContent.json';
import { resolveLink } from '../content/assets';
import { highlightedProjects } from '../components/chat/PortfolioCards';
import ProjectsIndexPage, { groupProjects } from './ProjectsIndexPage';

const projects = content.projects.map((data) => ({ id: data.id, title: data.title, data }));

test('groups every project once using its category and keeps links to the real detail routes', () => {
  const groups = groupProjects(projects);
  expect(groups.map((group) => group.id)).toEqual(['product-platforms', 'ai-data']);
  expect(groups[1].projects.map((project) => project.id)).toEqual(['financial-sentiment', 'database-agent']);
  expect(groups.flatMap((group) => group.projects)).toHaveLength(projects.length);
  render(<MemoryRouter><DraftContentProvider content={content}><ProjectsIndexPage projects={projects} /></DraftContentProvider></MemoryRouter>);
  projects.forEach((project) => {
    const details = screen.getByRole('link', { name: `Explore project: ${project.title}` });
    expect(details).toHaveAttribute('href', `/projects/${project.id}`);
    expect(details).not.toHaveAttribute('target');
  });
  expect(screen.getByRole('heading', { name: /AI & data/ })).toBeVisible();
  expect(screen.getByRole('heading', { name: /Product & platforms/ })).toBeVisible();
});

test('shows direct verified destinations alongside case studies and official project logos', () => {
  const { container } = render(<MemoryRouter><DraftContentProvider content={content}><ProjectsIndexPage projects={projects} /></DraftContentProvider></MemoryRouter>);
  const destinations = [
    ['Inyo', 'https://joininyo.com'],
    ['MyDian Dashboard', 'https://mydian.co'],
    ['Full-Stack Tinder Application', 'https://github.com/Nrezhang/4-final-project-pet-tinder'],
    ['Resume Portfolio', 'https://github.com/Nrezhang/Resume_portfolio'],
    ['Airline Flight Booking Simulator', 'https://github.com/Nrezhang/AirlineSim'],
    ['LLaMA 3.1 Fine-Tuning', resolveLink('capstone')],
    ['Natural Language to Database Communication', content.projects.find((project) => project.id === 'database-agent').link],
  ];
  destinations.forEach(([name, href]) => {
    const link = screen.getByRole('link', { name: `${name} (opens in a new tab)` });
    expect(link.closest('h3')).not.toBeNull();
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
  expect(screen.getByRole('img', { name: 'MyDian logo' })).toHaveAttribute('src', 'mydian-logo.png');
  expect(screen.getByRole('img', { name: 'Inyo logo' })).toHaveAttribute('src', 'inyo-logo.png');
  expect(screen.getByRole('img', { name: 'Inyo logo' }).parentElement).toHaveClass('project-brand-inyo');
  expect(container.querySelector('a a')).toBeNull();
  expect(screen.queryByText('Visit website')).not.toBeInTheDocument();
  expect(screen.queryByText('View repository')).not.toBeInTheDocument();
  expect(screen.queryByText('Read capstone paper')).not.toBeInTheDocument();
  expect(screen.queryByText('View presentation')).not.toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(['Product & platforms', 'AI & data']);
});

test('projects without an external destination retain internal title and detail links', () => {
  const data = { ...content.projects.find((project) => project.id === 'inyo'), link: '' };
  render(<MemoryRouter><DraftContentProvider content={content}><ProjectsIndexPage projects={[{ id: data.id, title: data.title, data }]} /></DraftContentProvider></MemoryRouter>);
  const title = screen.getByRole('link', { name: 'Inyo', exact: true });
  expect(title).toHaveAttribute('href', '/projects/inyo');
  expect(title).not.toHaveAttribute('target');
  expect(screen.getByRole('link', { name: 'Explore project: Inyo' })).toHaveAttribute('href', '/projects/inyo');
});

test('featured projects never invent entries missing from the content', () => {
  expect(highlightedProjects([])).toEqual([]);
  expect(highlightedProjects(content.projects).map((project) => project.id)).toEqual(['inyo', 'financial-sentiment', 'mydian-dashboard']);
  expect(highlightedProjects(content.projects.filter((project) => project.id !== 'inyo')).map((project) => project.id)).toEqual(['financial-sentiment', 'mydian-dashboard']);
});

test('shelves use keyboard-accessible native scrolling without header arrow buttons', () => {
  const { container } = render(<MemoryRouter><DraftContentProvider content={content}><ProjectsIndexPage projects={projects} /></DraftContentProvider></MemoryRouter>);
  for (const title of ['Product & platforms', 'AI & data']) {
    expect(screen.getByRole('region', { name: `Scroll ${title} projects` })).toHaveAttribute('tabindex', '0');
  }
  expect(container.querySelector('.project-shelf-heading button')).toBeNull();
  expect(container.querySelectorAll('.project-shelf-card')).toHaveLength(projects.length);
});
