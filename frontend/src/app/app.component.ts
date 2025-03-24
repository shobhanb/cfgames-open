import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { TitleService } from './title.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, AsyncPipe],
})
export class AppComponent implements OnInit {
  title$ = this.titleService.title$;

  constructor( private titleService: TitleService) { }

  ngOnInit(): void {
  }
}
