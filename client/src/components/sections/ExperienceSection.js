import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { useContent } from '../../content/ContentContext';
import SectionHeading from '../common/SectionHeading';
import SkillTags from '../common/SkillTags';
import Card from '../ui/Card';
import { AddControl, ItemControls } from '../editor/InlineEditorControls';
import { experienceAssets } from '../../content/assets';

export default function ExperienceSection({ limit, editor }) {
  const { content } = useContent();
  const experience = limit ? content.experience.slice(0, limit) : content.experience;

  return (
    <section id="experience" className="content-section experience-section" aria-labelledby="experience-heading">
      <SectionHeading id="experience-heading" eyebrow="Experience" title="Engineering work shaped by real users and real constraints." action={editor ? <AddControl label="Add experience" onClick={editor.onAdd} /> : limit ? <Link className="text-link" to="/experience">Full experience <FiArrowUpRight /></Link> : null} />
      <div className="experience-list">
        {experience.map((item, index) => {
          const logoAsset = experienceAssets[item.brand];
          const logo = typeof logoAsset === 'string' ? { light: logoAsset } : logoAsset;
          return (
            <Card className={`experience-row experience-row-${item.brand || 'unbranded'}`} index={index} key={item.id}>
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
    </section>
  );
}
