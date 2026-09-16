import React from 'react';
import ExperienceSection from '../components/sections/ExperienceSection';
import { useContent } from '../content/ContentContext';

export default function ExperiencePage() {
  const { content } = useContent();
  const education = content.education[0];
  return (
    <main className="site-shell page-stack page-top">
      <ExperienceSection />
      <section className="education-band"><p className="eyebrow">Education</p><div><h2>{education.degree}</h2><h3>{education.school}</h3><span>{education.period} · {education.locations} · GPA {education.gpa}</span><p>{education.description}</p><div className="coursework">{education.coursework.map((course) => <span key={course}>{course}</span>)}</div></div></section>
    </main>
  );
}
