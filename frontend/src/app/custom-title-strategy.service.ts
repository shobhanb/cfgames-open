import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TitleService } from './title.service';

@Injectable({
  providedIn: 'root'
})
export class CustomTitleStrategyService  extends TitleStrategy {

  constructor(private title: Title, private titleService: TitleService) {
    super();
   }

   override updateTitle(snapshot: RouterStateSnapshot): void {
       const title = this.buildTitle(snapshot);
       if (title) {
        this.title.setTitle(title);
        this.titleService.setTitle(title);
       }
   }
}
