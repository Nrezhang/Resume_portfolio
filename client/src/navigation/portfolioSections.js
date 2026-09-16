export const portfolioSections = [
  { label: 'Profile', path: '/profile', headingId: 'profile-heading' },
  { label: 'Experience', path: '/experience', headingId: 'experience-heading' },
  { label: 'Projects', path: '/projects', headingId: 'projects-heading' },
  { label: 'Education', path: '/education', headingId: 'education-heading' },
  { label: 'Skills', path: '/skills', headingId: 'skills-heading' },
  { label: 'Contact', path: '/contact', headingId: 'contact-heading' },
];

export const sectionChangeEvent = 'portfolio-section-change';

export function isPortfolioSection(pathname) {
  return portfolioSections.some((section) => section.path === pathname);
}
