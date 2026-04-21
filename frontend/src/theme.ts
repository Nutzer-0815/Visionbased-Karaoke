import { useEffect, useState } from 'react';

export type ThemeId =
  | 'light'
  | 'dark'
  | 'hacker'
  | 'nintendo'
  | 'manga'
  | 'pink'
  | 'wirtshaus'
  | 'anime'
  | 'dungeon'
  | 'ultramodern'
  | 'y2k'
  | 'vaporwave'
  | 'lava';

export const THEMES: { id: ThemeId; label: string; description: string }[] = [
  { id: 'light',       label: 'Standard',      description: 'Hell, klassisch'             },
  { id: 'dark',        label: 'Dunkel',        description: 'Dunkelmodus'                 },
  { id: 'hacker',      label: 'Hacker',        description: 'Terminal-Grün, Matrix'       },
  { id: 'nintendo',    label: 'Nintendo',      description: 'Super-Mario-Feeling'         },
  { id: 'manga',       label: 'Manga',         description: 'Japanischer Comic-Stil'      },
  { id: 'pink',        label: 'Pink',          description: 'Rosarot & verspielt'         },
  { id: 'wirtshaus',   label: 'Wirtshaus',     description: 'Bayrisch mit Holzoptik'      },
  { id: 'anime',       label: 'Anime',         description: 'Kawaii neon-pink, sparkly'   },
  { id: 'dungeon',     label: 'Dungeon',       description: 'Gruseldunkel, Blut & Stein'  },
  { id: 'ultramodern', label: 'Ultra Modern',  description: 'Glassmorphism, Gradient-Mesh'},
  { id: 'y2k',         label: 'Y2K / Aqua',   description: '2000er Glanz, Windows-XP'    },
  { id: 'vaporwave',   label: 'Vaporwave',     description: 'Synthwave-Grid, Lila & Cyan' },
  { id: 'lava',        label: 'Lava',          description: 'Vulkan-Glut, tiefes Rot'     },
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
