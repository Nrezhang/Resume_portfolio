import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { useContent } from '../../content/ContentContext';
import SectionHeading from '../common/SectionHeading';
import SkillTags from '../common/SkillTags';
import Card from '../ui/Card';
import { AddControl, ItemControls } from '../editor/InlineEditorControls';

export default function ExperienceSection({ limit, editor }) {
  const { content } = useContent();
  const experience = limit ? content.experience.slice(0, limit) : content.experience;

  return (
    <section id="experience" className="content-section experience-section" aria-labelledby="experience-heading">
      <SectionHeading id="experience-heading" eyebrow="Experience" title="Engineering work shaped by real users and real constraints." action={editor ? <AddControl label="Add experience" onClick={editor.onAdd} /> : limit ? <Link className="text-link" to="/experience">Full experience <FiArrowUpRight /></Link> : null} />
      <div className="experience-list">
        {experience.map((item, index) => (
          <Card className="experience-row" index={index} key={item.id}>
            {editor && <ItemControls label={`${item.role || 'experience'} at ${item.company || 'company'}`} onEdit={() => editor.onEdit(index)} onDelete={() => editor.onDelete(index)} />}
            <div className="experience-meta"><span>{item.period}</span><a href={item.url} target="_blank" rel="noreferrer"><b>{item.company}</b></a><small>{item.location}</small><i>{item.type}</i></div>
            <div className="experience-copy"><h3>{item.role}</h3><p>{item.description}</p><SkillTags items={item.skills} /></div>
          </Card>
        ))}
      </div>
    </section>
  );
}
