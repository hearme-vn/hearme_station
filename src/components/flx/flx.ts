import { Component } from '@angular/core';
import { IndexComponent } from '../../providers/feedback-service/basecomponent';

/**
 * CSAT Component for CSAT survey
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 4, 2020
 * 
 */
@Component({
  selector: 'flx',
  templateUrl: 'flx.html'
})
export class FLXComponent extends IndexComponent {
    public lstIndexScales=[];
    // constructor() {}
    
    ngAfterViewInit() {
    }    
    
    ngOnChanges() {
        super.ngOnChanges();

        if (!this.survey)       return;
        let survey_data = this.survey.getData();
        if (survey_data && survey_data.scales) {
            this.lstIndexScales = [];

            if (!survey_data.inverted_order)
                for(let i = 0; i < survey_data.scales; i++) {
                    this.lstIndexScales.push(i);
                }
            else 
                for(let i = survey_data.scales-1; i >=0 ; i--) {
                    this.lstIndexScales.push(i);
                }
        }
    }
}
