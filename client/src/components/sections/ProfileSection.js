import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiDownload, FiMail } from 'react-icons/fi';
import { imageAssets, documentAssets } from '../../content/assets';
import { useContent } from '../../content/ContentContext';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import { motion, useReducedMotion } from 'motion/react';
import Badge from '../ui/Badge';

export default function ProfileSection({ compact = false }) {
  const { content } = useContent();
  const { profile } = content;
  const reduceMotion = useReducedMotion();

  return (
    <section id="profile" className={`profile-section ${compact ? 'compact' : ''}`} aria-labelledby="profile-heading">
      <Reveal className="profile-copy">
        <p className="eyebrow">{profile.eyebrow}</p>
        <h1 id="profile-heading">{profile.name}</h1>
        <p className="profile-headline">{profile.headline}</p>
        <p className="profile-bio">{profile.bio}</p>
        <div className="role-list" aria-label="Professional roles">{profile.roles.map((role) => <Badge key={role}>{role}</Badge>)}</div>
        <div className="profile-actions">
          <Button asChild><Link to="/projects">View projects <FiArrowUpRight /></Link></Button>
          <Button asChild variant="secondary"><a href={documentAssets.resume} target="_blank" rel="noreferrer"><FiDownload /> Resume</a></Button>
          <a className="text-link" href={`mailto:${profile.email}`}><FiMail /> {profile.email}</a>
        </div>
      </Reveal>
      <motion.div className="profile-media" initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
        <div className="portrait-wrap"><img src={imageAssets[profile.image]} alt={profile.name} /></div>
        <div className="availability"><i aria-hidden="true" /><span>{profile.availability}</span></div>
        <dl className="profile-facts">
          <div><dt>Based in</dt><dd>{profile.location}</dd></div>
          <div><dt>Focus</dt><dd>AI products · Full stack</dd></div>
        </dl>
      </motion.div>
    </section>
  );
}
