import { Component } from '@angular/core';
import { IndexComponent } from '../../providers/feedback-service/basecomponent';

/**
 * CSAT Component for CSAT survey
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 3, 2020
 * 
 */
@Component({
  selector: 'nps',
  templateUrl: 'nps.html'
})
export class NPSComponent extends IndexComponent {
    private rating_levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // constructor() {}
    
    ngAfterViewInit() {
    }    
    
}
