import { Component } from '@angular/core';
// import { SurveyINF } from '../../providers/feedback-service/surveys';
import { IndexComponent } from '../../providers/feedback-service/basecomponent';

/**
 * CSAT Component for CSAT survey
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 1, 2020
 * 
 */
@Component({
  selector: 'csat',
  templateUrl: 'csat.html'
})
export class CSATComponent extends IndexComponent {
    private csat_level_keys = [
        "RATING_unhappy",
        "RATING_accepted",
        "RATING_good",
        "RATING_excellent",
        "RATING_inloved"
    ];

    // constructor() {}
    
    ngAfterViewInit() {
    }    
    
}
