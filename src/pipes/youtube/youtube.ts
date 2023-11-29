import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
/**
 * Generated class for the YoutubePipe pipe.
 *
 */
@Pipe({
  name: 'youtube',
})
export class Youtube implements PipeTransform {
  constructor(private sanitizer: DomSanitizer){

  }
  transform(value: string, ...args) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
