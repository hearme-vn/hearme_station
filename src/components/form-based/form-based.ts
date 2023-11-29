import { Component } from '@angular/core';
import { BaseComponent } from '../../providers/feedback-service/basecomponent';

/**
 * Formbased Component
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 6, 2020
 * 
 */
@Component({
    selector: 'form-based',
    templateUrl: 'form-based.html'
})
export class FormBasedComponent extends BaseComponent {


    // constructor() {}
    
    ngAfterViewInit() {
    }    

    ngOnChanges() {
        super.ngOnChanges();

        if (this.survey)    this.survey.feedback = {}
    } 

    isFinished() {
        return true;
    }
    
}
