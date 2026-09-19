import React from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import { useContent } from '../../content/ContentContext';
import { educationAssets, experienceAssets } from '../../content/assets';
import SectionHeading from '../common/SectionHeading';
import { AddControl, ItemControls } from '../editor/InlineEditorControls';

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

export default function EducationSection({ editor }) {
  const { content } = useContent();

  return (
    <section id="education" className="content-section education-section" aria-labelledby="education-heading">
      <SectionHeading id="education-heading" eyebrow="Education" title="Learning across disciplines and cities." action={editor ? <AddControl label="Add education" onClick={editor.onAdd} /> : null} />
      <div className="education-list">
        {content.education.map((education, index) => (
          <article id={`education-entry-${education.id}`} tabIndex={-1} className={`education-entry education-entry-${education.brand || 'default'}`} key={education.id || `${education.school}-${index}`}>
            {editor && <ItemControls label={education.school || 'education'} onEdit={() => editor.onEdit(index)} onDelete={() => editor.onDelete(index)} />}
            <div className="education-meta">
              {educationAssets[education.brand] && <div className="education-logo"><img src={educationAssets[education.brand]} alt={`${education.school} logo`} /></div>}
              <span>{education.period}</span><small>{education.locations}</small>{education.gpa && <i>GPA {education.gpa}</i>}
            </div>
            <div className="education-copy">
              <h3>{education.url ? <a href={education.url} target="_blank" rel="noreferrer">{education.school}</a> : education.school}</h3>
              <p className="education-degree">{education.degree}</p>
              <p>{education.description}</p>
              {education.coursework.length > 0 && <div className="coursework">{education.coursework.map((course) => <span key={course}>{course}</span>)}</div>}
              {education.leadership?.length > 0 && (
                <section className="education-leadership" aria-label={`${education.school} leadership and campus involvement`}>
                  <h4>Leadership &amp; Campus Involvement</h4>
                  <div className="education-leadership-grid">
                    {education.leadership.map((item) => (
                      <article id={`leadership-entry-${item.id}`} tabIndex={-1} className={`education-leadership-item education-leadership-item-${item.brand || 'default'}`} key={item.id}>
                        <LeadershipLogo item={item} />
                        <div className="education-leadership-copy">
                          <h5>{item.role}</h5>
                          <p className="education-leadership-company">
                            <a href={item.url} target="_blank" rel="noreferrer">{item.company} <FiArrowUpRight aria-hidden="true" /></a>
                          </p>
                          <p className="education-leadership-meta">{item.period}<span aria-hidden="true">·</span>{item.location}</p>
                          <p className="education-leadership-description">{item.description}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
