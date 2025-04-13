import { Component, input } from '@angular/core';
import { DockComponent } from './dock/dock.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';

@Component({
  selector: 'app-pages',
  imports: [DockComponent, NavMenuComponent],
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.css',
})
export class PagesComponent {}
