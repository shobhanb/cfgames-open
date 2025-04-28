import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelperFunctionsService {
  filterUnique(value: any, index: number, array: any[]) {
    return array.indexOf(value) === index;
  }
  constructor() {}
}
