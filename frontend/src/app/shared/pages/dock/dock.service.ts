import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DockService {
  showDock = signal<'public' | 'private' | 'admin'>('public');

  setPublic() {
    this.showDock.set('public');
  }

  setPrivate() {
    this.showDock.set('private');
  }

  setAdmin() {
    this.showDock.set('admin');
  }

  constructor() {}
}
