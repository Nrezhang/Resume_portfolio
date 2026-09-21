import React, { useEffect } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { heroDefaults } from '../chat/HomeIdentity';

function Field({ label, value, onChange, textarea = false, type = 'text', options }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {options ? (
        <select value={value ?? ''} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>
      ) : textarea ? (
        <textarea value={value ?? ''} onChange={(event) => onChange(event.target.value)} rows="4" />
      ) : (
        <input type={type} value={value ?? ''} onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)} />
      )}
    </label>
  );
}

const commaList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);
const lineList = (value) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const leadershipBrands = [{ value: '', label: 'None' }, { value: 'tech-nyu', label: 'Tech@NYU' }, { value: 'tamid', label: 'TAMID Group' }];

function EducationFields({ value, update }) {
  const leadership = value.leadership || [];
  const updateLeadership = (index, key, next) => update('leadership', leadership.map((item, currentIndex) => currentIndex === index ? { ...item, [key]: next } : item));
  const addLeadership = () => update('leadership', [...leadership, {
    id: `leadership-${Date.now()}-${leadership.length}`,
    type: 'leadership',
    role: 'Leadership role',
    company: 'Organization',
    brand: '',
    location: 'Location',
    period: 'Dates',
    description: 'Describe your leadership and impact.',
    highlights: [],
    skills: [],
    url: '',
  }]);
  const removeLeadership = (index) => update('leadership', leadership.filter((_, currentIndex) => currentIndex !== index));

  return <>
    <div className="admin-two-column"><Field label="School" value={value.school} onChange={(next) => update('school', next)} /><Field label="Degree" value={value.degree} onChange={(next) => update('degree', next)} /></div>
    <div className="admin-two-column"><Field label="Period" value={value.period} onChange={(next) => update('period', next)} /><Field label="GPA" value={value.gpa} onChange={(next) => update('gpa', next)} /></div>
    <div className="admin-two-column"><Field label="Brand" value={value.brand} onChange={(next) => update('brand', next)} options={[{ value: '', label: 'None' }, { value: 'nyu', label: 'NYU' }, { value: 'tjhsst', label: 'TJHSST' }]} /><Field label="School URL" value={value.url} onChange={(next) => update('url', next)} /></div>
    <Field label="Study locations" value={value.locations} onChange={(next) => update('locations', next)} />
    <Field label="Description" value={value.description} onChange={(next) => update('description', next)} textarea />
    <Field label="Coursework (comma separated)" value={value.coursework.join(', ')} onChange={(next) => update('coursework', commaList(next))} />
    <section className="admin-nested-section" aria-labelledby="education-leadership-editor-heading">
      <div className="admin-nested-heading">
        <div><span>Education details</span><h3 id="education-leadership-editor-heading">Leadership &amp; campus involvement</h3></div>
        <button className="button button-light admin-nested-action" type="button" onClick={addLeadership}><FiPlus aria-hidden="true" /> Add role</button>
      </div>
      {leadership.length === 0 && <p className="admin-nested-empty">No leadership roles are attached to this school.</p>}
      {leadership.map((item, index) => (
        <fieldset className="admin-nested-card" key={item.id || index}>
          <legend>{item.role || `Leadership role ${index + 1}`}</legend>
          <button className="admin-nested-remove" type="button" onClick={() => removeLeadership(index)} aria-label={`Remove ${item.role || 'leadership role'}`}><FiTrash2 aria-hidden="true" /> Remove</button>
          <div className="admin-two-column"><Field label="Role" value={item.role} onChange={(next) => updateLeadership(index, 'role', next)} /><Field label="Organization" value={item.company} onChange={(next) => updateLeadership(index, 'company', next)} /></div>
          <div className="admin-two-column"><Field label="Period" value={item.period} onChange={(next) => updateLeadership(index, 'period', next)} /><Field label="Location" value={item.location} onChange={(next) => updateLeadership(index, 'location', next)} /></div>
          <div className="admin-two-column"><Field label="Brand" value={item.brand} onChange={(next) => updateLeadership(index, 'brand', next)} options={leadershipBrands} /><Field label="Organization URL" value={item.url} onChange={(next) => updateLeadership(index, 'url', next)} /></div>
          <Field label="Description" value={item.description} onChange={(next) => updateLeadership(index, 'description', next)} textarea />
          <Field label="Highlights (one per line)" value={(item.highlights || []).join('\n')} onChange={(next) => updateLeadership(index, 'highlights', lineList(next))} textarea />
          <Field label="Skills (comma separated)" value={(item.skills || []).join(', ')} onChange={(next) => updateLeadership(index, 'skills', commaList(next))} />
        </fieldset>
      ))}
    </section>
  </>;
}

function Fields({ type, value, update }) {
  if (type === 'profile') return <>
    <div className="admin-two-column"><Field label="Name" value={value.name} onChange={(next) => update('name', next)} /><Field label="Location" value={value.location} onChange={(next) => update('location', next)} /></div>
    <Field label="Homepage role (animated)" value={value.heroRole ?? heroDefaults.heroRole} onChange={(next) => update('heroRole', next)} />
    <Field label="Homepage description" value={value.heroDescription ?? heroDefaults.heroDescription} onChange={(next) => update('heroDescription', next)} textarea />
    <div className="admin-two-column"><Field label="Phone" value={value.phone} onChange={(next) => update('phone', next)} /><Field label="Focus" value={value.focus} onChange={(next) => update('focus', next)} /></div>
    <Field label="Citizenship / clearance" value={value.citizenship} onChange={(next) => update('citizenship', next)} />
    <Field label="Eyebrow" value={value.eyebrow} onChange={(next) => update('eyebrow', next)} />
    <Field label="Headline" value={value.headline} onChange={(next) => update('headline', next)} textarea />
    <Field label="Bio" value={value.bio} onChange={(next) => update('bio', next)} textarea />
    <Field label="Welcome message" value={value.welcome} onChange={(next) => update('welcome', next)} textarea />
    <Field label="Personal note" value={value.personalNote} onChange={(next) => update('personalNote', next)} textarea />
    <Field label="Roles (comma separated)" value={value.roles.join(', ')} onChange={(next) => update('roles', commaList(next))} />
    <Field label="Availability" value={value.availability} onChange={(next) => update('availability', next)} />
    <div className="admin-two-column"><Field label="Email" value={value.email} onChange={(next) => update('email', next)} /><Field label="GitHub URL" value={value.github} onChange={(next) => update('github', next)} /></div>
    <Field label="LinkedIn URL" value={value.linkedin} onChange={(next) => update('linkedin', next)} />
  </>;

  if (type === 'project') return <>
    <div className="admin-two-column"><Field label="Title" value={value.title} onChange={(next) => update('title', next)} /><Field label="Year" value={value.year} onChange={(next) => update('year', next)} /></div>
    <Field label="Category" value={value.category} onChange={(next) => update('category', next)} />
    <Field label="Description" value={value.description} onChange={(next) => update('description', next)} textarea />
    <Field label="What I built" value={value.impact} onChange={(next) => update('impact', next)} textarea />
    <Field label="Highlights (one per line)" value={(value.highlights || []).join('\n')} onChange={(next) => update('highlights', lineList(next))} textarea />
    <Field label="Skills (comma separated)" value={value.skills.join(', ')} onChange={(next) => update('skills', commaList(next))} />
    <div className="admin-two-column"><Field label="Image" value={value.image} onChange={(next) => update('image', next)} options={['portfolio', 'sentiment', 'agent', 'airline'].map((item) => ({ value: item, label: item }))} /><Field label="Image alt text" value={value.imageAlt} onChange={(next) => update('imageAlt', next)} /></div>
    <div className="admin-two-column"><Field label="Link label" value={value.linkLabel} onChange={(next) => update('linkLabel', next)} /><Field label="Link or document key" value={value.link} onChange={(next) => update('link', next)} /></div>
  </>;

  if (type === 'experience') return <>
    <div className="admin-two-column"><Field label="Role" value={value.role} onChange={(next) => update('role', next)} /><Field label="Company" value={value.company} onChange={(next) => update('company', next)} /></div>
    <div className="admin-two-column"><Field label="Period" value={value.period} onChange={(next) => update('period', next)} /><Field label="Location" value={value.location} onChange={(next) => update('location', next)} /></div>
    <Field label="Type" value={value.type} onChange={(next) => update('type', next)} />
    <div className="admin-two-column"><Field label="Logo URL or catalog key" value={value.media?.logo?.src || ''} onChange={(next) => update('media', { ...value.media, logo: { ...(value.media?.logo || {}), src: next } })} /><Field label="Dark logo URL (optional)" value={value.media?.logo?.darkSrc || ''} onChange={(next) => update('media', { ...value.media, logo: { ...(value.media?.logo || {}), darkSrc: next } })} /></div>
    <Field label="Logo alt text" value={value.media?.logo?.alt || ''} onChange={(next) => update('media', { ...value.media, logo: { ...(value.media?.logo || {}), alt: next } })} />
    <Field label="Organization URL" value={value.url} onChange={(next) => update('url', next)} />
    <Field label="Description" value={value.description} onChange={(next) => update('description', next)} textarea />
    <Field label="Highlights (one per line)" value={(value.highlights || []).join('\n')} onChange={(next) => update('highlights', lineList(next))} textarea />
    <Field label="Skills (comma separated)" value={value.skills.join(', ')} onChange={(next) => update('skills', commaList(next))} />
  </>;

  if (type === 'education') return <EducationFields value={value} update={update} />;

  if (type === 'skillGroup') return <Field label="Group name" value={value.group} onChange={(next) => update('group', next)} />;

  if (type === 'skill') return <>
    <div className="admin-two-column"><Field label="Skill" value={value.name} onChange={(next) => update('name', next)} /><Field label="Proficiency" type="number" value={value.proficiency} onChange={(next) => update('proficiency', Math.max(0, Math.min(100, next)))} /></div>
    <Field label="Description" value={value.description} onChange={(next) => update('description', next)} textarea />
  </>;

  if (type === 'contact') return <>
    <Field label="Eyebrow" value={value.eyebrow} onChange={(next) => update('eyebrow', next)} />
    <Field label="Headline" value={value.headline} onChange={(next) => update('headline', next)} />
    <Field label="Description" value={value.description} onChange={(next) => update('description', next)} textarea />
    <Field label="Closing note" value={value.note} onChange={(next) => update('note', next)} textarea />
  </>;

  return null;
}

export default function EditorModal({ editor, onChange, onClose, onSubmit }) {
  useEffect(() => {
    const handleKey = (event) => { if (event.key === 'Escape') onClose(); };
    document.body.classList.add('editor-modal-open');
    window.addEventListener('keydown', handleKey);
    return () => { document.body.classList.remove('editor-modal-open'); window.removeEventListener('keydown', handleKey); };
  }, [onClose]);

  const update = (key, value) => onChange({ ...editor.value, [key]: value });
  return (
    <div className="editor-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-modal-title">
        <header><div><p className="eyebrow">Live editor</p><h2 id="editor-modal-title">{editor.title}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close editor" title="Close editor"><FiX /></button></header>
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
          <div className="editor-modal-fields"><Fields type={editor.type} value={editor.value} update={update} /></div>
          <footer><button className="button button-light" type="button" onClick={onClose}>Cancel</button><button className="button button-dark" type="submit">Apply to preview</button></footer>
        </form>
      </section>
    </div>
  );
}

export function DeleteDialog({ request, onClose, onConfirm }) {
  return (
    <div className="editor-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="editor-modal editor-confirm" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <header><div><p className="eyebrow">Confirm deletion</p><h2 id="delete-title">Remove {request.label}?</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close" title="Close"><FiX /></button></header>
        <p>This removes it from the live draft. The public site will not change until you publish.</p>
        <footer><button className="button button-light" type="button" onClick={onClose}>Cancel</button><button className="button editor-danger-button" type="button" onClick={onConfirm}>Delete</button></footer>
      </section>
    </div>
  );
}
