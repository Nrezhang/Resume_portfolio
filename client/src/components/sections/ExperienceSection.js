import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowDownRight, FiArrowUpRight, FiChevronDown, FiGitBranch, FiList } from 'react-icons/fi';
import { useContent } from '../../content/ContentContext';
import SectionHeading from '../common/SectionHeading';
import SkillTags from '../common/SkillTags';
import Card from '../ui/Card';
import { AddControl, ItemControls } from '../editor/InlineEditorControls';
import { resolveExperienceLogo } from '../../content/assets';
import ContentImage from '../common/ContentImage';
import ExperienceTimeline, { buildTimeline, GitBranchIndex } from '../timeline/ExperienceTimeline';
import '../../styles/experience-index.css';

const detailTargetId = (item) => item.kind === 'work' ? `experience-detail-${item.id}` : item.entryId;

export default function ExperienceSection({ limit, editor }) {
  const { content } = useContent();
  const location = useLocation();
  const navigate = useNavigate();
  const experience = limit ? content.experience.slice(0, limit) : content.experience;
  const immersive = !editor && !limit;
  const [view, setView] = useState('details');
  const pendingScroll = useRef(null);
  const pendingDetailScroll = useRef(null);
  const sectionRef = useRef(null);
  const detailScrollLock = useRef(0);
  const reduceMotion = useReducedMotion();
  // Both views show the same complete history. Only the reading view's
  // keyboard destinations and detail cards are limited to work roles.
  const timeline = useMemo(() => buildTimeline(content.experience, content.education), [content.experience, content.education]);
  const workItems = useMemo(() => timeline.items.filter((item) => item.kind === 'work'), [timeline]);
  const [expanded, setExpanded] = useState(() => {
    const first = timeline.items.find((item) => item.kind === 'work');
    return first ? { [first.id]: true } : {};
  });
  const [activeDetailId, setActiveDetailId] = useState(workItems[0]?.id);
  const activeDetail = workItems.find((item) => item.id === activeDetailId) || workItems[0];
  const detailEntries = immersive ? workItems : experience;

  const selectDetail = useCallback((id, focusEntry = false) => {
    const item = timeline.items.find((entry) => entry.id === id);
    if (!item) return;
    if (item.kind !== 'work') {
      navigate(`/education#${item.entryId}`);
      return;
    }
    pendingDetailScroll.current = { id: detailTargetId(item), focusEntry };
    setActiveDetailId(id);
    setExpanded(item.kind === 'work' ? { [id]: true } : {});
    detailScrollLock.current = Date.now() + (reduceMotion ? 0 : 1200);
  }, [timeline, reduceMotion, navigate]);

  useLayoutEffect(() => {
    if (!pendingDetailScroll.current || view !== 'details') return;
    // Measure the destination only after the old entry has collapsed and the
    // new entry has expanded, otherwise scrolling lands at its old position.
    const target = document.getElementById(pendingDetailScroll.current.id);
    target?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
    if (pendingDetailScroll.current.focusEntry) target?.focus({ preventScroll: true });
    pendingDetailScroll.current = null;
  }, [expanded, activeDetailId, view, reduceMotion]);

  useEffect(() => {
    if (!immersive) return;
    const item = workItems.find((entry) => location.hash === `#${detailTargetId(entry)}`);
    if (!item) return;
    setView('details');
    selectDetail(item.id, true);
  }, [location.hash, immersive, workItems, selectDetail]);

  useEffect(() => {
    if (!immersive || view !== 'details') return;
    const onKeyDown = (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target;
      const section = sectionRef.current;
      if (target instanceof Element) {
        if (target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
        if (target !== document.body && target !== document.documentElement && !section?.contains(target)) return;
      }
      const rect = section?.getBoundingClientRect();
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight * 0.65) return;
      event.preventDefault();
      const index = workItems.findIndex((item) => item.id === activeDetail?.id);
      const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
      const next = workItems[Math.max(0, Math.min(workItems.length - 1, index + direction))];
      if (!next) return;
      selectDetail(next.id);
      [...section.querySelectorAll('.experience-details-index [data-timeline-id]')]
        .find((button) => button.dataset.timelineId === next.id)?.focus({ preventScroll: true });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [immersive, view, activeDetail, workItems, selectDetail]);

  useEffect(() => {
    if (!immersive || view !== 'details') return;
    let frame;
    const syncSelection = () => {
      frame = null;
      if (Date.now() < detailScrollLock.current) return;
      const entries = workItems.map((item) => ({ item, node: document.getElementById(detailTargetId(item)) }))
        .filter(({ node }) => node && node.getBoundingClientRect().height > 0);
      // Keep an expanded role selected until the next heading actually reaches
      // the reading line, rather than switching halfway through its bullets.
      const positioned = entries.map((entry) => ({ ...entry, top: entry.node.getBoundingClientRect().top }));
      const current = positioned.filter((entry) => entry.top <= 110).sort((a, b) => b.top - a.top)[0]
        || positioned.sort((a, b) => a.top - b.top)[0];
      if (current) setActiveDetailId((id) => entries.find((entry) => entry.item.id === id)?.node === current.node ? id : current.item.id);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(syncSelection); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [immersive, view, workItems]);

  const changeView = (nextView, entryId = null) => {
    if (nextView === view) return;
    if (nextView === 'details') setActiveDetailId(entryId?.replace('experience-detail-', '') || workItems[0]?.id);
    pendingScroll.current = entryId || 'section';
    setView(nextView);
  };

  useLayoutEffect(() => {
    if (!pendingScroll.current) return;
    const target = pendingScroll.current === 'section'
      ? sectionRef.current : document.getElementById(pendingScroll.current);
    target?.scrollIntoView({ behavior: 'instant', block: 'start' });
    if (pendingScroll.current !== 'section') target?.focus({ preventScroll: true });
    else {
      const focusTarget = view === 'journey'
        ? '.journey [data-timeline-id][aria-pressed="true"]'
        : '.experience-view-tabs [aria-selected="true"]';
      sectionRef.current?.querySelector(focusTarget)?.focus({ preventScroll: true });
    }
    pendingScroll.current = null;
  }, [view]);

  const viewTabs = (
    <div className="experience-view-tabs" role="tablist" aria-label="Experience view">
      {[['journey', 'Journey', FiGitBranch], ['details', 'All experience', FiList]].map(([id, label, Icon], index) => (
        <button key={id} type="button" role="tab" id={`experience-tab-${id}`}
          aria-controls={`experience-panel-${id}`} aria-selected={view === id} tabIndex={view === id ? 0 : -1}
          onClick={() => changeView(id)} onKeyDown={(event) => {
            // Both views use arrow keys for the timeline; switching views is
            // still available through explicit tab activation.
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            event.stopPropagation();
            changeView(event.key === 'Home' ? 'journey' : event.key === 'End' ? 'details' : index === 0 ? 'details' : 'journey');
          }}><Icon aria-hidden="true" /> {label}</button>
      ))}
    </div>
  );

  const revealTimelineEntry = (item) => {
    if (item.kind === 'work') {
      setView('details');
      selectDetail(item.id, true);
      navigate(`/experience#${detailTargetId(item)}`);
      return;
    }
    navigate(`/education#${item.entryId}`);
  };

  return (
    <section ref={sectionRef} id="experience" className={`content-section experience-section${immersive ? ' experience-section-immersive' : ''}`} aria-labelledby="experience-heading">
      {!immersive && <SectionHeading id="experience-heading" eyebrow="Experience" title="Engineering work shaped by real users and real constraints." action={editor ? <AddControl label="Add experience" onClick={editor.onAdd} /> : limit ? <Link className="text-link" to="/experience">Full experience <FiArrowUpRight /></Link> : null} />}
      {immersive && <div id="experience-panel-journey" role="tabpanel" aria-labelledby="experience-tab-journey" hidden={view !== 'journey'}>
        {view === 'journey' && <ExperienceTimeline name={content.profile.name} experience={content.experience} education={content.education} toolbar={viewTabs}
          onReadEntry={revealTimelineEntry} />}
      </div>}
      <div id={immersive ? 'experience-panel-details' : undefined} role={immersive ? 'tabpanel' : undefined}
        aria-labelledby={immersive ? 'experience-tab-details' : undefined} hidden={immersive && view !== 'details'} className={immersive ? 'experience-details-panel' : undefined}>
      {immersive && <><div className="experience-index-meta"><span>Experience / {content.profile.name}</span><span>Portfolio</span></div><div className="experience-details-heading"><div><h1 id={view === 'details' ? 'experience-heading' : undefined}>Experience <FiArrowDownRight aria-hidden="true" /></h1><p>Roles, results, and the details behind each chapter.</p></div>{view === 'details' && viewTabs}</div></>}
      <div className={immersive ? 'experience-details-layout' : undefined}>
      <div className="experience-list">
        {detailEntries.map((item, index) => {
          const logo = resolveExperienceLogo(item);
          const isExpanded = !immersive || !!expanded[item.id];
          return (
            <Card id={immersive ? `experience-detail-${item.id}` : `work-entry-${item.id}`} tabIndex={-1} className={`experience-row experience-row-${item.id || 'unbranded'}`} index={index} key={item.id}>
              {editor && <ItemControls label={`${item.role || 'experience'} at ${item.company || 'company'}`} onEdit={() => editor.onEdit(index)} onDelete={() => editor.onDelete(index)} />}
              <div className="experience-meta">
                {logo?.light && <a className="experience-logo" href={item.url} target="_blank" rel="noreferrer" aria-label={`Visit ${item.company}`}><ContentImage media={logo} alt={`${item.company} logo`} imgClassName="experience-logo-light" darkImgClassName="experience-logo-dark" /></a>}
                <span>{item.period}</span><small>{item.location}</small><i>{item.type}</i>
              </div>
              <div className="experience-copy">
                <h3>{item.role}</h3>
                <p className="experience-company"><a href={item.url} target="_blank" rel="noreferrer">{item.company} <FiArrowUpRight aria-hidden="true" /></a></p>
                <p className={isExpanded ? 'experience-description' : 'experience-description is-collapsed'}>{item.description}</p>
                {immersive && <button type="button" className="experience-expand" aria-expanded={isExpanded} aria-controls={`experience-more-${item.id}`}
                  aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${item.role} at ${item.company}`}
                  onClick={() => setExpanded((current) => ({ ...current, [item.id]: !current[item.id] }))}>
                  {isExpanded ? 'Less detail' : 'Details & highlights'} <FiChevronDown aria-hidden="true" />
                </button>}
                <div id={`experience-more-${item.id}`} hidden={!isExpanded} className="experience-more">
                  {item.highlights?.length > 0 && <ul className="experience-highlights">{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>}
                  <SkillTags items={item.skills} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {immersive && view === 'details' && activeDetail && <aside className="experience-details-index">
        <GitBranchIndex items={timeline.items} graphItems={timeline.graphItems} keyboardItems={workItems} activeItem={activeDetail} onSelect={selectDetail} reduceMotion={reduceMotion} />
      </aside>}
      </div>
      </div>
    </section>
  );
}
