import React from 'react';
import Reveal from '../ui/Reveal';

export default function SectionHeading({ id, eyebrow, title, description, action }) {
  return (
    <Reveal className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id}>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </Reveal>
  );
}
