import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiLogOut, FiRotateCcw, FiSave } from 'react-icons/fi';
import { useContent } from '../../content/ContentContext';
import ProfileSection from '../sections/ProfileSection';
import ExperienceSection from '../sections/ExperienceSection';
import ProjectsSection from '../sections/ProjectsSection';
import EducationSection from '../sections/EducationSection';
import SkillsSection from '../sections/SkillsSection';
import ContactSection from '../sections/ContactSection';
import { ItemControls } from './InlineEditorControls';

export default function VisualPortfolioEditor({ dirty, message, saving, onEdit, onDelete, onDiscard, onSave, onLogout }) {
  const { content } = useContent();

  return (
    <div className="admin-visual-app">
      <header className="visual-editor-bar">
        <div className="visual-editor-brand"><span className="brand-mark">HZ</span><div><b>Visual editor</b><small>{dirty ? 'Unpublished changes' : 'All changes published'}</small></div></div>
        <span className="editor-status" role="status">{message}</span>
        <div className="visual-editor-actions">
          <Link className="icon-button" to="/profile" title="Exit editor" aria-label="Exit editor"><FiArrowLeft /></Link>
          <button className="icon-button" type="button" onClick={onDiscard} disabled={!dirty} title="Discard draft" aria-label="Discard draft"><FiRotateCcw /></button>
          <button className="icon-button" type="button" onClick={onLogout} title="Sign out" aria-label="Sign out"><FiLogOut /></button>
          <button className="button button-dark" type="button" onClick={onSave} disabled={!dirty || saving}><FiSave /> {saving ? 'Publishing…' : 'Publish changes'}</button>
        </div>
      </header>

      <main className="site-shell page-stack admin-live-preview">
        <div className="editable-block">
          <ProfileSection />
          <ItemControls label="profile" onEdit={() => onEdit('profile')} />
        </div>
        <section className="profile-notes" aria-label="About Henry"><p>{content.profile.welcome}</p><p>{content.profile.personalNote}</p></section>
        <ExperienceSection editor={{ onAdd: () => onEdit('experience', null), onEdit: (index) => onEdit('experience', index), onDelete: (index) => onDelete('experience', index) }} />
        <ProjectsSection editor={{ onAdd: () => onEdit('project', null), onEdit: (index) => onEdit('project', index), onDelete: (index) => onDelete('project', index) }} />
        <EducationSection editor={{ onAdd: () => onEdit('education', null), onEdit: (index) => onEdit('education', index), onDelete: (index) => onDelete('education', index) }} />
        <SkillsSection detailed editor={{ onAddGroup: () => onEdit('skillGroup', null), onEditGroup: (groupIndex) => onEdit('skillGroup', groupIndex), onDeleteGroup: (groupIndex) => onDelete('skillGroup', groupIndex), onAddSkill: (groupIndex) => onEdit('skill', null, groupIndex), onEditSkill: (groupIndex, skillIndex) => onEdit('skill', skillIndex, groupIndex), onDeleteSkill: (groupIndex, skillIndex) => onDelete('skill', skillIndex, groupIndex) }} />
        <div className="editable-block">
          <ContactSection />
          <ItemControls label="contact section" onEdit={() => onEdit('contact')} />
        </div>
      </main>
    </div>
  );
}
