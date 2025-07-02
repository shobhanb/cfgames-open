import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'teamName',
})
export class TeamNamePipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    // Remove leading numbers, spaces, and periods
    return value.replace(/^\s*\d+\.?\s*/, '');
  }
}
