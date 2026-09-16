import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiDownload, FiMail, FiMenu, FiMonitor, FiMoon, FiSun, FiX } from 'react-icons/fi';
import { documentAssets } from '../../content/assets';
import { useContent } from '../../content/ContentContext';
import { isPortfolioSection, portfolioSections, sectionChangeEvent } from '../../navigation/portfolioSections';
import Button from '../ui/Button';
import { motion } from 'motion/react';
import useTheme from '../../hooks/useTheme';

const themeIcons = {
  system: FiMonitor,
  light: FiSun,
  dark: FiMoon,
};

export default function PortfolioLayout() {
  const { content } = useContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const [activePath, setActivePath] = useState(isPortfolioSection(location.pathname) ? location.pathname : '');
  const { preference: themePreference, cycleTheme } = useTheme();
  const ThemeIcon = themeIcons[themePreference];

  useEffect(() => {
    setMenuOpen(false);
    setActivePath(isPortfolioSection(location.pathname) ? location.pathname : '');
  }, [location.pathname]);

  useEffect(() => {
    const handleSectionChange = (event) => setActivePath(event.detail.path);
    window.addEventListener(sectionChangeEvent, handleSectionChange);
    return () => window.removeEventListener(sectionChangeEvent, handleSectionChange);
  }, []);

  const scrollToRoute = (path) => {
    const headingId = path === '/profile' ? 'profile-heading' : `${path.slice(1)}-heading`;
    window.requestAnimationFrame(() => {
      document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="site-frame">
      <header className="site-header">
        <div className="site-shell header-inner">
          <Link className="brand" to="/profile" onClick={() => scrollToRoute('/profile')} aria-label="Henry Zhang home">
            <span className="brand-mark">HZ</span>
            <span className="brand-copy"><b>{content.profile.name}</b><small>Software Engineer</small></span>
          </Link>
          <motion.button className="icon-button menu-button" whileTap={{ scale: 0.92 }} type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}>{menuOpen ? <FiX /> : <FiMenu />}</motion.button>
          <nav className={`primary-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
            {portfolioSections.map(({ label, path }) => <Link className={activePath === path ? 'active' : ''} to={path} key={path} onClick={() => scrollToRoute(path)}>{label}{activePath === path && <motion.span className="nav-indicator" layoutId="nav-indicator" />}</Link>)}
          </nav>
          <div className="header-actions">
            <button className="icon-button" type="button" onClick={cycleTheme} aria-label={`Theme: ${themePreference}. Switch theme`} title={`Theme: ${themePreference}`}><ThemeIcon /></button>
            <a className="icon-button" href={documentAssets.resume} target="_blank" rel="noreferrer" aria-label="Open resume" title="Open resume"><FiDownload /></a>
            <Button asChild><a href={`mailto:${content.profile.email}`}><FiMail /> Contact</a></Button>
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="site-footer">
        <div className="site-shell footer-inner">
          <div><b>{content.profile.name}</b><span>Building clear, useful software.</span></div>
          <div className="footer-links">
            <a href={content.profile.github} target="_blank" rel="noreferrer">GitHub</a>
            <a href={content.profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <NavLink to="/admin">Admin</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
