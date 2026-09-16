import React from 'react';
import Badge from '../ui/Badge';

export default function SkillTags({ items }) {
  return <div className="skill-tags">{items.map((item) => {
    const label = typeof item === 'string' ? item : item.name;
    return <Badge key={label}>{label}</Badge>;
  })}</div>;
}
