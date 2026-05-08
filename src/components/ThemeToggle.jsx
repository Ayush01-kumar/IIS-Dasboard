import { MoonStar, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="glass-card inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <MoonStar size={16} />}
      <span>{isDark ? 'Light' : 'Dark'} Mode</span>
    </button>
  );
}
