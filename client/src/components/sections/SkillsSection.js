import React from 'react';
import { useContent } from '../../content/ContentContext';
import SectionHeading from '../common/SectionHeading';
import Card from '../ui/Card';
import { AddControl, ItemControls } from '../editor/InlineEditorControls';

export default function SkillsSection({ detailed = false, editor }) {
  const { content } = useContent();
  return (
    <section id="skills" className={`content-section skills-section ${detailed ? 'is-detailed' : ''}`} aria-labelledby="skills-heading">
      <SectionHeading id="skills-heading" eyebrow="Skills" title="A practical toolkit for shipping complete products." description="Technologies I have used in projects, internships, and coursework." action={editor ? <AddControl label="Add skill group" onClick={editor.onAddGroup} /> : null} />
      <div className="skills-grid">
        {content.skills.map((group, index) => (
          <Card className="skill-group" index={index} key={group.group}>
            {editor && <ItemControls label={group.group || 'skill group'} onEdit={() => editor.onEditGroup(index)} onDelete={() => editor.onDeleteGroup(index)} />}
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div className="skill-group-heading"><h3>{group.group}</h3>{editor && <AddControl label={`Add skill to ${group.group}`} onClick={() => editor.onAddSkill(index)} />}</div>
            <ul>{group.items.map((item, skillIndex) => <li key={`${item.name}-${skillIndex}`}>{editor && <ItemControls label={item.name || 'skill'} onEdit={() => editor.onEditSkill(index, skillIndex)} onDelete={() => editor.onDeleteSkill(index, skillIndex)} />}<div><b>{item.name}</b>{detailed && <small>{item.proficiency}%</small>}</div>{detailed && <p>{item.description}</p>}{detailed && <i aria-hidden="true"><span style={{ width: `${item.proficiency}%` }} /></i>}</li>)}</ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
