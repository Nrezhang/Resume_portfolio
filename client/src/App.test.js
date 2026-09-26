import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';
import { portfolioApi } from './services/api';
import defaultContent from './content/defaultContent.json';
import { documentAssets } from './content/assets';

afterEach(() => { jest.restoreAllMocks(); });

beforeEach(() => {
  global.fetch = undefined;
  sessionStorage.clear();
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  window.scrollTo = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
});

test('shows a removable revamp notice', () => {
  render(<App />);
  expect(screen.getByRole('status', { name: 'Site update notice' })).toHaveTextContent('This site is currently being revamped.');
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss site update notice' }));
  expect(screen.queryByRole('status', { name: 'Site update notice' })).not.toBeInTheDocument();
  expect(sessionStorage.getItem('henry-revamp-notice-dismissed')).toBeNull();
  expect(localStorage.getItem('henry-revamp-notice-dismissed')).toBe('true');
});

test('all homepage expansions preserve the draft and restore focus on close', async () => {
  render(<App />);
  expect(screen.getByRole('link', { name: 'Henry Zhang portfolio home' })).toHaveTextContent('Portfolio');
  const input = screen.getByRole('textbox', { name: 'Ask Henry' });
  fireEvent.change(input, { target: { value: 'A question in progress' } });
  fireEvent.click(screen.getByRole('button', { name: 'Ask about me' }));
  expect(screen.getByRole('region', { name: 'Ask about me suggestions' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Projects' })).not.toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('button', { name: 'Close suggestions' }), { key: 'Escape' });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Ask about me' })).toHaveFocus());
  for (const label of ['Projects', 'Experience']) {
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(screen.getByRole('link', { name: label === 'Projects' ? /View all projects/ : /View experience/ })).toBeVisible();
    if (label === 'Projects') expect(within(screen.getByRole('region', { name: 'Highlighted projects' })).getByRole('link', { name: /LLaMA 3.1 Fine-Tuning/ })).toBeVisible();
    else {
      expect(within(screen.getByRole('region', { name: 'Recent experience' })).getByText('U.S. Department of the Treasury')).toBeVisible();
      expect(within(screen.getByRole('region', { name: 'Recent experience' })).getByAltText('U.S. Department of the Treasury logo')).toBeVisible();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByRole('button', { name: label })).toHaveFocus());
  }
  fireEvent.click(screen.getByRole('button', { name: 'Beyond work' }));
  expect(screen.getByRole('button', { name: 'What’s your story?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Close suggestions' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Beyond work' })).toHaveFocus());
  expect(input).toHaveValue('A question in progress');
});

test('questions start demo conversations, retain suggestion drafts, and can be reopened', async () => {
  render(<App />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Saved draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Ask about me' }));
  fireEvent.click(screen.getByRole('button', { name: 'Give me a quick introduction.' }));
  const log = screen.getByRole('log', { name: 'Conversation' });
  expect(screen.queryByRole('region', { name: 'Selected work' })).not.toBeInTheDocument();
  expect(within(log).getByText('Give me a quick introduction.')).toBeVisible();
  await waitFor(() => expect(within(log).getByText('Henry AI · Demo response')).toBeVisible());
  expect(within(log).getByText(/no live AI or personal knowledge retrieval is connected/)).toBeVisible();
  expect(screen.getByRole('textbox')).toHaveValue('Saved draft');
  fireEvent.submit(screen.getByRole('textbox').closest('form'));
  await waitFor(() => expect(within(log).getAllByText('Henry AI · Demo response')).toHaveLength(2));
  expect(screen.getByRole('textbox')).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
  expect(screen.getByRole('heading', { name: 'Henry Zhang', level: 1 })).toBeVisible();
  expect(screen.getByRole('region', { name: 'Selected work' })).toBeVisible();
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Recent conversations' })).getByRole('link'));
  expect(within(screen.getByRole('log')).getByText('Saved draft')).toBeVisible();
});

test('Currently and Selected work are separate ordered sections without changing project highlights', async () => {
  render(<App />);
  const work = screen.getByRole('region', { name: 'Selected work' });
  expect(work).toBeVisible();
  for (const [title, id] of [['Inyo', 'inyo'], ['MyDian', 'mydian-dashboard']]) {
    expect(within(work).getByRole('link', { name: new RegExp(title) })).toHaveAttribute('href', `/projects/${id}`);
  }
  expect(within(work).getAllByRole('link').slice(1).map((link) => link.getAttribute('href'))).toEqual(['/projects/inyo', '/projects/mydian-dashboard']);
  expect(within(work).queryByText('LLaMA 3.1 Fine-Tuning')).not.toBeInTheDocument();
  expect(within(work).queryByAltText('U.S. Department of the Treasury logo')).not.toBeInTheDocument();
  const current = screen.getByRole('region', { name: 'Currently' });
  expect(within(current).getByAltText('U.S. Department of the Treasury logo')).toBeVisible();
  expect(within(current).getByRole('heading', { name: 'U.S. Department of the Treasury' })).toBeVisible();
  expect(within(current).getByText('Software Engineer')).toBeVisible();
  expect(current.compareDocumentPosition(work) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(current.parentElement).toBe(work.parentElement);
  expect(within(work).queryByText('LearnFromAI')).not.toBeInTheDocument();
  expect(within(work).getByRole('link', { name: /All projects/ })).toHaveAttribute('href', '/projects');
  expect(screen.getByRole('list', { name: 'Areas of focus' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Henry Zhang', level: 1 })).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Ask Henry' })).toBeVisible();
  ['Ask about me', 'Projects', 'Experience', 'Beyond work'].forEach((name) => expect(screen.getByRole('button', { name, exact: true })).toBeVisible());
  fireEvent.click(screen.getByRole('button', { name: 'Projects', exact: true }));
  const highlights = screen.getByRole('region', { name: 'Highlighted projects' });
  expect(within(highlights).getAllByRole('link').slice(1).map((link) => link.getAttribute('href'))).toEqual(['/projects/inyo', '/projects/financial-sentiment', '/projects/mydian-dashboard']);
  fireEvent.click(within(highlights).getByRole('link', { name: /LLaMA 3.1 Fine-Tuning/ }));
  await screen.findByRole('heading', { name: 'LLaMA 3.1 Fine-Tuning', level: 1 });
  expect(screen.getByText(/Adapted LLaMA 3.1 to financial news using QLoRA/)).toBeVisible();
});

test('selected Treasury work opens its expanded experience entry', async () => {
  render(<App />);
  const current = screen.getByRole('region', { name: 'Currently' });
  fireEvent.click(within(current).getByRole('link', { name: /Current role: Software Engineer at U.S. Department of the Treasury/ }));
  await waitFor(() => expect(document.getElementById('experience-detail-treasury')).toHaveFocus());
  expect(window.location.hash).toBe('#experience-detail-treasury');
  expect(screen.getByRole('button', { name: 'Hide details for Software Engineer at U.S. Department of the Treasury' })).toHaveAttribute('aria-expanded', 'true');
});

test('profile settings persist the theme, expose demo usage, and restore focus', async () => {
  render(<App />);
  expect(screen.getByAltText('Henry Zhang profile')).toHaveAttribute('src', 'profilepic.jpg');
  const trigger = screen.getByRole('button', { name: 'Open profile settings' });
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Light', exact: true }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expect(localStorage.getItem('portfolio-theme')).toBe('light');
  expect(screen.getByRole('region', { name: 'Profile settings' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Dark', exact: true }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(screen.getByRole('region', { name: 'Profile settings' })).toBeVisible();
  expect(screen.getByText('Not enabled')).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('button', { name: 'Close settings' }), { key: 'Escape' });
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole('region', { name: 'Profile settings' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Demo question' } });
  fireEvent.submit(screen.getByRole('textbox').closest('form'));
  await screen.findByText('Henry AI · Demo response');
  fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
  fireEvent.click(trigger);
  expect(screen.getByText('Messages sent').nextSibling).toHaveTextContent('1');
  expect(screen.getByText('AI tokens used').nextSibling).toHaveTextContent('0');
  fireEvent.click(screen.getByRole('link', { name: /Open admin/ }));
  await screen.findByRole('heading', { name: 'Portfolio studio' });
  expect(screen.getByText('Admin access is restricted to approved accounts.')).toBeVisible();
});

test('the admin studio previews profile edits and publishes through the existing API', async () => {
  sessionStorage.setItem('portfolio-admin-token', 'test-token');
  jest.spyOn(portfolioApi, 'getSession').mockResolvedValue({});
  const save = jest.spyOn(portfolioApi, 'saveContent').mockImplementation(async (content) => content);
  window.history.replaceState({}, '', '/admin');
  render(<App />);
  await screen.findByRole('heading', { name: 'Portfolio studio' });
  fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
  fireEvent.change(screen.getByLabelText('Homepage role (animated)'), { target: { value: 'Software builder' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply to preview' }));
  expect(screen.getByText('Unpublished changes')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Publish changes' }));
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ profile: expect.objectContaining({ heroRole: 'Software builder' }) }), 'test-token'));
  await screen.findByText('Changes published.');
  const sections = screen.getByRole('navigation', { name: 'Editor sections' });
  fireEvent.click(within(sections).getByRole('button', { name: 'Projects' }));
  expect(screen.getByRole('button', { name: 'Add project' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Edit ' + defaultContent.projects[0].title })).toBeVisible();
  fireEvent.click(within(sections).getByRole('button', { name: 'AI usage' }));
  expect(screen.getByText('Not connected')).toBeVisible();
  expect(screen.getByText(/do not enforce a billing limit yet/)).toBeVisible();
});

test('pinned navigation opens dedicated views and project details', async () => {
  render(<App />);
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Pinned navigation' })).getByRole('link', { name: 'Projects' }));
  await screen.findByRole('heading', { name: 'Projects', level: 1 });
  fireEvent.click(screen.getByRole('link', { name: 'Explore project: LLaMA 3.1 Fine-Tuning' }));
  await screen.findByRole('heading', { name: 'LLaMA 3.1 Fine-Tuning', level: 1 });
  expect(screen.getByRole('link', { name: /Read capstone paper/ })).toHaveAttribute('target', '_blank');
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Pinned navigation' })).getByRole('link', { name: 'About me' }));
  await screen.findByRole('heading', { name: "I'm Henry Zhang.", level: 1 });
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Pinned navigation' })).getByRole('link', { name: 'Resume' }));
  expect(screen.getByRole('link', { name: /Open PDF/ })).toHaveAttribute('href', documentAssets.resume);
});

test('the dedicated experience view retains the journey and work-history controls', async () => {
  window.history.replaceState({}, '', '/experience');
  render(<App />);
  const journey = await screen.findByRole('tab', { name: 'Journey' });
  expect(screen.getByRole('tab', { name: 'All experience' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('navigation', { name: 'Career branch index' })).toBeVisible();
  expect(document.getElementById('education')).not.toBeInTheDocument();
  const pinned = within(screen.getByRole('navigation', { name: 'Pinned navigation' })).getAllByRole('link');
  expect(pinned.map((link) => link.textContent)).toEqual(['About me', 'Projects', 'Experience', 'Education', 'Resume']);
  expect(pinned[3]).toHaveAttribute('href', '/education');
  fireEvent.click(journey);
  expect(screen.getByRole('tab', { name: 'Journey' })).toHaveAttribute('aria-selected', 'true');
  const progress = screen.getByRole('slider', { name: 'Experience progress' });
  expect(progress).toHaveAttribute('aria-valuetext', expect.stringContaining('Present'));
  fireEvent.change(progress, { target: { value: progress.max } });
  expect(progress).toHaveAttribute('aria-valuetext', expect.stringContaining('August 2021'));
  fireEvent.click(screen.getByRole('tab', { name: 'All experience' }));
  expect(screen.getByRole('tabpanel', { name: 'All experience' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Software Engineer' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  expect(document.querySelector('.branch-event-row[aria-pressed="true"]')).toHaveFocus();
  expect(screen.getByRole('tab', { name: 'Journey' })).toHaveAttribute('aria-selected', 'true');
  fireEvent.click(screen.getByRole('button', { name: /New York University Shanghai: Started at NYU/ }));
  await waitFor(() => expect(screen.getAllByRole('button', { name: 'Read full entry' })).toHaveLength(1));
  fireEvent.click(screen.getByRole('button', { name: 'Read full entry' }));
  await waitFor(() => expect(document.getElementById('education-entry-nyu-shanghai')).toHaveFocus());
  expect(window.location.pathname).toBe('/education');
  expect(window.location.hash).toBe('#education-entry-nyu-shanghai');
});

test('a work detail URL opens its entry, and Journey links campus roles to education details', async () => {
  window.history.replaceState({}, '', '/experience#experience-detail-microsoft');
  render(<App />);
  const detail = await screen.findByRole('button', { name: /Hide details for AI Software Engineering Intern at Microsoft/ });
  expect(detail).toHaveAttribute('aria-expanded', 'true');
  await waitFor(() => expect(document.getElementById('experience-detail-microsoft')).toHaveFocus());
  expect(document.getElementById('experience-more-treasury')).toHaveAttribute('hidden');
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  fireEvent.click(screen.getByRole('button', { name: /Tech@NYU: Tech Trek Tutor/ }));
  await waitFor(() => expect(screen.getAllByRole('button', { name: 'Read full entry' })).toHaveLength(1));
  fireEvent.click(screen.getByRole('button', { name: 'Read full entry' }));
  await waitFor(() => expect(document.getElementById('leadership-entry-tech-trek')).toHaveFocus());
  expect(window.location.pathname).toBe('/education');
  expect(window.location.hash).toBe('#leadership-entry-tech-trek');
});
