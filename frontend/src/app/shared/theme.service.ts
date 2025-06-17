import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'cfgames-theme';
  private readonly THEMES = ['light', 'dark'] as const;

  currentTheme = signal<(typeof this.THEMES)[number]>(
    (localStorage.getItem(this.THEME_KEY) as (typeof this.THEMES)[number]) ||
      this.THEMES[0]
  );

  isDark = computed(() => this.currentTheme() === 'dark');

  setTheme(theme: (typeof this.THEMES)[number]) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.currentTheme.set(theme);
  }

  toggleTheme() {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  constructor() {
    this.setTheme(this.currentTheme());
  }
}
