import { Injectable, input, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TitleService {

  pageTitle = signal('Default title') 

  constructor() { }
}
