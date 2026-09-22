import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { DraftContentProvider } from '../../content/ContentContext';
import content from '../../content/defaultContent.json';
import EducationSection from './EducationSection';

test('keeps full leadership content visible after repeated school toggles and content refreshes', () => {
  const view = (data) => <DraftContentProvider content={data}><EducationSection /></DraftContentProvider>;
  const { rerender } = render(view(content));
  const school = screen.getByRole('button', { name: /New York University Shanghai.*BS in Computer Science/ });
  const descriptions = content.education[0].leadership.map((role) => role.description);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    fireEvent.click(school);
    expect(school).toHaveAttribute('aria-expanded', 'false');
    descriptions.forEach((text) => expect(screen.getByText(text)).not.toBeVisible());
    rerender(view({ ...content, profile: { ...content.profile } }));
    expect(school).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(school);
    expect(school).toHaveAttribute('aria-expanded', 'true');
    descriptions.forEach((text) => expect(screen.getByText(text)).toBeVisible());
  }
  expect(screen.queryByText(/GPA/)).not.toBeInTheDocument();
  content.education.forEach((school) => expect(screen.queryByText(school.period)).not.toBeInTheDocument());
  content.education[0].leadership.forEach((role) => expect(screen.queryByText(role.period)).not.toBeInTheDocument());
});

test('opening a school from the experience timeline expands its content', () => {
  render(<DraftContentProvider content={content}><EducationSection /></DraftContentProvider>);
  const school = screen.getByRole('button', { name: /Thomas Jefferson/ });
  expect(school).toHaveAttribute('aria-expanded', 'false');
  fireEvent.focus(document.getElementById('education-entry-tjhsst'));
  expect(school).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText(content.education[1].description)).toBeVisible();
});

test('coursework follows leadership and expands independently while preserving school toggle state', () => {
  render(<DraftContentProvider content={content}><EducationSection /></DraftContentProvider>);
  const school = screen.getByRole('button', { name: /New York University Shanghai.*BS in Computer Science/ });
  const coursework = screen.getByRole('button', { name: /View coursework for New York/ });
  const course = screen.getByText(content.education[0].coursework[0]);
  const leadership = screen.getByRole('region', { name: /New York.*leadership and campus/ });
  expect(leadership.compareDocumentPosition(coursework) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(course).not.toBeVisible();
  fireEvent.click(coursework);
  expect(course).toBeVisible();
  expect(leadership).toBeVisible();
  fireEvent.click(school);
  fireEvent.click(school);
  expect(course).toBeVisible();
  expect(leadership).toBeVisible();
  fireEvent.click(coursework);
  expect(course).not.toBeVisible();
  expect(leadership).toBeVisible();
});
