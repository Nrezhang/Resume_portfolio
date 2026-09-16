import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ProfileSection from '../components/sections/ProfileSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ExperienceSection from '../components/sections/ExperienceSection';
import SkillsSection from '../components/sections/SkillsSection';
import ContactSection from '../components/sections/ContactSection';
import EducationSection from '../components/sections/EducationSection';
import { useContent } from '../content/ContentContext';
import { portfolioSections, sectionChangeEvent } from '../navigation/portfolioSections';

export default function HomePage() {
  const { content } = useContent();
  const location = useLocation();
  const programmaticScroll = useRef(false);
  const releaseScrollTimer = useRef();

  useLayoutEffect(() => {
    const target = portfolioSections.find((section) => section.path === location.pathname);
    if (location.state?.scrollSync) return undefined;

    window.clearTimeout(releaseScrollTimer.current);
    programmaticScroll.current = Boolean(target);

    const headingId = target?.headingId;
    if (!headingId) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      releaseScrollTimer.current = window.setTimeout(() => {
        programmaticScroll.current = false;
      }, 900);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.state]);

  useEffect(() => {
    let animationFrame;

    const syncRouteToScroll = () => {
      animationFrame = undefined;
      if (programmaticScroll.current) return;

      const header = document.querySelector('.site-header');
      const activationLine = (header?.getBoundingClientRect().bottom || 0) + Math.min(150, window.innerHeight * 0.22);
      let activeSection = portfolioSections[0];

      portfolioSections.forEach((section) => {
        const heading = document.getElementById(section.headingId);
        if (heading && heading.getBoundingClientRect().top <= activationLine) activeSection = section;
      });

      if (window.location.pathname !== activeSection.path) {
        window.history.replaceState(window.history.state, '', activeSection.path);
        window.dispatchEvent(new CustomEvent(sectionChangeEvent, { detail: { path: activeSection.path } }));
      }
    };

    const handleScroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(syncRouteToScroll);
    };

    syncRouteToScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => () => window.clearTimeout(releaseScrollTimer.current), []);

  return (
    <main className="site-shell page-stack">
      <ProfileSection />
      <section className="profile-notes" aria-label="About Henry"><p>{content.profile.welcome}</p><p>{content.profile.personalNote}</p></section>
      <ExperienceSection />
      <ProjectsSection />
      <EducationSection />
      <SkillsSection detailed />
      <ContactSection />
    </main>
  );
}
