import { Injectable } from '@angular/core';

export type Theme = 'dark' | 'light' | 'midnight';

export const THEMES: { id: Theme; label: string; icon: string; bg: string }[] = [
  { id: 'dark',     label: 'Dark',     icon: '🌙', bg: '#1e1e1e' },
  { id: 'light',    label: 'Light',    icon: '☀️',  bg: '#f5f5f5' },
  { id: 'midnight', label: 'Midnight', icon: '✦',  bg: '#000000' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'codehub_theme';

  get current(): Theme {
    const saved = localStorage.getItem(this.KEY) as Theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  private setClass(theme: Theme): void {
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-midnight');
    document.body.classList.add('theme-' + theme);
  }

  apply(theme: Theme): void {
    this.setClass(theme);
    localStorage.setItem(this.KEY, theme);
  }

  toggle(): void {
    this.apply(this.current === 'light' ? 'dark' : 'light');
  }

  init(): void {
    // Apply without writing localStorage so system-follow stays active until user picks manually
    this.setClass(this.current);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(this.KEY)) {
        this.setClass(e.matches ? 'dark' : 'light');
      }
    });
  }
}
