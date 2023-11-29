import { Input, Output, EventEmitter } from '@angular/core';
import { SurveyINF } from '../../providers/feedback-service/surveys';
import { CONSTANTS } from './constants';
import { AppInit } from '../app-init/app-init';



/**
 * Base Component for all survey components.
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 1, 2020
 * 
 */
export class BaseComponent {
    @Input() in_form: number;
	@Input() survey: SurveyINF;
	@Input() appInit: AppInit;
    @Input() feedback;
    @Input() startTime;

	@Output() clicked: EventEmitter<SurveyINF> = new EventEmitter<SurveyINF>();

    public appConf=null;
    public fbService=null;

    /**
     * Update data for each change in component
    */
    public updateChange = this.iconClicked;

    constructor() {
    }

    /**
     * Check survey's feedback and other configuration, then init feedback to display in screen
    */
    public initFeedback() {}

    ngOnChanges() {
		this.appConf = this.appInit.conf;
        this.fbService = this.appInit.fbService;
    }

    /**
     * make feedback and update into survey
    */
    public createFeedback(data) {}

    /**
     * make re-action after rating by user
     * - update item data in survey
     * - decor item
    */
    public reAction(data) {}

    /**
     * this event is called when user make answer by clicking into icons in survey screen
    */
    iconClicked(data){
        this.reAction(data);

        this.createFeedback(data);
        
        // Setting little bit delay before emiting event
        setTimeout(function() {
            this.clicked.emit(this.survey);
        }.bind(this), 200);

    }

    /**
     * Check required field and return TRUE if user anwsered survey
     * others, user has not been finished survey
    */
    public isFinished() { return true }

    /**
     * Processing error in http call
     * @param err 
     */
    httpErrorProcessing(err) {
        console.log("Error sending upload: ", err);
        if (err.status==0) {
            this.appInit.util.showToastMessageByID("message.NETWORK_DISCONNECTED", { 
                position: "top", 
                duration: CONSTANTS.APP_TOAST_INTERVAL,
                cssClass: this.appInit.screen_orientation
            });    
        } else {
            this.appInit.util.showToastMessageByID("message.FILE_UPLOADING_ERROR", { 
                position: "top", 
                duration: CONSTANTS.APP_TOAST_INTERVAL,
                cssClass: this.appInit.screen_orientation
            });    

        }
    }

}


/**
 * Index Component for all index survey components.
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 1, 2020
 * 
 */
export class IndexComponent extends BaseComponent {

    /**
     * This function is for index survey, to make feedback and update into survey
    */
    public createFeedback(rating) {
        // Update rating
        var feedback = {
            rating: rating
        }
        this.survey.updateFeedback(feedback);
    }
}