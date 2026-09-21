import React, { useEffect, useState } from 'react';
import { useContent } from '../../content/ContentContext';

export const heroDefaults = {
  heroRole: 'Software engineer',
  heroDescription: 'building AI systems, data products, and useful software.',
};

function TypedRole({ text, animate }) {
  const [visible, setVisible] = useState(text);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    const start = () => {
      clearTimeout(timer);
      if (!animate || media.matches) { setVisible(text); setTyping(false); return; }
      let length = 0;
      setVisible('');
      setTyping(true);
      const tick = () => {
        length += 1;
        setVisible(text.slice(0, length));
        if (length < text.length) timer = setTimeout(tick, 70);
        else setTyping(false);
      };
      timer = setTimeout(tick, 300);
    };
    start();
    media.addEventListener('change', start);
    return () => { clearTimeout(timer); media.removeEventListener('change', start); };
  }, [text, animate]);
  return <span className="typed-role">
    <span className="role-reserved">{text}</span>
    <span className={`role-animated ${typing ? 'is-typing' : ''}`} aria-hidden="true">{visible}</span>
  </span>;
}

export default function HomeIdentity({ animate = true }) {
  const { content } = useContent();
  const role = content.profile.heroRole || heroDefaults.heroRole;
  const description = content.profile.heroDescription || heroDefaults.heroDescription;
  return <header className="home-identity">
    <p className="identity-eyebrow">Engineer / Builder</p>
    <h1>{content.profile.name}</h1>
    <p className="identity-description"><TypedRole text={role} animate={animate} />{' '}{description}</p>
    <ul className="identity-tags" aria-label="Areas of focus"><li>AI systems</li><li>Product engineering</li><li>Technical leadership</li></ul>
  </header>;
}
