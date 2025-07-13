import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  themeToggle = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      this.initializeDarkTheme(saved === 'dark');
    } else {
      this.initializeDarkTheme(false);
    }
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
