import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the portfolio profile', () => {
  const originalFetch = global.fetch;
  global.fetch = undefined;
  window.scrollTo = jest.fn();
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Henry Zhang' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /view projects/i })).toBeInTheDocument();
  global.fetch = originalFetch;
});
