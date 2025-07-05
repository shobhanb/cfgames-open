import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  themeToggle = signal<boolean>(false);

  private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    // Initialize theme on service creation
    this.initializeDarkTheme(this.prefersDark.matches);
    this.prefersDark.addEventListener('change', (mediaQuery) =>
      this.initializeDarkTheme(mediaQuery.matches)
    );
  }

  initializeDarkTheme(isDark: boolean) {
    this.themeToggle.set(isDark);
    this.toggleDarkTheme(isDark);
  }

  toggleTheme() {
    const newValue = !this.themeToggle();
    this.themeToggle.set(newValue);
    this.toggleDarkTheme(newValue);
  }

  private toggleDarkTheme(shouldAdd: boolean) {
    document.body.classList.toggle('dark', shouldAdd);
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  }
}
