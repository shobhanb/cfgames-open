import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  themeToggle = signal<boolean>(false);

  private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      this.initializeDarkTheme(saved === 'dark');
    } else {
      this.initializeDarkTheme(this.prefersDark.matches);
    }
    this.prefersDark.addEventListener('change', (mediaQuery) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        this.initializeDarkTheme(mediaQuery.matches);
      }
    });
  }

  initializeDarkTheme(isDark: boolean) {
    this.themeToggle.set(isDark);
    this.toggleDarkTheme(isDark);
  }

  toggleTheme() {
    const newValue = !this.themeToggle();
    this.themeToggle.set(newValue);
    this.toggleDarkTheme(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  }

  private toggleDarkTheme(shouldAdd: boolean) {
    document.body.classList.toggle('dark', shouldAdd);
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  }
}
