import { Component } from '@angular/core';
import { BaseComponent } from '../../providers/feedback-service/basecomponent';

/**
 * 5 star rating Component
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 5, 2020
 * 
 */
@Component({
  selector: 'stars',
  templateUrl: 'stars.html'
})
export class STARSComponent extends BaseComponent {
    public factors=[];

    // constructor() {}
    
    ngAfterViewInit() {
    }    


    ngOnChanges(){
        super.ngOnChanges();

        this.factors = [];
        if (!this.survey)   return;

        let subs = this.survey.getSubs();
        for (var i=0; i<subs.length; i++) {
            var item = {
                factor: subs[i],
                rating: subs[i].rating
            }
            this.factors.push(item);
        }

    } 

    starClicked(value, item){
        item.factor.rating = value;

        this.createFeedback();
        this.clicked.emit(this.survey);
    }
    
    /*
    * Update feedback for survey
    */
    public createFeedback() {
        let children = [];
        let subs = this.survey.getSubs();
        let survey_data = this.survey.getData();
		let sur_path = survey_data.sur_path + "." + this.survey.getId();
        
        for (var i=0; i<subs.length; i++) {
            if (subs[i].rating>0 && subs[i].rating<6) {
                let child = {
                    sur_id: subs[i].id,
					sur_path: sur_path,
                    type: subs[i].type,
                    rating: subs[i].rating
                }
                children.push(child);
            }
        }

        if (children.length<=0) {
            this.survey.updateFeedback(null);
            return;
        }
        
        let feedback = {
            sur_id: this.survey.getId(),
            children: children
        }
        this.survey.updateFeedback(feedback);
    }

    
}
