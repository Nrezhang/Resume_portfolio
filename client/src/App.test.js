import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the portfolio profile', () => {
  const originalFetch = global.fetch;
  global.fetch = undefined;
  window.scrollTo = jest.fn();
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Henry Zhang' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /linkedin/i })[0]).toHaveAttribute('href', 'https://www.linkedin.com/in/henryszhang/');
  expect(screen.getByRole('heading', { name: 'New York University Shanghai' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Director of Technology' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Tech Trek Tutor' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'New York University Shanghai leadership and campus involvement' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Thomas Jefferson High School for Science and Technology' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /U\.S\. Department of the Treasury/ })[0]).toHaveAttribute('href', 'https://home.treasury.gov');
  expect(screen.getByAltText('Microsoft AI Co-Innovation Labs logo')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Jika\.io/ })[0]).toHaveAttribute('href', 'https://www.linkedin.com/company/jika-io/');
  global.fetch = originalFetch;
});
