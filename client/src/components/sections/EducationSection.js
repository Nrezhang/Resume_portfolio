import React, { useState } from 'react';
import { FiArrowUpRight, FiPlus } from 'react-icons/fi';
import { useContent } from '../../content/ContentContext';
import { educationAssets, experienceAssets } from '../../content/assets';
import SectionHeading from '../common/SectionHeading';
import { AddControl, ItemControls } from '../editor/InlineEditorControls';
import '../../styles/education.css';

function LeadershipLogo({ item }) {
  const asset = experienceAssets[item.brand];
  const logos = typeof asset === 'string' ? { light: asset } : asset;

  if (!logos?.light) return null;

  return (
    <a
      className={`education-leadership-logo education-leadership-logo-${item.brand || 'default'}${logos.dark ? ' has-dark-variant' : ''}`}
      href={item.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Visit ${item.company}`}
    >
      <img className="education-leadership-logo-light" src={logos.light} alt="" />
      {logos.dark && <img className="education-leadership-logo-dark" src={logos.dark} alt="" />}
    </a>
  );
}

export default function EducationSection({ editor, hideHeading = false }) {
  const { content } = useContent();
  const [expandedSchools, setExpandedSchools] = useState({});
  const [expandedCoursework, setExpandedCoursework] = useState({});

  return (
    <section id="education" className="content-section school-index" aria-labelledby="education-heading">
      {hideHeading ? <h2 id="education-heading" className="school-index-sr-only">Education</h2> : <SectionHeading id="education-heading" eyebrow="Education" title="Learning across disciplines and cities." action={editor ? <AddControl label="Add education" onClick={editor.onAdd} /> : null} />}
      <div className="school-index-list">
        {content.education.map((education, index) => {
          const key = education.id || `school-${index}`;
          const expanded = expandedSchools[key] ?? (index === 0 || Boolean(editor));
          const panelId = `school-panel-${key}`;
          return (
          <article id={`education-entry-${education.id}`} tabIndex={-1} className={`school-index-entry school-index-${education.brand || 'default'}`} key={education.id || `${education.school}-${index}`} onFocus={(event) => {
            // The experience timeline focuses these anchors when opening a full entry.
            if (event.target === event.currentTarget) setExpandedSchools((current) => ({ ...current, [key]: true }));
          }} data-expanded={expanded}>
            {editor && <ItemControls label={education.school || 'education'} onEdit={() => editor.onEdit(index)} onDelete={() => editor.onDelete(index)} />}
            <h3 className="school-index-header">
              <button type="button" className="school-index-trigger" aria-expanded={expanded} aria-controls={panelId} id={`school-toggle-${key}`} onClick={() => setExpandedSchools((current) => ({ ...current, [key]: !expanded }))}>
                <span className="school-index-logo">{educationAssets[education.brand] && <img src={educationAssets[education.brand]} alt={`${education.school} logo`} />}</span>
                <span className="school-index-title"><span className="school-index-name">{education.school}</span><span className="school-index-degree">{education.degree}</span></span>
                <FiPlus className="school-index-toggle" aria-hidden="true" />
              </button>
            </h3>
            <div className="school-index-body" id={panelId} role="region" aria-labelledby={`school-toggle-${key}`} hidden={!expanded}>
              <div className="school-index-row">
                <h4>Overview</h4>
                <div>
                  <div className="school-index-facts"><span>{education.locations}</span>{education.url && <a href={education.url} target="_blank" rel="noreferrer">Visit school <FiArrowUpRight aria-hidden="true" /></a>}</div>
                  <p className="school-index-description">{education.description}</p>
                </div>
              </div>
              {education.leadership?.length > 0 && (
                <section className="school-index-row school-index-leadership" aria-label={`${education.school} leadership and campus involvement`}>
                  <h4>Campus leadership</h4>
                  <div className="school-index-leadership-grid">
                    {education.leadership.map((item) => (
                      <article id={`leadership-entry-${item.id}`} tabIndex={-1} className="school-index-role" key={item.id}>
                        <LeadershipLogo item={item} />
                        <div className="school-index-role-copy">
                          <h5>{item.role}</h5>
                          <p className="school-index-company">
                            <a href={item.url} target="_blank" rel="noreferrer">{item.company} <FiArrowUpRight aria-hidden="true" /></a>
                          </p>
                          <p className="school-index-role-meta">{item.location}</p>
                        </div>
                        <p className="school-index-role-description">{item.description}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              {education.coursework?.length > 0 && (
                <div className="school-index-row school-index-coursework">
                  <h4>Coursework</h4>
                  <div>
                    <button type="button" className="school-index-coursework-trigger"
                      aria-expanded={Boolean(expandedCoursework[key])}
                      aria-controls={`school-coursework-${key}`}
                      aria-label={`${expandedCoursework[key] ? 'Hide' : 'View'} coursework for ${education.school}`}
                      onClick={() => setExpandedCoursework((current) => ({ ...current, [key]: !current[key] }))}>
                      <span>{expandedCoursework[key] ? 'Hide coursework' : 'View coursework'} <span className="school-index-coursework-count">({education.coursework.length})</span></span>
                      <FiPlus aria-hidden="true" />
                    </button>
                    <ul id={`school-coursework-${key}`} hidden={!expandedCoursework[key]}>{education.coursework.map((course) => <li key={course}>{course}</li>)}</ul>
                  </div>
                </div>
              )}
            </div>
          </article>
        );})}
      </div>
    </section>
  );
}
