import { Component, Input } from '@angular/core';
import { CONSTANTS } from '../../providers/feedback-service/constants';
import { Util } from '../../providers/feedback-service/utils';
import { AppInit } from '../../providers/app-init/app-init';

/**
 * Generated class for the IonfooterComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  	selector: 'ion-footer',
	templateUrl: 'ionfooter.html'
})
export class IonfooterComponent {

	@Input() survey: any;       // Store active survey for spacific page
	@Input() service: any;      // Store appInit object
	@Input() tabs: any;         // tabs array - same as modules in administration application
	@Input() controller: any;   // Page controller
	@Input() pageName: String;  // Store page's name, optional

    survey_length = 1;
    pages=[];
    survey_index = 1;
    
    constructor(private appInit: AppInit) {
    }
    
    ngOnChanges() {
        if (!this.controller)   return;
        
        this.service = this.controller.appInit;
        this.tabs = this.controller.appInit ? this.controller.appInit.tabs : null;
        
        if (this.service) {
            let fb_service = this.service.fbService;
            if (fb_service) {
                this.pages = [];
                let device_survey = fb_service.survey;
                
                // Update data for page navigation
                if (device_survey && device_survey.data.type==CONSTANTS.SURVEY_TYPE_MIXED 
                    && device_survey.childs && device_survey.childs.length>1) {
                        
                    this.survey_length = device_survey.childs.length;
                    this.survey_index = device_survey.position;
                    for (var i=0; i<this.survey_length; i++) {
                        this.pages.push(i);
                    }
                }
            }
        }

    }

}
