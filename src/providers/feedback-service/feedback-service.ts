//import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

import { md5 } from '../md5/md5';
import { SqliteProvider } from '../sqlite/sqlite';
import { Config } from '../../app/config';
import { AuthService } from '../auth-service/auth-service';
import { Util } from '../feedback-service/utils';
import { CONSTANTS } from './constants';
import { createSurvey, SurveyINF } from './surveys';
import { HttpService } from './http-service';

@Injectable()
export class FeedbackService {
    public survey: SurveyINF;
    public messageHeader: any;
    public invitation: any;
    public promotion_code: String = null;
    public last_promotion_code: String = null; // For using in Thank page
    public isPositive_feedback = false;
    private batchjob_handl = null;
    
    constructor(private conf: Config, public httpService: HttpService,
        public sqliteService : SqliteProvider, private auth: AuthService) {
            
        this.promotion_code = null;
    }
    
    // Return: true if successful, false if failed
    public initSurvey(survey_data) {
        this.survey = createSurvey(survey_data);
        if (!this.survey)   return false;
        
        // Init first, last survey
        let first = this.survey.getFirstSurvey();
		if (!first)		return false;
        first.isFirst = true;
		
        let last = this.survey.getLastSurvey();
        if (last)    last.isLast = true;

        this.survey.resetState();
        //console.log("Step count: ", this.survey.getSteps());
        return true;
    }
    
    // public setMessageHeader(header) {
    //     this.messageHeader = header;
    // }

    // Reset all conditions and state for new feedback
    public resetFeedback() {
		// Reset customer and attached information
		this.invitation.customer = null;
		this.invitation.attached_info = null;
    }
    
    /** 
     * Send feedback: generate feedback message, promotion code, root feedback id
     * - Prepare data for sending feedback
     * - Setting data for using in thank page: isPositive_feedback, promotion_code
     * - Send feedback to server
     */
    public sendFeedback() {
        let message = Object.assign({}, this.messageHeader);    // Clone header to new message
        this.survey.getSurveyClass().setRecursiveSeverity();
        let feedback = this.survey.packageFeedback();
        message.feedback = feedback;
        message.customer = Util.cleanObject( this.invitation.customer );
        message.attached_info = this.invitation.attached_info;
        message.status = this.survey.feedback.status;
        
        // Update message header
        let current_Time = new Date();
        message.device_date = current_Time.toString();	// In local timezone

        // Calculate time to server
        let destination_date = Util.changeTimeZone(current_Time, this.conf.SERVER_TIMEZONE);
        message.created = Util.toISOFormat(destination_date);
        
        // Calculate id for root feedback
        feedback.id = this.generateFeedbackId(message.device_id, message.created, 
            feedback.sur_path, feedback.sur_id);
    
        if (this.promotion_code)    message.code = this.promotion_code;
        
        if (this.survey.recursiveNotification()) {
            message.notification = true;
            message.notificationMessages = this.survey.getSurveyClass().notificationMessages;
            message.notificationColor = this.survey.getSurveyClass().notificationColor;
            this.isPositive_feedback = false;
        } else {
            this.isPositive_feedback = true;
        }
        
        this.httpService.sendMessage(CONSTANTS.MESSAGE_TYPE_FEEDBACK, message);

        // Reset all state for new feedback
        this.resetFeedback();
    }

    // Make id for feedback
    public generateFeedbackId(device_id, created_time, sur_path, sur_id) {
        if (!device_id || !created_time || !sur_id)    return null;
        if (!sur_path)      sur_path = "None";
        
        let id_data = device_id + '-' + created_time + '-' + sur_path + '-' + sur_id;
        //console.log("ID string: ", id_data);
        return md5(id_data);
    }
    
    // Make promotion code for customer
    public initPromotionCode() {
        if (!this.survey.data || !this.survey.data.promotion || !this.survey.data.promotion.id)
            this.promotion_code = null;
        else {
            this.last_promotion_code = this.promotion_code;
            this.promotion_code = Util.makeRandomString(CONSTANTS.APP_PROMOTIONCODE_LENGTH);
        }
        return this.promotion_code;
    }    
}
