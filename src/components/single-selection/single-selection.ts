import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { BaseComponent } from '../../providers/feedback-service/basecomponent';
import { SINGLESELECTION } from '../../providers/feedback-service/surveys';

/**
 * Single-selection Component
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 5, 2020
 * 
 */
@Component({
    selector: 'single-selection',
    templateUrl: 'single-selection.html'
})
export class SINGLESELECTIONComponent extends BaseComponent {
	@Input() survey: SINGLESELECTION;

    public selected_factor_id=null;
    public subs_number=0;

    // constructor() {}
    
    ngAfterViewInit() {
    }    

    ngOnChanges(){
        super.ngOnChanges();

        this.selected_factor_id = null;
        if (this.survey.selected_factor)    
            this.selected_factor_id = this.survey.selected_factor.id;
		else
            this.selected_factor_id = null;
            
        this.subs_number = this.survey.getSubs().length;
    } 

    public reAction(item){
        this.survey.selected_factor = item;
        this.selected_factor_id = item.id;

    }

    public createFeedback(item) {
        if (!this.survey.selected_factor) {
            this.survey.updateFeedback(null);
            return;
        }

        let selected_factor = this.survey.selected_factor;
        let child = {
            sur_id: selected_factor.id,
            sur_path: this.survey.getData().sur_path + "." + this.survey.getId(),
            type: selected_factor.type,
            rating: 1
        }
        let children = [child];
    
        let feedback = {
            sur_id: this.survey.getId(),
            children: children
        }
        this.survey.updateFeedback(feedback);
    }
    
    /**
     * This is handleEvent for select factor in TEXT MODE
     * After select factor, this method set selecetion and don't go to next survey directly
     */    
	public singleSelection(data) {
        this.reAction(data);
        this.createFeedback(data);
	}	

    
}
