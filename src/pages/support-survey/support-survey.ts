import { Component } from '@angular/core';
import { AppInit } from '../../providers/app-init/app-init';
import { BasePage } from '../../providers/feedback-service/basepage';


/**
 * Supportive Survey pages
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 5, 2020
 * 
 */
@Component({
    selector: 'page-support-survey',
    templateUrl: 'support-survey.html',
})
export class SupportSurveyPage extends BasePage {

    page_selector="page-support-survey";
        
    constructor(
            public appInit: AppInit, 
    ) {
        super(appInit);
    }

}
