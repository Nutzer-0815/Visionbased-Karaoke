import { useEffect, useState } from 'react';

export type ThemeId =
  | 'light'
  | 'dark'
  | 'hacker'
  | 'nintendo'
  | 'manga'
  | 'pink'
  | 'wirtshaus';

export const THEMES: { id: ThemeId; label: string; description: string }[] = [
  { id: 'light',     label: 'Standard',   description: 'Hell, klassisch'          },
  { id: 'dark',      label: 'Dunkel',     description: 'Dunkelmodus'              },
  { id: 'hacker',    label: 'Hacker',     description: 'Terminal-Grün, Matrix'    },
  { id: 'nintendo',  label: 'Nintendo',   description: 'Super-Mario-Feeling'      },
  { id: 'manga',     label: 'Manga',      description: 'Japanischer Comic-Stil'   },
  { id: 'pink',      label: 'Pink',       description: 'Rosarot & verspielt'      },
  { id: 'wirtshaus', label: 'Wirtshaus',  description: 'Bayrisch mit Holzoptik'   },
];

const STORAGE_KEY = 'face-karaoke-theme';

export function useTheme(): [ThemeId, (t: ThemeId) => void] {
  const [theme, setTheme] = useState<ThemeId>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    return THEMES.some((t) => t.id === stored) ? (stored as ThemeId) : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return [theme, setTheme];
}
