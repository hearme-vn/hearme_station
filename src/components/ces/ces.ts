import { Component } from '@angular/core';
import { IndexComponent } from '../../providers/feedback-service/basecomponent';

/**
 * CSAT Component for CSAT survey
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 3, 2020
 * 
 */
@Component({
  selector: 'ces',
  templateUrl: 'ces.html'
})
export class CESComponent extends IndexComponent {
    private ces_level_keys = [
        "RATING_CES_extremely_difficult",
        "RATING_CES_very_difficult",
        "RATING_CES_fairly_difficult",
        "RATING_CES_neither",
        "RATING_CES_fairly_easy",
        "RATING_CES_very_easy", 
        "RATING_CES_extremely_easy"
    ];

    // constructor() {}
    
    ngAfterViewInit() {

    }    
    
}
