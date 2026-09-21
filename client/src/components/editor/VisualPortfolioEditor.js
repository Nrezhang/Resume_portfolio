import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiEdit2, FiLogOut, FiPlus, FiRotateCcw, FiSave, FiTrash2 } from 'react-icons/fi';
import { useContent } from '../../content/ContentContext';
import HomeIdentity from '../chat/HomeIdentity';
import SessionUsage from '../chat/SessionUsage';
import SkillsSection from '../sections/SkillsSection';

const sections = ['Homepage', 'Projects', 'Experience', 'Education', 'Skills', 'Contact', 'AI usage'];

export default function VisualPortfolioEditor({ dirty, message, saving, onEdit, onDelete, onDiscard, onSave, onLogout }) {
  const { content } = useContent();
  const [section, setSection] = useState('Homepage');
  const collection = { Projects: 'projects', Experience: 'experience', Education: 'education' }[section];
  const type = section === 'Projects' ? 'project' : collection;

  return <main className="revamp-admin">
    <header className="cms-heading">
      <div><p className="chat-overline">Owner workspace</p><h1>Portfolio studio</h1><p>Shape the story. Preview your changes. Publish when ready.</p></div>
      <Link to="/" className="cms-preview-link">View portfolio <FiArrowUpRight /></Link>
    </header>
    <div className="cms-publish-bar">
      <span>{dirty ? 'Unpublished changes' : 'All changes published'}</span>
      <div className="cms-actions">
        <button type="button" className="chat-icon" onClick={onDiscard} disabled={!dirty || saving} aria-label="Discard draft"><FiRotateCcw /></button>
        <button type="button" className="chat-icon" onClick={onLogout} disabled={saving} aria-label="Sign out"><FiLogOut /></button>
        <button type="button" className="cms-button cms-primary" onClick={onSave} disabled={!dirty || saving}><FiSave />{saving ? 'Publishing…' : 'Publish changes'}</button>
      </div>
    </div>
    <p className="cms-status" role="status">{message}</p>
    <nav className="cms-sections" aria-label="Editor sections">{sections.map((label) => <button key={label} type="button" aria-pressed={section === label} onClick={() => setSection(label)}>{label}</button>)}</nav>
    <section className="cms-panel" aria-label={section + ' editor'}>
      {section === 'Homepage' && <>
        <div className="cms-panel-heading"><div><h2>First impressions</h2><p>The introduction visitors see before starting a conversation.</p></div><button className="cms-button" type="button" onClick={() => onEdit('profile')}><FiEdit2 />Edit profile</button></div>
        <div className="cms-home-preview"><HomeIdentity animate={false} /><div className="cms-composer-preview">Henry AI <span>Ask about my work, projects, or experience…</span></div></div>
        <div className="cms-profile-details"><h3>About Henry</h3><p>{content.profile.bio}</p><h3>Beyond work</h3><p>{content.profile.personalNote}</p></div>
      </>}
      {collection && <>
        <div className="cms-panel-heading"><div><h2>{section}</h2><p>{content[collection].length} entries in your portfolio</p></div><button className="cms-button" type="button" onClick={() => onEdit(type, null)}><FiPlus />Add {type}</button></div>
        <div className="cms-entries">{content[collection].map((item, index) => <article className="cms-entry" key={item.id}>
          <div><h3>{item.title || item.company || item.school}</h3><small>{item.category || item.role || item.degree} · {item.year || item.period}</small><p>{item.description}</p></div>
          <div className="cms-actions"><button className="chat-icon" type="button" onClick={() => onEdit(type, index)} aria-label={'Edit ' + (item.title || item.company || item.school)}><FiEdit2 /></button><button className="chat-icon" type="button" onClick={() => onDelete(type, index)} aria-label={'Delete ' + (item.title || item.company || item.school)}><FiTrash2 /></button></div>
        </article>)}</div>
      </>}
      {section === 'Skills' && <SkillsSection detailed editor={{ onAddGroup: () => onEdit('skillGroup', null), onEditGroup: (groupIndex) => onEdit('skillGroup', groupIndex), onDeleteGroup: (groupIndex) => onDelete('skillGroup', groupIndex), onAddSkill: (groupIndex) => onEdit('skill', null, groupIndex), onEditSkill: (groupIndex, skillIndex) => onEdit('skill', skillIndex, groupIndex), onDeleteSkill: (groupIndex, skillIndex) => onDelete('skill', skillIndex, groupIndex) }} />}
      {section === 'Contact' && <><div className="cms-panel-heading"><h2>Contact</h2><button type="button" className="cms-button" onClick={() => onEdit('contact')}><FiEdit2 />Edit contact</button></div><h3>{content.contact.headline}</h3><p>{content.contact.description}</p><p>{content.contact.note}</p></>}
      {section === 'AI usage' && <>
        <div className="cms-panel-heading"><div><h2>Usage &amp; spending</h2><p>Controls for the future AI chat connection.</p></div><span className="cms-status-badge">Not connected</span></div>
        <SessionUsage />
        <div className="cms-budget-plan"><h3>Session limits</h3><p>Message and token budgets will be configured here when server-side enforcement is connected.</p>
          <dl><div><dt>Messages per session</dt><dd>Not configured</dd></div><div><dt>Tokens per session</dt><dd>Not configured</dd></div><div><dt>Daily spending cap</dt><dd>Not configured</dd></div></dl>
          <p className="cms-budget-note">Demo only. These controls do not enforce a billing limit yet. Visitors cannot change the future owner-managed budgets.</p>
        </div>
      </>}
    </section>
  </main>;
}
