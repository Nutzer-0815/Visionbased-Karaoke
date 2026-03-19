import { useRef, useState } from 'react';
import { THEMES, type ThemeId } from './theme';

export function ThemeSwitcher({
  theme,
  onChange,
}: {
  theme: ThemeId;
  onChange: (t: ThemeId) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div
      ref={containerRef}
      className="theme-switcher"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="ghost theme-current">
        Design: {current.label}
      </button>
      {open && (
        <div className="theme-menu" role="menu">
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="menuitem"
              className={`theme-option theme-option--${t.id}${t.id === theme ? ' active' : ''}`}
              onClick={() => {
                onChange(t.id);
                setOpen(false);
              }}
            >
              <span className="theme-option-label">{t.label}</span>
              <span className="theme-option-desc">{t.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
