import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiGitBranch, FiList } from 'react-icons/fi';
import { useContent } from '../../content/ContentContext';
import SectionHeading from '../common/SectionHeading';
import SkillTags from '../common/SkillTags';
import Card from '../ui/Card';
import { AddControl, ItemControls } from '../editor/InlineEditorControls';
import { experienceAssets } from '../../content/assets';
import ExperienceTimeline from '../timeline/ExperienceTimeline';

export default function ExperienceSection({ limit, editor }) {
  const { content } = useContent();
  const experience = limit ? content.experience.slice(0, limit) : content.experience;
  const immersive = !editor && !limit;
  const [view, setView] = useState('journey');
  const pendingScroll = useRef(null);
  const sectionRef = useRef(null);
  const detailEntries = experience;

  const changeView = (nextView, entryId = null) => {
    if (nextView === view) return;
    pendingScroll.current = entryId || 'section';
    setView(nextView);
  };

  useLayoutEffect(() => {
    if (!pendingScroll.current) return;
    const target = pendingScroll.current === 'section'
      ? sectionRef.current : document.getElementById(pendingScroll.current);
    target?.scrollIntoView({ behavior: 'instant', block: 'start' });
    if (pendingScroll.current !== 'section') target?.focus({ preventScroll: true });
    else sectionRef.current?.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true });
    pendingScroll.current = null;
  }, [view]);

  const viewTabs = (
    <div className="experience-view-tabs" role="tablist" aria-label="Experience view">
      {[['journey', 'Journey', FiGitBranch], ['details', 'All experience', FiList]].map(([id, label, Icon], index) => (
        <button key={id} type="button" role="tab" id={`experience-tab-${id}`}
          aria-controls={`experience-panel-${id}`} aria-selected={view === id} tabIndex={view === id ? 0 : -1}
          onClick={() => changeView(id)} onKeyDown={(event) => {
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
      changeView('details', `experience-detail-${item.id}`);
      return;
    }
    const entryId = item.kind === 'education' ? item.entryId : `leadership-entry-${item.id}`;
    const target = document.getElementById(entryId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target?.focus({ preventScroll: true });
  };

  return (
    <section ref={sectionRef} id="experience" className={`content-section experience-section${immersive ? ' experience-section-immersive' : ''}`} aria-labelledby="experience-heading">
      {!immersive && <SectionHeading id="experience-heading" eyebrow="Experience" title="Engineering work shaped by real users and real constraints." action={editor ? <AddControl label="Add experience" onClick={editor.onAdd} /> : limit ? <Link className="text-link" to="/experience">Full experience <FiArrowUpRight /></Link> : null} />}
      {immersive && <div id="experience-panel-journey" role="tabpanel" aria-labelledby="experience-tab-journey" hidden={view !== 'journey'}>
        {view === 'journey' && <ExperienceTimeline experience={content.experience} education={content.education} toolbar={viewTabs}
          onReadEntry={revealTimelineEntry} />}
      </div>}
      <div id={immersive ? 'experience-panel-details' : undefined} role={immersive ? 'tabpanel' : undefined}
        aria-labelledby={immersive ? 'experience-tab-details' : undefined} hidden={immersive && view !== 'details'} className={immersive ? 'experience-details-panel' : undefined}>
      {immersive && <div className="experience-details-heading"><div><p className="eyebrow">Experience / Work history</p><h2 id={view === 'details' ? 'experience-heading' : undefined}>Work experience.</h2><p>Roles, results, and the details behind each chapter.</p></div>{view === 'details' && viewTabs}</div>}
      <div className="experience-list">
        {detailEntries.map((item, index) => {
          const logoAsset = experienceAssets[item.brand];
          const logo = typeof logoAsset === 'string' ? { light: logoAsset } : logoAsset;
          return (
            <Card id={immersive ? `experience-detail-${item.id}` : `work-entry-${item.id}`} tabIndex={-1} className={`experience-row experience-row-${item.brand || 'unbranded'}`} index={index} key={item.id}>
              {editor && <ItemControls label={`${item.role || 'experience'} at ${item.company || 'company'}`} onEdit={() => editor.onEdit(index)} onDelete={() => editor.onDelete(index)} />}
              <div className="experience-meta">
                {logo?.light && <a className={`experience-logo${logo.dark ? ' has-dark-variant' : ''}`} href={item.url} target="_blank" rel="noreferrer" aria-label={`Visit ${item.company}`}>
                  <img className="experience-logo-light" src={logo.light} alt={`${item.company} logo`} />
                  {logo.dark && (item.brand === 'medidata'
                    ? <span className="experience-logo-dark experience-logo-mask" style={{ '--experience-logo-mask': `url(${logo.dark})` }} aria-hidden="true" />
                    : <img className="experience-logo-dark" src={logo.dark} alt="" aria-hidden="true" />)}
                </a>}
                <span>{item.period}</span><small>{item.location}</small><i>{item.type}</i>
              </div>
              <div className="experience-copy">
                <h3>{item.role}</h3>
                <p className="experience-company"><a href={item.url} target="_blank" rel="noreferrer">{item.company} <FiArrowUpRight aria-hidden="true" /></a></p>
                <p>{item.description}</p>
                {item.highlights?.length > 0 && <ul className="experience-highlights">{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>}
                <SkillTags items={item.skills} />
              </div>
            </Card>
          );
        })}
      </div>
      </div>
    </section>
  );
}
