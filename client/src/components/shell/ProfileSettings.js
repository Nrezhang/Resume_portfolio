import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { FiChevronUp, FiMonitor, FiMoon, FiSettings, FiSun, FiX } from 'react-icons/fi';
import { imageAssets } from '../../content/assets';
import { useContent } from '../../content/ContentContext';
import SessionUsage from '../chat/SessionUsage';

export default function ProfileSettings({ preference, setPreference, mobileOpen }) {
  const { content } = useContent();
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const panel = useRef(null);
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();
  useEffect(() => { setOpen(false); }, [pathname, mobileOpen]);
  useEffect(() => {
    if (!open) return undefined;
    panel.current?.querySelector('button')?.focus();
    const outside = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const close = () => { setOpen(false); trigger.current?.focus(); };

  return <div className="profile-settings" ref={container} onKeyDown={(event) => {
    if (open && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
  }}>
    {open && <section className="profile-settings-panel" id="profile-settings-panel" ref={panel} aria-label="Profile settings">
      <header><span><FiSettings />Settings</span><button className="chat-icon" type="button" aria-label="Close settings" onClick={close}><FiX /></button></header>
      <fieldset className="appearance-settings"><legend>Appearance</legend><div>{[['light', 'Light', FiSun], ['dark', 'Dark', FiMoon], ['system', 'System', FiMonitor]].map(([value, label, Icon]) => <button key={value} type="button" aria-pressed={preference === value} onClick={() => setPreference(value)}>{preference === value && <motion.span className="appearance-selection" layoutId="appearance-selection" transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 36, mass: 0.7 }} aria-hidden="true" />}<span className="appearance-choice-content"><Icon />{label}</span></button>)}</div></fieldset>
      <SessionUsage />
      <Link className="settings-admin-link" to="/admin"><FiSettings /><span>Open admin</span><small>Owner access</small></Link>
    </section>}
    <button ref={trigger} className="chat-profile" type="button" aria-label="Open profile settings" aria-expanded={open} aria-controls="profile-settings-panel" onClick={() => setOpen((value) => !value)}>
      <span className="profile-avatar"><img src={imageAssets[content.profile.image] || imageAssets.profile} alt={`${content.profile.name} profile`} /></span>
      <span className="sidebar-label profile-name"><strong>{content.profile.name}</strong><span>Software Engineer</span></span>
      <FiChevronUp className="sidebar-label profile-chevron" />
    </button>
  </div>;
}
