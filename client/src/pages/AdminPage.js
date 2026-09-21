import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { DraftContentProvider, normalizeContent, useContent } from '../content/ContentContext';
import { portfolioApi } from '../services/api';
import EditorModal, { DeleteDialog } from '../components/editor/EditorModal';
import VisualPortfolioEditor from '../components/editor/VisualPortfolioEditor';

const tokenKey = 'portfolio-admin-token';
const clone = (value) => JSON.parse(JSON.stringify(value));
const createId = (prefix) => `${prefix}-${Date.now().toString(36)}`;

function Login({ onLogin }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const googleButton = React.useRef(null);
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const signIn = useCallback(async (credential) => {
    setBusy(true); setError('');
    try { const result = await portfolioApi.loginWithGoogle(credential); sessionStorage.setItem(tokenKey, result.token); onLogin(result.token); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }, [onLogin]);

  useEffect(() => {
    if (!googleClientId) {
      setError('Google sign-in has not been configured yet.');
      return undefined;
    }

    let active = true;
    const renderGoogleButton = () => {
      if (!active || !googleButton.current || !window.google?.accounts?.id) {
        if (active) setError('Google sign-in could not be loaded. Please try again.');
        return;
      }
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: ({ credential }) => signIn(credential),
        auto_select: false,
        ux_mode: 'popup',
      });
      googleButton.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButton.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'signin_with',
        width: Math.min(370, googleButton.current.clientWidth || 250),
      });
    };

    const existingScript = document.querySelector('script[data-google-identity-services]');
    if (existingScript) {
      if (window.google?.accounts?.id) renderGoogleButton();
      else existingScript.addEventListener('load', renderGoogleButton, { once: true });
      return () => { active = false; };
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentityServices = 'true';
    script.addEventListener('load', renderGoogleButton, { once: true });
    script.addEventListener('error', () => active && setError('Google sign-in could not be loaded. Please try again.'), { once: true });
    document.head.appendChild(script);
    return () => { active = false; };
  }, [googleClientId, signIn]);

  return <main className="admin-login"><section><Link className="text-link" to="/"><FiArrowLeft /> Back to portfolio</Link><p className="eyebrow">Owner workspace</p><h1>Portfolio studio</h1><p>Sign in to manage your content and preview changes before publishing.</p><div className="google-sign-in" ref={googleButton} aria-busy={busy} />{busy && <p className="admin-sign-in-status" role="status">Signing in...</p>}{error && <p className="form-error" role="alert">{error}</p>}<small>Admin access is restricted to approved accounts.</small></section></main>;
}

const templates = {
  project: () => ({ id: createId('project'), year: new Date().getFullYear().toString(), title: 'New project', category: 'Software project', description: 'Describe the problem and why this project matters.', impact: 'Describe what you designed and built.', highlights: [], skills: [], image: 'portfolio', imageAlt: 'Project preview', link: '', linkLabel: 'View project' }),
  experience: () => ({ id: createId('experience'), type: 'work', role: 'New role', company: 'Organization', location: 'Location', period: 'Dates', brand: '', description: 'Describe your responsibilities and impact.', highlights: [], skills: [], url: '' }),
  education: () => ({ id: createId('education'), school: 'School', degree: 'Degree or program', period: 'Dates', locations: 'Location', gpa: '', brand: '', url: '', description: 'Describe the program and areas of focus.', coursework: [], leadership: [] }),
  skillGroup: () => ({ id: createId('skill-group'), group: 'New skill group', items: [] }),
  skill: () => ({ name: 'New skill', proficiency: 75, description: 'Describe how you have used this skill.' }),
};

export default function AdminPage() {
  const { content, setContent } = useContent();
  const [draft, setDraft] = useState(() => normalizeContent(content));
  const [token, setToken] = useState(() => sessionStorage.getItem(tokenKey));
  const [checking, setChecking] = useState(Boolean(token));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editor, setEditor] = useState(null);
  const [deleteRequest, setDeleteRequest] = useState(null);

  useEffect(() => { setDraft(normalizeContent(content)); }, [content]);
  useEffect(() => {
    if (!token) return;
    portfolioApi.getSession(token).catch(() => { sessionStorage.removeItem(tokenKey); setToken(null); }).finally(() => setChecking(false));
  }, [token]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(content), [draft, content]);
  const closeEditor = useCallback(() => setEditor(null), []);

  useEffect(() => {
    if (!dirty && (message.startsWith('Draft updated') || message.startsWith('Removed from draft'))) setMessage('');
  }, [dirty, message]);

  useEffect(() => {
    const warnAboutDraft = (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warnAboutDraft);
    return () => window.removeEventListener('beforeunload', warnAboutDraft);
  }, [dirty]);

  const openEditor = (type, index, groupIndex) => {
    let value;
    if (type === 'profile' || type === 'contact') value = draft[type];
    else if (type === 'skill') value = index == null ? templates.skill() : draft.skills[groupIndex].items[index];
    else if (type === 'skillGroup') value = index == null ? templates.skillGroup() : draft.skills[index];
    else { const collection = type === 'project' ? 'projects' : type; value = index == null ? templates[type]() : draft[collection][index]; }
    const titles = { profile: 'Edit profile', project: index == null ? 'Add project' : 'Edit project', experience: index == null ? 'Add experience' : 'Edit experience', education: index == null ? 'Add education' : 'Edit education', skillGroup: index == null ? 'Add skill group' : 'Edit skill group', skill: index == null ? 'Add skill' : 'Edit skill', contact: 'Edit contact section' };
    setEditor({ type, index, groupIndex, value: clone(value), title: titles[type] });
  };

  const applyEditor = () => {
    const { type, index, groupIndex, value } = editor;
    setDraft((current) => {
      if (type === 'profile' || type === 'contact') return { ...current, [type]: value };
      if (type === 'skill') return { ...current, skills: current.skills.map((group, currentGroup) => currentGroup === groupIndex ? { ...group, items: index == null ? [...group.items, value] : group.items.map((skill, currentSkill) => currentSkill === index ? value : skill) } : group) };
      if (type === 'skillGroup') return { ...current, skills: index == null ? [...current.skills, value] : current.skills.map((group, currentIndex) => currentIndex === index ? value : group) };
      const collection = type === 'project' ? 'projects' : type;
      return { ...current, [collection]: index == null ? [...current[collection], value] : current[collection].map((item, currentIndex) => currentIndex === index ? value : item) };
    });
    setEditor(null); setMessage('Draft updated. Publish when ready.');
  };

  const requestDelete = (type, index, groupIndex) => {
    let label;
    if (type === 'skill') label = draft.skills[groupIndex].items[index].name;
    else if (type === 'skillGroup') label = draft.skills[index].group;
    else if (type === 'project') label = draft.projects[index].title;
    else if (type === 'experience') label = draft.experience[index].role;
    else label = draft.education[index].school;
    setDeleteRequest({ type, index, groupIndex, label });
  };

  const confirmDelete = () => {
    const { type, index, groupIndex } = deleteRequest;
    setDraft((current) => {
      if (type === 'skill') return { ...current, skills: current.skills.map((group, currentGroup) => currentGroup === groupIndex ? { ...group, items: group.items.filter((_, currentIndex) => currentIndex !== index) } : group) };
      if (type === 'skillGroup') return { ...current, skills: current.skills.filter((_, currentIndex) => currentIndex !== index) };
      const collection = type === 'project' ? 'projects' : type;
      return { ...current, [collection]: current[collection].filter((_, currentIndex) => currentIndex !== index) };
    });
    setDeleteRequest(null); setMessage('Removed from draft. Publish when ready.');
  };

  const save = async () => {
    setSaving(true); setMessage('Publishing changes…');
    try { const saved = normalizeContent(await portfolioApi.saveContent(draft, token)); setContent(saved); setDraft(saved); setMessage('Changes published.'); }
    catch (error) { setMessage(error.message); }
    finally { setSaving(false); }
  };

  const logout = async () => { await portfolioApi.logout(token).catch(() => {}); sessionStorage.removeItem(tokenKey); setToken(null); };

  if (checking) return <main className="admin-loading">Checking your session…</main>;
  if (!token) return <Login onLogin={(nextToken) => { setToken(nextToken); setChecking(false); }} />;

  return <DraftContentProvider content={draft} setContent={setDraft}>
    <VisualPortfolioEditor dirty={dirty} message={message} saving={saving} onEdit={openEditor} onDelete={requestDelete} onDiscard={() => { setDraft(clone(content)); setMessage('Draft discarded.'); }} onSave={save} onLogout={logout} />
    {editor && <EditorModal editor={editor} onChange={(value) => setEditor((current) => ({ ...current, value }))} onClose={closeEditor} onSubmit={applyEditor} />}
    {deleteRequest && <DeleteDialog request={deleteRequest} onClose={() => setDeleteRequest(null)} onConfirm={confirmDelete} />}
  </DraftContentProvider>;
}
