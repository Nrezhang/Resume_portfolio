import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowDownRight, FiArrowUpRight, FiPlus } from 'react-icons/fi';
import { useContent } from '../../content/ContentContext';
import '../../styles/about.css';

function IndexEntry({ number, title, subtitle, children, open = false }) {
  return (
    <details className="about-index-entry" open={open}>
      <summary>
        <span className="about-index-number" aria-hidden="true">{number}</span>
        <h2><span className="about-index-title">{title}</span><span className="about-index-subtitle">{subtitle}</span></h2>
        <FiPlus className="about-index-toggle" aria-hidden="true" />
      </summary>
      <div className="about-index-detail">{children}</div>
    </details>
  );
}

function IndexStat({ value, children, language }) {
  return <div className="about-index-stat"><span lang={language}>{value}</span><small>{children}</small></div>;
}

export default function AboutIndex() {
  const { content } = useContent();
  const { profile, education } = content;
  const primarySchool = education[0];

  return (
    <main className="about-index-page" aria-labelledby="profile-heading">
      <div className="about-index-meta"><span>About / {profile.name}</span><span>Portfolio</span></div>
      <header className="about-index-hero">
        <div className="about-index-intro">
          <h1 id="profile-heading">I'm {profile.name}. <FiArrowDownRight aria-hidden="true" /></h1>
          <p>{profile.availability}.</p>
          <p>A builder, a team leader,<br />{' '}and a little more.</p>
        </div>
      </header>

      <section className="about-index-list" aria-label="Get to know me">
        <IndexEntry number="01" title="Engineering" subtitle="AI systems · Data · Full stack" open>
          <div className="about-index-copy">
            <p>Production AI and data systems at Treasury. Retrieval over 40,000+ medical records at Medidata. Enterprise AI prototypes at Microsoft.</p>
            <Link to="/projects">Explore my projects <FiArrowUpRight aria-hidden="true" /></Link>
          </div>
          <IndexStat value="40k+">medical records</IndexStat>
        </IndexEntry>

        <IndexEntry number="02" title="Program leadership" subtitle="60+ application teams · Trianz">
          <div className="about-index-copy">
            <p>Coordinated global application teams through an AWS migration at Trianz. Led three engineers at Inyo to bring an AI product to life.</p>
            <Link to="/experience">Explore my experience <FiArrowUpRight aria-hidden="true" /></Link>
          </div>
          <IndexStat value="60+">application teams</IndexStat>
        </IndexEntry>

        <IndexEntry number="03" title="Education" subtitle={primarySchool ? `${primarySchool.school} · ${primarySchool.degree}` : 'Learning across disciplines and cities'}>
          <div className="about-index-copy about-index-schools">
            {education.map((school) => (
              <article key={school.id || school.school}>
                <h3>{school.school}</h3>
                <p>{school.degree}</p>
                {school.locations && <small>{school.locations}</small>}
              </article>
            ))}
            <Link to="/education">Education &amp; campus life <FiArrowUpRight aria-hidden="true" /></Link>
          </div>
          {primarySchool?.brand === 'nyu' && <IndexStat value="NYU">Shanghai / New York</IndexStat>}
        </IndexEntry>

        <IndexEntry number="04" title="Beyond the résumé" subtitle="Across cultures · Sports · Mentoring">
          <div className="about-index-copy"><p>{profile.personalNote}</p></div>
          <IndexStat value="你好" language="zh">Hello</IndexStat>
        </IndexEntry>
      </section>

      <footer className="about-index-footer">
        <span>Curious? Keep going.</span>
        <nav aria-label="Explore more of my portfolio">
          <Link to="/projects">Projects <FiArrowUpRight aria-hidden="true" /></Link>
          <Link to="/experience">Experience <FiArrowUpRight aria-hidden="true" /></Link>
          <Link to="/resume">Resume <FiArrowUpRight aria-hidden="true" /></Link>
        </nav>
      </footer>
    </main>
  );
}
