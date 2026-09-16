import { useEffect, useState } from 'react';

const STORAGE_KEY = 'portfolio-theme';
const preferences = ['system', 'light', 'dark'];

function getStoredPreference() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return preferences.includes(stored) ? stored : 'system';
}

function resolveTheme(preference) {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(preference) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = resolveTheme(preference);
  root.style.colorScheme = root.dataset.theme;
}

export default function useTheme() {
  const [preference, setPreference] = useState(getStoredPreference);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (preference === 'system') applyTheme('system');
    };

    applyTheme(preference);
    window.localStorage.setItem(STORAGE_KEY, preference);
    media.addEventListener('change', handleSystemChange);
    return () => media.removeEventListener('change', handleSystemChange);
  }, [preference]);

  const cycleTheme = () => {
    const index = preferences.indexOf(preference);
    setPreference(preferences[(index + 1) % preferences.length]);
  };

  return { preference, cycleTheme };
}
