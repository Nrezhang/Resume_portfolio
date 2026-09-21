import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiBriefcase, FiFileText, FiGrid, FiMenu, FiMessageSquare, FiPlus, FiSidebar, FiUser, FiX } from 'react-icons/fi';
import { useChat } from '../chat/ChatContext';

const navigation = [['About me', '/profile', FiUser], ['Projects', '/projects', FiGrid], ['Experience', '/experience', FiBriefcase], ['Resume', '/resume', FiFileText]];
export default function PortfolioLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebar = useRef(null);
  const opener = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { conversations, setDraft } = useChat();

  useEffect(() => {
    const oldTheme = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = 'dark';
    return () => { if (oldTheme) document.documentElement.dataset.theme = oldTheme; else delete document.documentElement.dataset.theme; };
  }, []);
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const openerElement = opener.current;
    document.body.style.overflow = 'hidden';
    sidebar.current.querySelector('button')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); setMobileOpen(false); }
      if (event.key !== 'Tab') return;
      const controls = sidebar.current.querySelectorAll('a[href], button');
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown); openerElement?.focus(); };
  }, [mobileOpen]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () => {
      document.documentElement.style.setProperty('--chat-viewport', `${viewport?.height || window.innerHeight}px`);
      if (window.innerWidth > 760) setMobileOpen(false);
    };
    resize();
    viewport?.addEventListener('resize', resize);
    window.addEventListener('resize', resize);
    return () => { viewport?.removeEventListener('resize', resize); window.removeEventListener('resize', resize); document.documentElement.style.removeProperty('--chat-viewport'); };
  }, []);

  return <div className={`chat-shell ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'drawer-open' : ''}`}>
    <a className="chat-skip" href="#main-content">Skip to content</a>
    <header className="chat-mobile-header" inert={mobileOpen ? '' : undefined}><button ref={opener} className="chat-icon" aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="portfolio-sidebar" onClick={() => setMobileOpen(true)}><FiMenu /></button><Link to="/">Henry</Link><span>Portfolio</span></header>
    {mobileOpen && <button className="drawer-overlay" aria-label="Close navigation" tabIndex={-1} onClick={() => setMobileOpen(false)} />}
    <aside id="portfolio-sidebar" ref={sidebar} className="chat-sidebar" role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen ? true : undefined} aria-label="Portfolio navigation">
      <div className="chat-brand"><Link to="/" className="sidebar-label">Henry</Link><button className="chat-icon desktop-collapse" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><FiSidebar /></button><button className="chat-icon mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><FiX /></button></div>
      <button className="chat-new" onClick={() => { setDraft(''); setMobileOpen(false); navigate('/', { state: { reset: Date.now() } }); }} title="New chat"><FiPlus /><span className="sidebar-label">New chat</span></button>
      <nav className="chat-nav" aria-label="Pinned navigation"><p className="sidebar-label">Pinned</p>{navigation.map(([label, path, Icon]) => <NavLink to={path} key={path} title={label}><Icon /><span className="sidebar-label">{label}</span></NavLink>)}</nav>
      {conversations.length > 0 && <nav className="chat-recents sidebar-label" aria-label="Recent conversations"><p>Recent chats <span>this browser session</span></p>{conversations.map((chat) => <NavLink key={chat.id} to={`/chat/${chat.id}`} title={chat.title}><FiMessageSquare /><span>{chat.title}</span></NavLink>)}</nav>}
      <div className="chat-profile"><span className="neutral-avatar" aria-hidden="true"><FiUser /></span><div className="sidebar-label"><strong>Henry Zhang</strong><span>Software Engineer</span></div></div>
    </aside>
    <div className="chat-main" id="main-content" tabIndex={-1} inert={mobileOpen ? '' : undefined}><Suspense fallback={<p className="chat-loading" role="status">Loading portfolio…</p>}><Outlet /></Suspense></div>
  </div>;
}
