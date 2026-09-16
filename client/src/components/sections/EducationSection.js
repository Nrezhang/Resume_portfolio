import React from 'react';
import { useContent } from '../../content/ContentContext';
import SectionHeading from '../common/SectionHeading';
import { AddControl, ItemControls } from '../editor/InlineEditorControls';

export default function EducationSection({ editor }) {
  const { content } = useContent();

  return (
    <section id="education" className="content-section education-section" aria-labelledby="education-heading">
      <SectionHeading id="education-heading" eyebrow="Education" title="Learning across disciplines and cities." action={editor ? <AddControl label="Add education" onClick={editor.onAdd} /> : null} />
      <div className="education-list">
        {content.education.map((education, index) => (
          <article className="education-entry" key={education.id || `${education.school}-${index}`}>
            {editor && <ItemControls label={education.school || 'education'} onEdit={() => editor.onEdit(index)} onDelete={() => editor.onDelete(index)} />}
            <div className="education-meta"><span>{education.period}</span><b>{education.school}</b><small>{education.locations}</small>{education.gpa && <i>GPA {education.gpa}</i>}</div>
            <div className="education-copy"><h3>{education.degree}</h3><p>{education.description}</p><div className="coursework">{education.coursework.map((course) => <span key={course}>{course}</span>)}</div></div>
          </article>
        ))}
      </div>
    </section>
  );
}
