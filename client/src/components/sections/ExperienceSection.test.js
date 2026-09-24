import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { DraftContentProvider } from '../../content/ContentContext';
import content from '../../content/defaultContent.json';
import ExperienceSection from './ExperienceSection';
import { buildTimeline } from '../timeline/ExperienceTimeline';
import { animate, useReducedMotion } from 'motion/react';

jest.mock('../timeline/TimelineGlobe', () => ({ location }) => <div data-testid="globe-location">{location.label}</div>);
jest.mock('motion/react', () => ({ ...jest.requireActual('motion/react'), animate: jest.fn(), useReducedMotion: jest.fn(() => false) }));

beforeEach(() => {
  window.scrollTo = jest.fn();
  Element.prototype.scrollTo = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
  useReducedMotion.mockReturnValue(false);
  animate.mockReset().mockImplementation((from, to, options) => {
    options.onUpdate(to);
    return { stop: jest.fn() };
  });
});
afterEach(() => jest.restoreAllMocks());

const view = (data = content, props = {}) => <MemoryRouter><DraftContentProvider content={data}><ExperienceSection {...props} /></DraftContentProvider></MemoryRouter>;

test('Jika.io keeps Remote displayed while its globe pin is in Tel Aviv', () => {
  const jika = buildTimeline(content.experience, content.education).items.find(item => item.id === 'jika');
  expect(jika.locationLabel).toBe('Remote');
  expect(jika.locationData).toEqual({ lat: 32.0853, lon: 34.7818, label: 'Tel Aviv, Israel', countryCodes: ['IL'], pins: [{ lat: 32.0853, lon: 34.7818 }] });
});

test('All experience is the default with a working vertical index and preserved expandable entries', () => {
  const { container } = render(view());
  expect(screen.getByRole('tab', { name: 'All experience' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tabpanel', { name: 'All experience' })).toBeVisible();
  expect(screen.queryByTestId('globe-location')).not.toBeInTheDocument();
  const nav = screen.getByRole('navigation', { name: 'Career branch index' });
  const medidata = within(nav).getByRole('button', { name: /Medidata Solutions/ });
  const target = document.getElementById('experience-detail-medidata');
  target.scrollIntoView = jest.fn();
  fireEvent.click(medidata);
  expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  expect(medidata).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('tab', { name: 'All experience' })).toHaveAttribute('aria-selected', 'true');
  expect(container.querySelector('.experience-details-index')).toContainElement(nav);
  expect(within(target).getByRole('button', { name: /Hide details/ })).toHaveAttribute('aria-expanded', 'true');
  expect(document.getElementById('experience-more-medidata')).not.toHaveAttribute('hidden');
  expect(container.querySelectorAll('.branch-event-row[aria-pressed="true"]')).toHaveLength(1);
});

test('arrow navigation opens the next entry, closes the previous one, and scrolls after layout updates', () => {
  render(view());
  const firstBody = document.getElementById('experience-more-treasury');
  const nextBody = document.getElementById('experience-more-trianz');
  expect(firstBody).not.toHaveAttribute('hidden');
  expect(nextBody).toHaveAttribute('hidden');
  const next = document.getElementById('experience-detail-trianz');
  next.scrollIntoView = jest.fn(() => {
    expect(firstBody).toHaveAttribute('hidden');
    expect(nextBody).not.toHaveAttribute('hidden');
  });
  fireEvent.keyDown(document.body, { key: 'ArrowRight' });
  expect(next.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  expect(screen.getByRole('button', { name: /Trianz Inc.: Associate Project Manager/ })).toHaveFocus();
  expect(screen.getByRole('tab', { name: 'All experience' })).toHaveAttribute('aria-selected', 'true');
  fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' });
  expect(firstBody).not.toHaveAttribute('hidden');
  expect(nextBody).toHaveAttribute('hidden');
});

test('All experience arrows visit work roles only, skipping school and campus leadership', () => {
  const { container } = render(view());
  const rows = [...container.querySelectorAll('.branch-event-row')];
  expect(rows.map((row) => row.dataset.timelineId)).toEqual([
    'treasury', 'trianz', 'nyu-shanghai-graduation', 'medidata', 'tech-trek',
    'microsoft', 'tamid', 'jika', 'nyu-shanghai-start',
  ]);
  const roles = ['treasury', 'trianz', 'medidata', 'microsoft', 'jika'];
  for (let index = 1; index < roles.length; index += 1) {
    fireEvent.keyDown(index === 1 ? document.body : document.activeElement, { key: 'ArrowRight' });
    expect(rows.find((row) => row.dataset.timelineId === roles[index])).toHaveAttribute('aria-pressed', 'true');
    expect(document.getElementById(`experience-more-${roles[index]}`)).not.toHaveAttribute('hidden');
    expect(document.getElementById(`experience-more-${roles[index - 1]}`)).toHaveAttribute('hidden');
    expect(container.querySelectorAll('.branch-event-row')).toHaveLength(9);
  }
  fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
  expect(rows.find((row) => row.dataset.timelineId === 'jika')).toHaveAttribute('aria-pressed', 'true');
  for (let index = roles.length - 2; index >= 0; index -= 1) {
    fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' });
    expect(rows.find((row) => row.dataset.timelineId === roles[index])).toHaveAttribute('aria-pressed', 'true');
  }
});

test('both views preserve identical history geometry while Journey arrows visit every chapter', () => {
  const { container } = render(view());
  const graphPaths = () => [...container.querySelectorAll('.branch-time-graph path')].map((path) => path.getAttribute('d'));
  const graph = graphPaths();
  const rowsBefore = [...container.querySelectorAll('.branch-event-row')].map((row) => [row.dataset.timelineId, row.style.top]);
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  expect(graphPaths()).toEqual(graph);
  const rows = [...container.querySelectorAll('.branch-event-row')];
  expect(rows.map((row) => [row.dataset.timelineId, row.style.top])).toEqual(rowsBefore);
  for (let index = 1; index < rows.length; index += 1) {
    fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
    expect(rows[index]).toHaveAttribute('aria-pressed', 'true');
    expect(rows[index]).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Journey' })).toHaveAttribute('aria-selected', 'true');
  }
});

test('details arrows work from the active view tab without switching views and ignore editable or outside controls', () => {
  const { container } = render(<><button>Outside</button><input aria-label="Outside text" />{view()}</>);
  const first = screen.getByRole('button', { name: /Treasury: Software Engineer/ });
  const insideInput = document.createElement('input');
  container.querySelector('.experience-copy').append(insideInput);
  [screen.getByRole('button', { name: 'Outside' }), screen.getByRole('textbox', { name: 'Outside text' }), insideInput].forEach((node) => {
    fireEvent.keyDown(node, { key: 'ArrowRight' });
    expect(first).toHaveAttribute('aria-pressed', 'true');
  });
  fireEvent.keyDown(document.body, { key: 'ArrowDown', ctrlKey: true });
  expect(first).toHaveAttribute('aria-pressed', 'true');
  fireEvent.keyDown(screen.getByRole('tab', { name: 'All experience' }), { key: 'ArrowDown' });
  expect(screen.getByRole('button', { name: /Trianz Inc.: Associate Project Manager/ })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('tab', { name: 'All experience' })).toHaveAttribute('aria-selected', 'true');
  insideInput.remove();
});

test('the details timeline follows the role being read during page scrolling', async () => {
  render(view());
  content.experience.forEach((item, index) => {
    document.getElementById(`experience-detail-${item.id}`).getBoundingClientRect = () => ({
      top: item.id === 'trianz' ? 110 : 500 + index * 300, height: 250,
    });
  });
  fireEvent.scroll(window);
  await waitFor(() => expect(screen.getByRole('button', { name: /Trianz Inc.: Associate Project Manager/ })).toHaveAttribute('aria-pressed', 'true'));
  expect(screen.getByRole('tab', { name: 'All experience' })).toHaveAttribute('aria-selected', 'true');
});

test('work details toggle independently, retain focus and survive view changes and content refreshes', () => {
  const { rerender } = render(view());
  fireEvent.click(screen.getByRole('tab', { name: 'All experience' }));
  const [first, second] = content.experience;
  fireEvent.click(screen.getByRole('button', { name: `Hide details for ${first.role} at ${first.company}` }));
  const toggle = screen.getByRole('button', { name: `Show details for ${first.role} at ${first.company}` });
  const body = document.getElementById(`experience-more-${first.id}`);
  expect(body).toHaveAttribute('hidden');
  toggle.focus();
  fireEvent.click(toggle);
  expect(toggle).toHaveFocus();
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(body).not.toHaveAttribute('hidden');
  first.highlights.forEach((point) => expect(within(body).getByText(point)).toBeInTheDocument());
  expect(document.getElementById(`experience-more-${second.id}`)).toHaveAttribute('hidden');
  rerender(view({ ...content, profile: { ...content.profile } }));
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  fireEvent.click(screen.getByRole('tab', { name: 'All experience' }));
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(toggle);
  expect(body).toHaveAttribute('hidden');
  fireEvent.click(toggle);
  expect(body).not.toHaveAttribute('hidden');
});

test('branch selection updates the globe and read full entry opens and focuses the matching work details', async () => {
  render(view());
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  const role = content.experience.find((item) => item.id === 'medidata');
  const branch = within(screen.getByRole('navigation', { name: 'Career branch index' })).getByRole('button', { name: `${role.company}: ${role.role}, ${role.period}` });
  fireEvent.click(branch);
  expect(branch).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('globe-location')).toHaveTextContent('New York City');
  await waitFor(() => expect(screen.getAllByRole('button', { name: 'Read full entry' })).toHaveLength(1));
  fireEvent.click(screen.getByRole('button', { name: 'Read full entry' }));
  const entry = document.getElementById('experience-detail-medidata');
  expect(entry).toHaveFocus();
  expect(within(entry).getByRole('button', { name: /Hide details/ })).toHaveAttribute('aria-expanded', 'true');
  expect(document.getElementById('experience-more-medidata')).not.toHaveAttribute('hidden');
});

test('the vertical branch index supports down, home, and end keys and keeps education milestones', () => {
  render(view());
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  const branches = within(screen.getByRole('navigation', { name: 'Career branch index' })).getAllByRole('button');
  expect(branches[0]).toHaveAccessibleName(/Treasury: Software Engineer/);
  expect(branches[branches.length - 1]).toHaveAccessibleName(/Started at NYU/);
  expect(branches.some((button) => /Graduated from NYU/.test(button.getAttribute('aria-label')))).toBe(true);
  fireEvent.keyDown(branches[0], { key: 'ArrowDown' });
  expect(branches[1]).toHaveAttribute('aria-pressed', 'true');
  fireEvent.keyDown(branches[1], { key: 'End' });
  expect(branches[branches.length - 1]).toHaveAttribute('aria-pressed', 'true');
  fireEvent.keyDown(branches[branches.length - 1], { key: 'Home' });
  expect(branches[0]).toHaveAttribute('aria-pressed', 'true');
});

test('theme-aware logo assets stay mounted when details are collapsed and expanded', () => {
  render(view());
  fireEvent.click(screen.getByRole('tab', { name: 'All experience' }));
  const entry = document.getElementById('experience-detail-trianz');
  const light = entry.querySelector('.experience-logo-light');
  const dark = entry.querySelector('.experience-logo-dark');
  expect(light).toHaveAttribute('src', 'trianz.svg');
  expect(dark).toHaveAttribute('src', 'trianz-dark.svg');
  fireEvent.click(within(entry).getByRole('button', { name: /Show details/ }));
  expect(entry.querySelector('.experience-logo-light')).toBe(light);
  expect(entry.querySelector('.experience-logo-dark')).toBe(dark);
});

test('returning to Journey focuses the chapter and Right Arrow advances instead of switching views', () => {
  render(view());
  fireEvent.click(screen.getByRole('tab', { name: 'All experience' }));
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  const rows = within(screen.getByRole('navigation', { name: 'Career branch index' })).getAllByRole('button');
  expect(rows[0]).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
  expect(rows[1]).toHaveAttribute('aria-pressed', 'true');
  expect(rows[1]).toHaveFocus();
  expect(screen.getByRole('tab', { name: 'Journey' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: 'All experience' })).toHaveAttribute('aria-selected', 'false');
});

test('horizontal arrows on the focused Journey tab navigate chapters, not views', () => {
  const { container } = render(view());
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  container.querySelector('.journey').getBoundingClientRect = () => ({ top: 0, bottom: 800 });
  const tab = screen.getByRole('tab', { name: 'Journey' });
  const rows = within(screen.getByRole('navigation', { name: 'Career branch index' })).getAllByRole('button');
  tab.focus();
  fireEvent.keyDown(tab, { key: 'ArrowRight' });
  expect(rows[1]).toHaveAttribute('aria-pressed', 'true');
  expect(tab).toHaveAttribute('aria-selected', 'true');
  fireEvent.keyDown(tab, { key: 'ArrowLeft' });
  expect(rows[0]).toHaveAttribute('aria-pressed', 'true');
  expect(tab).toHaveAttribute('aria-selected', 'true');
  fireEvent.click(screen.getByRole('tab', { name: 'All experience' }));
  expect(screen.getByRole('tab', { name: 'All experience' })).toHaveAttribute('aria-selected', 'true');
});

test('chapter navigation smoothly aligns selections near the top, including the last entry', () => {
  jest.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function () {
    return this.classList.contains('branch-index-chart') ? 400 : 0;
  });
  const { container } = render(view());
  const chart = container.querySelector('.branch-index-chart');
  const rows = [...container.querySelectorAll('.branch-event-row.branch-index-work')];
  const expectedTop = (row) => Math.max(0, parseFloat(row.style.top) - 32);
  expect(chart.scrollTop).toBe(expectedTop(rows[0]));
  expect(animate).not.toHaveBeenCalled();
  fireEvent.keyDown(rows[0], { key: 'ArrowRight' });
  expect(animate).toHaveBeenLastCalledWith(expectedTop(rows[0]), expectedTop(rows[1]), expect.objectContaining({ duration: 1.1, ease: [0.4, 0, 0.2, 1] }));
  expect(chart.scrollTop).toBe(expectedTop(rows[1]));
  fireEvent.keyDown(rows[1], { key: 'ArrowRight' });
  expect(chart.scrollTop).toBe(expectedTop(rows[2]));
  fireEvent.keyDown(rows[2], { key: 'End' });
  const last = rows[rows.length - 1];
  expect(last).toHaveAttribute('aria-pressed', 'true');
  expect(chart.scrollTop).toBe(expectedTop(last));
  const innerHeight = parseFloat(container.querySelector('.branch-index-chart-inner').style.height);
  expect(innerHeight - chart.clientHeight).toBeGreaterThanOrEqual(expectedTop(last));
  // Extra scroll room must not stretch the date-scaled SVG.
  expect(parseFloat(container.querySelector('.branch-time-graph').style.height)).toBeLessThan(innerHeight);
  fireEvent.keyDown(last, { key: 'Home' });
  expect(chart.scrollTop).toBe(expectedTop(rows[0]));
});

test('scroll animation is interrupted by manual input, replaced on selection, and cleaned up on unmount', () => {
  const { container, unmount } = render(view());
  const chart = container.querySelector('.branch-index-chart');
  const rows = [...container.querySelectorAll('.branch-event-row.branch-index-work')];
  fireEvent.keyDown(rows[0], { key: 'ArrowRight' });
  const first = animate.mock.results[0].value;
  fireEvent.wheel(chart, { deltaY: 40 });
  expect(first.stop).toHaveBeenCalled();
  chart.scrollTop = 250;
  fireEvent.keyDown(rows[1], { key: 'ArrowRight' });
  expect(animate.mock.calls[1][0]).toBe(250);
  const second = animate.mock.results[1].value;
  fireEvent.touchStart(chart);
  expect(second.stop).toHaveBeenCalled();
  fireEvent.keyDown(rows[2], { key: 'ArrowRight' });
  const third = animate.mock.results[2].value;
  unmount();
  expect(third.stop).toHaveBeenCalled();
});

test('reduced-motion preference keeps near-top positioning without animated scrolling', () => {
  useReducedMotion.mockReturnValue(true);
  const { container } = render(view());
  const rows = [...container.querySelectorAll('.branch-event-row')];
  fireEvent.keyDown(rows[0], { key: 'ArrowRight' });
  expect(container.querySelector('.branch-index-chart').scrollTop).toBe(Math.max(0, parseFloat(rows[1].style.top) - 32));
  expect(animate).not.toHaveBeenCalled();
});

test('Journey shortcuts respect editable fields, outside focus, modifiers, and native range controls', () => {
  const { container } = render(<><button>Outside control</button>{view()}</>);
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  const journey = container.querySelector('.journey');
  journey.getBoundingClientRect = () => ({ top: 0, bottom: 800 });
  const first = within(screen.getByRole('navigation', { name: 'Career branch index' })).getAllByRole('button')[0];
  const input = document.createElement('input');
  const editable = document.createElement('div');
  editable.setAttribute('contenteditable', 'true');
  journey.append(input, editable);
  [input, editable, screen.getByRole('button', { name: 'Outside control' }), screen.getByRole('slider', { name: 'Experience progress' })].forEach((element) => {
    fireEvent.keyDown(element, { key: 'ArrowRight' });
    expect(first).toHaveAttribute('aria-pressed', 'true');
  });
  fireEvent.keyDown(first, { key: 'ArrowRight', ctrlKey: true });
  expect(first).toHaveAttribute('aria-pressed', 'true');
  fireEvent.keyDown(document.body, { key: 'ArrowRight', shiftKey: true });
  expect(first).toHaveAttribute('aria-pressed', 'true');
  input.remove();
  editable.remove();
});

test('date-based branches preserve concurrent ranges and the continuous education span', () => {
  const { container } = render(view());
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  const tamid = container.querySelector('[data-branch-id="tamid"]');
  const jika = container.querySelector('[data-branch-id="jika"]');
  const school = container.querySelector('[data-branch-id="nyu-shanghai"]');
  const medidata = container.querySelector('[data-branch-id="medidata"]');
  expect(tamid.dataset.start).toBe(jika.dataset.start);
  expect(tamid.dataset.end).toBe(jika.dataset.end);
  expect(tamid.dataset.lane).not.toBe(jika.dataset.lane);
  const endpoints = (element) => [Number(element.dataset.endY), Number(element.dataset.startY)];
  expect(Math.max(endpoints(tamid)[0], endpoints(jika)[0])).toBeLessThan(Math.min(endpoints(tamid)[1], endpoints(jika)[1]));
  expect(endpoints(school)[0]).toBeLessThan(endpoints(jika)[0]);
  expect(endpoints(school)[1]).toBeGreaterThan(endpoints(medidata)[1]);
});

test('month-scaled history opens on the latest role and keeps labels in reverse chronological order', () => {
  const { container } = render(view());
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  const rows = [...container.querySelectorAll('.branch-event-row')];
  const leadershipCount = content.education.reduce((count, school) => count + (school.leadership?.length || 0), 0);
  expect(rows).toHaveLength(content.experience.length + leadershipCount + 2);
  const dates = rows.map((row) => Number(row.dataset.eventDate));
  expect(dates).toEqual([...dates].sort((a, b) => b - a));
  expect(rows.map((row) => row.dataset.timelineId)).toEqual([
    'treasury', 'trianz', 'nyu-shanghai-graduation', 'medidata', 'tech-trek',
    'microsoft', 'tamid', 'jika', 'nyu-shanghai-start',
  ]);
  expect(rows[0]).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('globe-location')).toHaveTextContent('Washington, DC');
  expect(screen.getByRole('slider', { name: 'Experience progress' })).toHaveAttribute('aria-valuetext', expect.stringContaining('Present'));
  rows.forEach((row, index) => {
    expect(row.style.height).toBe('56px');
    if (index) expect(parseFloat(row.style.top)).toBeGreaterThanOrEqual(parseFloat(rows[index - 1].style.top) + 56);
  });
  expect(parseFloat(container.querySelector('.branch-index-chart-inner').style.height)).toBeGreaterThan(2000);
  const microsoft = screen.getByRole('button', { name: /Microsoft AI Co-Innovation Labs: AI Software/ });
  fireEvent.click(microsoft);
  expect(microsoft).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('globe-location')).toHaveTextContent('Shanghai');
});

test('durations use a shared month scale and completed roles merge into main without extra labels', () => {
  const { container } = render(view());
  const branch = (id) => container.querySelector(`[data-branch-id="${id}"]`);
  const duration = (id) => Number(branch(id).dataset.startY) - Number(branch(id).dataset.endY);
  expect(duration('microsoft')).toBe(2 * 36);
  expect(duration('medidata')).toBe(duration('microsoft'));
  expect(duration('jika')).toBe(4 * 36);
  expect(duration('trianz')).toBe(9 * 36);
  expect(branch('trianz').dataset.lane).not.toBe(branch('treasury').dataset.lane);
  expect(branch('trianz').dataset.endY).toBe(branch('treasury').dataset.startY);
  content.experience.filter((role) => !/present/i.test(role.period)).forEach((role) => {
    const lane = branch(role.id);
    expect(lane.querySelector('.branch-time-path').getAttribute('d')).toMatch(new RegExp(`,8 ${lane.dataset.endY}$`));
    expect(lane.querySelector('.branch-time-merge')).toBeInTheDocument();
    const row = container.querySelector(`[data-timeline-id="${role.id}"]`);
    expect(row.querySelectorAll('.branch-event-name')).toHaveLength(1);
    expect(row.querySelectorAll('.branch-role-period')).toHaveLength(1);
    expect(row).not.toHaveTextContent(/Started|Completed|Merged|↳/);
  });
  expect(branch('treasury').querySelector('.branch-time-merge')).not.toBeInTheDocument();
  expect(branch('treasury').querySelector('.branch-time-ongoing')).toBeInTheDocument();
  expect(container.querySelector('.merge-note')).not.toBeInTheDocument();
  expect(container.querySelector('.time-label')).not.toBeInTheDocument();
});

test('next and previous chapters select adjacent history rows without duplicate work milestones', () => {
  const { container } = render(view());
  fireEvent.click(screen.getByRole('tab', { name: 'Journey' }));
  const nav = screen.getByRole('navigation', { name: 'Career branch index' });
  const rows = within(nav).getAllByRole('button');
  expect(within(nav).getAllByText('Started')).toHaveLength(1);
  expect(within(nav).getAllByText('Graduated')).toHaveLength(1);
  expect(within(nav).queryByText('Completed')).not.toBeInTheDocument();
  expect(new Set(rows.map((row) => row.dataset.timelineId)).size).toBe(rows.length);
  for (let i = 1; i < rows.length; i += 1) {
    fireEvent.click(screen.getByRole('button', { name: 'Next chapter' }));
    expect(rows[i]).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelectorAll('.branch-event-row[aria-pressed="true"]')).toHaveLength(1);
  }
  for (let i = rows.length - 2; i >= 0; i -= 1) {
    fireEvent.click(screen.getByRole('button', { name: 'Previous chapter' }));
    expect(rows[i]).toHaveAttribute('aria-pressed', 'true');
  }
});
