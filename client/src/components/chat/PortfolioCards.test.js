import { render, screen } from '@testing-library/react';
import { CompactExperienceLogo, ProjectThumbnail } from './PortfolioCards';
import { resolveExperienceLogo } from '../../content/assets';

test('legacy brand resolves the logo including dark variants', () => {
  render(<CompactExperienceLogo experience={{ company: 'Treasury', brand: 'treasury' }} />);
  expect(screen.getByRole('img', { name: 'Treasury logo' })).toHaveAttribute('src', expect.stringContaining('treasury-seal'));
  expect(resolveExperienceLogo({ brand: 'trianz' }).dark).toBeTruthy();
});
test('explicit media wins over legacy brand', () => {
  expect(resolveExperienceLogo({ brand: 'treasury', media: { logo: { src: 'https://example.com/custom.svg' } } }).light).toBe('https://example.com/custom.svg');
});
test('missing logos retain a layout slot without a broken image', () => {
  const { container } = render(<CompactExperienceLogo experience={{ company: 'Unknown', brand: 'unknown' }} />);
  expect(container.querySelector('.chat-experience-logo')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
test('portfolio projects render their homepage preview instead of the placeholder', () => {
  render(<ProjectThumbnail project={{ title: 'Resume Portfolio', data: { id: 'portfolio-platform', image: 'portfolio', imageAlt: 'Portfolio homepage' } }} />);
  expect(screen.getByRole('img', { name: 'Portfolio homepage' })).toHaveAttribute('src', expect.stringContaining('homepage'));
  expect(screen.queryByText('Preview coming soon')).not.toBeInTheDocument();
});
test('projects without a dedicated preview retain the placeholder', () => {
  render(<ProjectThumbnail project={{ title: 'Full-Stack Tinder Application', data: { id: 'full-stack-tinder', image: '', imageAlt: 'Full-stack web application interface' } }} />);
  expect(screen.getByText('Preview coming soon')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
