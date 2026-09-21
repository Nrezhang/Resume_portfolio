import { act, render, screen } from '@testing-library/react';
import { DraftContentProvider } from '../../content/ContentContext';
import defaultContent from '../../content/defaultContent.json';
import HomeIdentity from './HomeIdentity';

function renderIdentity() {
  return render(<DraftContentProvider content={defaultContent}><HomeIdentity /></DraftContentProvider>);
}

afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

test('the role types once while keeping the complete accessible text in place', () => {
  jest.useFakeTimers();
  const { container } = renderIdentity();
  expect(screen.getByRole('heading', { name: 'Henry Zhang' })).toBeInTheDocument();
  expect(container.querySelector('.role-reserved')).toHaveTextContent('Software engineer');
  expect(container.querySelector('.role-animated')).toHaveTextContent('');
  act(() => { jest.advanceTimersByTime(600); });
  expect(container.querySelector('.role-animated').textContent.length).toBeGreaterThan(0);
  expect(container.querySelector('.role-animated').textContent.length).toBeLessThan(17);
  act(() => { jest.advanceTimersByTime(2000); });
  expect(container.querySelector('.role-animated')).toHaveTextContent('Software engineer');
  expect(container.querySelector('.role-animated')).not.toHaveClass('is-typing');
});

test('reduced motion presents the full role immediately', () => {
  const original = window.matchMedia;
  jest.spyOn(window, 'matchMedia').mockImplementation((query) => ({ ...original(query), matches: query === '(prefers-reduced-motion: reduce)' }));
  const { container } = renderIdentity();
  expect(container.querySelector('.role-animated')).toHaveTextContent('Software engineer');
  expect(container.querySelector('.role-animated')).not.toHaveClass('is-typing');
});
