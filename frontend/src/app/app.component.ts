import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private router: Router, private swUpdate: SwUpdate) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (document.activeElement instanceof HTMLElement) {
          // This is to get rid of the aria-hidden warning
          document.activeElement.blur();
        }
      }
    });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(() => {
        if (confirm('A new version is available. Reload?')) {
          window.location.reload();
        }
      });
    }
  }
}
