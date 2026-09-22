import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowDownRight, FiArrowUpRight } from 'react-icons/fi';
import EducationSection from '../components/sections/EducationSection';
import { useContent } from '../content/ContentContext';

export default function EducationIndexPage() {
  const { content } = useContent();
  return <main className="education-index-page" aria-labelledby="education-page-heading">
    <div className="education-index-meta"><span>Education / {content.profile.name}</span><span>Portfolio</span></div>
    <header className="education-index-hero">
      <h1 id="education-page-heading">Education <FiArrowDownRight aria-hidden="true" /></h1><p>A technical foundation. A wider perspective.</p>
    </header>
    <EducationSection hideHeading />
    <footer className="education-index-footer"><span>From learning to building.</span><nav aria-label="Explore more of my portfolio"><Link to="/projects">Projects <FiArrowUpRight aria-hidden="true" /></Link><Link to="/experience">Experience <FiArrowUpRight aria-hidden="true" /></Link><Link to="/resume">Resume <FiArrowUpRight aria-hidden="true" /></Link></nav></footer>
  </main>;
}
