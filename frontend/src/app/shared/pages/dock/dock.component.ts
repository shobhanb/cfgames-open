import { Component, inject } from '@angular/core';
import { DockService } from './dock.service';
import { PublicDockComponent } from './public-dock/public-dock.component';
import { PrivateDockComponent } from './private-dock/private-dock.component';
import { AdminDockComponent } from './admin-dock/admin-dock.component';

@Component({
  selector: 'app-dock',
  imports: [PublicDockComponent, PrivateDockComponent, AdminDockComponent],
  templateUrl: './dock.component.html',
  styleUrl: './dock.component.css',
})
export class DockComponent {
  dockService = inject(DockService);
}
