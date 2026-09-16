import React from 'react';
import ContactSection from '../components/sections/ContactSection';
import { useContent } from '../content/ContentContext';
import Card from '../components/ui/Card';

export default function ContactPage() {
  const { content } = useContent();
  return (
    <main className="site-shell page-stack page-top contact-page">
      <ContactSection />
      <div className="social-row"><Card as="a" index={0} href={content.profile.github} target="_blank" rel="noreferrer"><span>Code</span><b>GitHub</b></Card><Card as="a" index={1} href={content.profile.linkedin} target="_blank" rel="noreferrer"><span>Connect</span><b>LinkedIn</b></Card><Card as="a" index={2} href={`mailto:${content.profile.email}`}><span>Email</span><b>{content.profile.email}</b></Card></div>
    </main>
  );
}
