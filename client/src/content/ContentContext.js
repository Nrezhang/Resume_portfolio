import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import defaultContent from './defaultContent.json';
import { portfolioApi } from '../services/api';

const ContentContext = createContext(null);

export function normalizeContent(content) {
  if (!content) return content;
  const education = Array.isArray(content.education)
    ? content.education
    : [{ id: 'nyu-shanghai', ...content.education }];
  return { ...content, education };
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => normalizeContent(defaultContent));
  const [source, setSource] = useState('local');

  useEffect(() => {
    if (typeof fetch !== 'function') return undefined;
    let active = true;
    portfolioApi.getContent()
      .then((remoteContent) => {
        if (active) {
          setContent(normalizeContent(remoteContent));
          setSource('api');
        }
      })
      .catch(() => {
        if (active) setSource('local');
      });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({ content, setContent, source }), [content, source]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function DraftContentProvider({ content, setContent, children }) {
  const value = useMemo(() => ({ content: normalizeContent(content), setContent, source: 'draft' }), [content, setContent]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useContent must be used inside ContentProvider.');
  return value;
}
