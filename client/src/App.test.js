import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';
import { portfolioApi } from './services/api';
import defaultContent from './content/defaultContent.json';

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
  expect(screen.getByRole('link', { name: 'Henry Zhang home' })).toHaveTextContent('Henry');
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
    if (label === 'Projects') expect(screen.getByRole('link', { name: /LearnFromAI/ })).toBeVisible();
    else {
      expect(screen.getByText('U.S. Department of the Treasury')).toBeVisible();
      expect(screen.getByAltText('U.S. Department of the Treasury logo')).toBeVisible();
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
  expect(within(log).getByText('Give me a quick introduction.')).toBeVisible();
  await waitFor(() => expect(within(log).getByText('Henry AI · Demo response')).toBeVisible());
  expect(within(log).getByText(/no live AI or personal knowledge retrieval is connected/)).toBeVisible();
  expect(screen.getByRole('textbox')).toHaveValue('Saved draft');
  fireEvent.submit(screen.getByRole('textbox').closest('form'));
  await waitFor(() => expect(within(log).getAllByText('Henry AI · Demo response')).toHaveLength(2));
  expect(screen.getByRole('textbox')).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
  expect(screen.getByRole('heading', { name: 'Henry Zhang', level: 1 })).toBeVisible();
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Recent conversations' })).getByRole('link'));
  expect(within(screen.getByRole('log')).getByText('Saved draft')).toBeVisible();
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
  fireEvent.click(screen.getByRole('button', { name: 'Dark', exact: true }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
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
  fireEvent.click(screen.getByRole('link', { name: /LearnFromAI/ }));
  await screen.findByRole('heading', { name: 'LearnFromAI', level: 1 });
  expect(screen.getByText(/This is a placeholder/)).toBeVisible();
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Pinned navigation' })).getByRole('link', { name: 'About me' }));
  await screen.findByRole('heading', { name: 'Henry Zhang', level: 1 });
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Pinned navigation' })).getByRole('link', { name: 'Resume' }));
  expect(screen.getByRole('link', { name: /Open PDF/ })).toHaveAttribute('href', expect.stringContaining('resume.pdf'));
});

test('the dedicated experience view retains the journey and work-history controls', async () => {
  window.history.replaceState({}, '', '/experience');
  render(<App />);
  const journey = await screen.findByRole('tab', { name: 'Journey' });
  expect(journey).toHaveAttribute('aria-selected', 'true');
  const progress = screen.getByRole('slider', { name: 'Experience progress' });
  fireEvent.change(progress, { target: { value: progress.max } });
  expect(progress).toHaveAttribute('aria-valuetext', expect.stringContaining('Present'));
  fireEvent.click(screen.getByRole('tab', { name: 'All experience' }));
  expect(screen.getByRole('tabpanel', { name: 'All experience' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Software Engineer' })).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('tab', { name: 'All experience' }), { key: 'ArrowLeft' });
  expect(screen.getByRole('tab', { name: 'Journey' })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Read full entry' }));
  expect(document.getElementById('education-entry-nyu-shanghai')).toHaveFocus();
});
