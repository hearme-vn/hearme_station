import { Component } from '@angular/core';
//import { NavController, NavParams } from 'ionic-angular';
import { AppInit } from '../../providers/app-init/app-init';
//import { CONSTANTS } from '../../providers/feedback-service/constants';
import { IndexBasePage } from '../../providers/feedback-service/basepage';
// import { Config } from '../../app/config';


/**
 * Survey page
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 1, 2020
 * 
 */
// @IonicPage()
@Component({
    selector: 'page-index-survey',
    templateUrl: 'index-survey.html',
})
export class IndexSurveyPage extends IndexBasePage {

    page_selector="page-index-survey";
        
    constructor(
            public appInit: AppInit, 
    ) {
        super(appInit);
    }

}
