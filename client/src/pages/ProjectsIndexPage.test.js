import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DraftContentProvider } from '../content/ContentContext';
import content from '../content/defaultContent.json';
import ProjectsIndexPage, { groupProjects } from './ProjectsIndexPage';

const projects = content.projects.map((data) => ({ id: data.id, title: data.title, data }));

test('groups every project once using its category and keeps links to the real detail routes', () => {
  const groups = groupProjects(projects);
  expect(groups[0].projects.map((project) => project.id)).toEqual(['financial-sentiment', 'database-agent']);
  expect(groups.flatMap((group) => group.projects)).toHaveLength(projects.length);
  render(<MemoryRouter><DraftContentProvider content={content}><ProjectsIndexPage projects={projects} /></DraftContentProvider></MemoryRouter>);
  projects.forEach((project) => expect(screen.getByRole('link', { name: new RegExp(project.title) })).toHaveAttribute('href', `/projects/${project.id}`));
  expect(screen.getByRole('heading', { name: /AI & data/ })).toBeVisible();
  expect(screen.getByRole('heading', { name: /Product & platforms/ })).toBeVisible();
});

test('shelf arrows respond to scroll boundaries without hiding project links', () => {
  const { container } = render(<MemoryRouter><DraftContentProvider content={content}><ProjectsIndexPage projects={projects} /></DraftContentProvider></MemoryRouter>);
  const track = container.querySelector('#track-product-platforms');
  Object.defineProperties(track, { clientWidth: { value: 600 }, scrollWidth: { value: 1500 }, scrollLeft: { value: 0, writable: true } });
  fireEvent.scroll(track);
  const previous = screen.getByRole('button', { name: 'Previous projects in Product & platforms' });
  const next = screen.getByRole('button', { name: 'Next projects in Product & platforms' });
  expect(previous).toBeDisabled();
  expect(next).toBeEnabled();
  track.scrollLeft = 900;
  fireEvent.scroll(track);
  expect(previous).toBeEnabled();
  expect(next).toBeDisabled();
});
