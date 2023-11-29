import { Component } from '@angular/core';
import { BaseComponent } from '../../providers/feedback-service/basecomponent';

/**
 * Multi-selection Component
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 5, 2020
 * 
 */
@Component({
    selector: 'multi-selection',
    templateUrl: 'multi-selection.html'
})
export class MULTISELECTIONComponent extends BaseComponent {
    public subs_number=0;

    // constructor() {}
    
    ngAfterViewInit() {
    }    


    ngOnChanges() {
        super.ngOnChanges();
        let subs = this.survey.getSubs();
        this.subs_number = subs.length;

        // if (!this.survey || !this.survey.feedback)   return;
        // for (var i=0; i<subs.length; i++) {
        //     if (subs[i].rating==1) {
        //         subs[i].checked = true;
        //     } else {
        //         subs[i].checked = false;
        //     }
        // }
    } 

    public reAction(item) {
        // console.log("Item clicked");
        if (!item["rating"])  {
            item["rating"] = 1;
        } else {
            item["rating"] = 0;
        }
    }

    public createFeedback() {
        let children = [];
        let subs = this.survey.getSubs();
        let sur_path = this.survey.getData().sur_path + "." + this.survey.getId();
        
        for (var i=0; i<subs.length; i++) {
            if (subs[i].rating==1) {
                let child = {
                    sur_id: subs[i].id,
                    sur_path: sur_path,
                    type: subs[i].type,
                    rating: 1
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

    /**
     * This method is call when user click into checkbox (TEXT based selection)
    */
    public checkboxClick() {
        this.createFeedback();
        this.clicked.emit(this.survey);
    }
    
}
