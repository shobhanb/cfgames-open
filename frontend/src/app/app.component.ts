import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, IonLoading } from '@ionic/angular/standalone';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { ToastComponent } from './shared/toast/toast.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonLoading, IonApp, IonRouterOutlet, ToastComponent],
})
export class AppComponent {
  private swUpdate = inject(SwUpdate);
  loading = false;

  constructor(private router: Router) {
    // Listen for service worker updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(
          filter(
            (evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'
          )
        )
        .subscribe(() => {
          if (confirm('A new version is available. Reload to update?')) {
            document.location.reload();
          }
        });
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Disable loading spinner for /auth routes
        if (event.url.startsWith('/auth')) {
          this.loading = false;
        } else {
          this.loading = true;
        }
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading = false;
      }
    });
  }
}
