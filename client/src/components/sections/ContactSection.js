import React, { useState } from 'react';
import { FiCheck, FiCopy, FiDownload, FiMail } from 'react-icons/fi';
import { documentAssets } from '../../content/assets';
import { useContent } from '../../content/ContentContext';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';

export default function ContactSection() {
  const { content } = useContent();
  const { profile } = content;
  const { contact } = content;
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Reveal as="section" id="contact" className="contact-panel" aria-labelledby="contact-heading">
      <div><p className="eyebrow">{contact.eyebrow}</p><h2 id="contact-heading">{contact.headline}</h2><p>{contact.description}</p><small>{contact.note}</small></div>
      <div className="contact-actions">
        <Button asChild variant="accent"><a href={`mailto:${profile.email}`}><FiMail /> Send an email</a></Button>
        <Button asChild variant="inverse"><a href={documentAssets.resume} target="_blank" rel="noreferrer"><FiDownload /> View resume</a></Button>
        <Button variant="inverse" type="button" onClick={copyEmail}>{copied ? <FiCheck /> : <FiCopy />} {copied ? 'Copied' : 'Copy email'}</Button>
      </div>
    </Reveal>
  );
}
