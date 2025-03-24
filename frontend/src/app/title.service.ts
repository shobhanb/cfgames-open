import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private titleSubject = new BehaviorSubject<string>('Default Title');

  title$ = this.titleSubject.asObservable();

  setTitle(newTitle: string) {
    this.titleSubject.next(newTitle);
  }

  constructor() { }
}
