import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'portfolio-theme';
const preferences = ['system', 'light', 'dark'];
let fallbackTransitionTimer;

function getStoredPreference() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return preferences.includes(stored) ? stored : 'dark';
  } catch { return 'dark'; }
}

function resolveTheme(preference) {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(preference, animate = false) {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const update = () => {
    root.dataset.themePreference = preference;
    root.dataset.theme = resolveTheme(preference);
    root.style.colorScheme = root.dataset.theme;
  };
  if (!animate || reduceMotion) return update();

  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(update);
    return;
  }

  // Older browsers use a small, surface-only fallback rather than animating
  // every descendant, which can create a distracting flash.
  window.clearTimeout(fallbackTransitionTimer);
  root.classList.add('theme-transition');
  // Flush the transition class first so the following palette update animates
  // without delaying the selected appearance state.
  void root.offsetWidth;
  update();
  fallbackTransitionTimer = window.setTimeout(() => root.classList.remove('theme-transition'), 380);
}

export default function useTheme() {
  const [preference, setPreference] = useState(getStoredPreference);
  const hasAppliedInitialTheme = useRef(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (preference === 'system') applyTheme('system');
    };

    applyTheme(preference, hasAppliedInitialTheme.current);
    hasAppliedInitialTheme.current = true;
    try { window.localStorage.setItem(STORAGE_KEY, preference); } catch { /* Theme still works without storage. */ }
    media.addEventListener('change', handleSystemChange);
    return () => media.removeEventListener('change', handleSystemChange);
  }, [preference]);

  const cycleTheme = () => {
    const index = preferences.indexOf(preference);
    setPreference(preferences[(index + 1) % preferences.length]);
  };

  return { preference, setPreference, cycleTheme };
}
