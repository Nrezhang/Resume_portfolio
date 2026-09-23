import HomeIdentity from '../components/chat/HomeIdentity';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiArrowUp, FiArrowUpRight, FiBookOpen, FiBriefcase, FiFileText, FiGithub, FiGrid, FiLinkedin, FiMessageCircle, FiUser, FiX, FiZap } from 'react-icons/fi';
import { useContent } from '../content/ContentContext';
import { documentAssets } from '../content/assets';
import { useChat } from '../components/chat/ChatContext';
import { CompactExperienceLogo, CompactProjectCard, highlightedProjects } from '../components/chat/PortfolioCards';

const prompts = {
  about: ['Give me a quick introduction.', 'What problems do you enjoy solving?', 'How do you approach AI projects?', 'What are you learning right now?'],
  beyond: ['What do you do outside of coding?', 'What’s something unexpected about you?', 'What’s your story?'],
};
const actions = [['about', 'Ask about me', FiUser], ['projects', 'Projects', FiGrid], ['experience', 'Experience', FiBriefcase], ['beyond', 'Beyond work', FiZap]];
export function UtilityLinks() {
  const { content } = useContent();
  return <nav className="chat-utilities" aria-label="Utility links">{documentAssets.resume && <Link to="/resume"><FiFileText />Resume</Link>}{content.profile.github && <a href={content.profile.github} target="_blank" rel="noreferrer"><FiGithub />GitHub</a>}{content.profile.linkedin && <a href={content.profile.linkedin} target="_blank" rel="noreferrer"><FiLinkedin />LinkedIn</a>}</nav>;
}
export default function HomePage() {
  const { content } = useContent();
  const { conversations, draft, setDraft, send, pendingIds } = useChat();
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const triggerRefs = useRef({});
  const expandedRef = useRef(null);
  const input = useRef(null);
  const end = useRef(null);
  const chat = conversations.find((item) => item.id === chatId);
  const pending = pendingIds.includes(chatId);
  const dropdown = !chat && prompts[expanded];
  const selectedProjects = highlightedProjects(content.projects).filter((project) => ['inyo', 'mydian-dashboard'].includes(project.id));
  const treasuryRole = content.experience.find((item) => item.id === 'treasury');
  const composerPlaceholder = expanded === 'about'
    ? 'Ask about Henry…'
    : expanded === 'beyond'
      ? 'Ask beyond work…'
      : 'Ask about my work, projects, or experience…';

  useEffect(() => { setExpanded(null); }, [location.key]);
  useEffect(() => { if (expanded) expandedRef.current?.querySelector('button, a')?.focus(); }, [expanded]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end', behavior: 'instant' }); }, [chat?.messages.length, pending]);
  function closeExpanded() {
    const previous = expanded;
    setExpanded(null);
    requestAnimationFrame(() => triggerRefs.current[previous]?.focus());
  }
  function submit(text, fromSuggestion = false) {
    const id = send(text, chatId);
    if (!id) return;
    if (!fromSuggestion) setDraft('');
    setExpanded(null);
    navigate(`/chat/${id}`);
    requestAnimationFrame(() => input.current?.focus());
  }

  return <main className={`chat-page ${chat ? 'has-conversation' : 'is-home home-portfolio'}`} onKeyDown={(event) => { if (event.key === 'Escape' && expanded) { event.preventDefault(); closeExpanded(); } }}>
    {chat ? <><header className="conversation-heading"><FiMessageCircle /><span>{chat.title}</span><small>Demo chat</small></header><div className="conversation-thread" role="log" aria-label="Conversation" aria-live="polite">{chat.messages.map((message, index) => <article className={`chat-message message-${message.role}`} key={index}><span className="message-author">{message.role === 'user' ? 'You' : `Henry AI · ${message.label || 'Demo response'}`}</span><p>{message.text}</p></article>)}{pending && <p role="status" className="chat-pending">Preparing response…</p>}<div ref={end} /></div></> : <div className="home-overview">
      <HomeIdentity />
      <div className="home-work-overview">
        {treasuryRole && <section className="home-current-role" aria-labelledby="home-current-role-heading">
          <div className="home-selected-work-heading"><h2 id="home-current-role-heading">Currently</h2><Link to="/experience">Experience <FiArrowUpRight aria-hidden="true" /></Link></div>
          <div className="home-project-list">
            <Link className="chat-project-card home-role-card" to={`/experience#experience-detail-${treasuryRole.id}`} aria-label={`Current role: ${treasuryRole.role} at ${treasuryRole.company}`}>
              <CompactExperienceLogo experience={treasuryRole} />
              <div className="chat-project-copy"><h3>{treasuryRole.company}<FiArrowUpRight aria-hidden="true" /></h3><p>{treasuryRole.role}</p></div>
            </Link>
          </div>
        </section>}
        <section className="home-selected-work" aria-labelledby="home-selected-work-heading">
          <div className="home-selected-work-heading"><h2 id="home-selected-work-heading">Selected work</h2><Link to="/projects">All projects <FiArrowUpRight aria-hidden="true" /></Link></div>
          <div className="home-project-list">{selectedProjects.map((project) => <CompactProjectCard key={project.id} project={project} />)}</div>
        </section>
      </div>
    </div>}
    <div className="composer-area">
      <div className={`chat-composer ${dropdown ? 'with-suggestions' : ''}`}>
        <form className="composer-input-row" onSubmit={(event) => { event.preventDefault(); submit(draft); }}>
          {dropdown && <button type="button" className="chat-composer-close" onClick={closeExpanded} aria-label="Close suggestions"><FiX /></button>}
          <textarea ref={input} rows={1} maxLength={4000} aria-label="Ask Henry" placeholder={composerPlaceholder} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); submit(draft); } }} />
          <button className="chat-send" type="submit" aria-label="Send message" disabled={!draft.trim() || pending}><FiArrowUp /></button>
        </form>
        {dropdown && <section className="chat-suggestions" ref={expandedRef} aria-label={expanded === 'about' ? 'Ask about me suggestions' : 'Beyond work suggestions'}>{dropdown.map((question, index) => <button className="suggestion-row" key={question} onClick={() => submit(question, true)}>{index === 0 ? <FiUser /> : index === 1 ? <FiZap /> : <FiBookOpen />}<span>{question}</span><FiArrowUp className="suggestion-arrow" /></button>)}</section>}
      </div>
      {chat && <p className="demo-caption">Demo only. No live AI connected.</p>}
    </div>
    {!chat && <>
      {!expanded && <div className="chat-quick-actions">{actions.map(([id, label, Icon]) => <button key={id} ref={(node) => { triggerRefs.current[id] = node; }} onClick={() => setExpanded(id)} aria-expanded={false}><Icon />{label}</button>)}</div>}
      {(expanded === 'projects' || expanded === 'experience') && <section className="chat-expanded-cards" ref={expandedRef} aria-label={expanded === 'projects' ? 'Highlighted projects' : 'Recent experience'}><div className="expanded-toolbar"><button onClick={closeExpanded}><FiArrowLeft />Back</button><Link to={`/${expanded}`}>{expanded === 'projects' ? 'View all projects' : 'View experience'} <FiArrowRight /></Link></div><h2>{expanded === 'projects' ? 'Highlighted projects' : 'Recent experience'}</h2>{expanded === 'projects' ? <div className="chat-project-grid">{highlightedProjects(content.projects).map((project) => <CompactProjectCard key={project.id} project={project} />)}</div> : <div className="chat-experience-cards">{content.experience.length ? content.experience.slice(0, 3).map((item) => <Link to="/experience" className="chat-experience-card" key={item.id}><CompactExperienceLogo experience={item} /><div><h3>{item.company || 'Company — add in editor'}</h3><p>{item.role || 'Role — add in editor'}</p><small>{item.period || 'Dates — add in editor'}</small></div><FiArrowUpRight className="experience-card-arrow" aria-hidden="true" /></Link>) : <p>Experience details are not available yet. <Link to="/admin">Add experience in the editor.</Link></p>}</div>}</section>}
      <UtilityLinks />
    </>}
  </main>;
}
