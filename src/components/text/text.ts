import { Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { BaseComponent } from '../../providers/feedback-service/basecomponent';
import { TEXT } from '../../providers/feedback-service/surveys';

/**
 * Text Component
 * @author Thuc VX <thuc@hearme.vn>
 * @date Jul 6, 2020
 * 
 */
@Component({
    selector: 'text',
    templateUrl: 'text.html'
})
export class TextComponent extends BaseComponent {
	@Input() survey: TEXT;

    @Output() dataChange: EventEmitter<TEXT> = new EventEmitter<TEXT>();

    public INCLUDE_CONTACT_FIELDS=false;
    public REQUIRED_CONTACT_FIELDS=false;

    // constructor() {}

    public initFeedback() {
        this.feedback = {
            sur_id: null,
            comment: null,
            name: null,
            contact: null
        };
        
        if (this.survey.feedback)
            this.feedback = this.survey.feedback;
        else
            this.feedback.sur_id = this.survey.getId();

		// Update information from customer
		if (this.INCLUDE_CONTACT_FIELDS) {
            let customer = this.appInit.invitation.customer;
            
            // Update information from customer
            if (customer) {
                this.feedback.name = customer.name;
                this.feedback.contact = customer.phone;
            }
        }
        
        // Init answered_survey state
        this.survey.answered_survey = this.isAnsweredSurvey();
    }
    
    ngOnChanges() {
        super.ngOnChanges();

        if (this.appInit.configs && 
            this.appInit.configs['INCLUDE_CONTACT_FIELDS'] &&
            this.appInit.configs['INCLUDE_CONTACT_FIELDS'].value == 'true') {
            this.INCLUDE_CONTACT_FIELDS = true;
        } else {
            this.INCLUDE_CONTACT_FIELDS = false;
        }
        if (this.appInit.configs && 
            this.appInit.configs['REQUIRED_CONTACT_FIELDS'] &&
            this.appInit.configs['REQUIRED_CONTACT_FIELDS'].value == 'true') {
            this.REQUIRED_CONTACT_FIELDS = true;
        } else {
            this.REQUIRED_CONTACT_FIELDS = false;
        }
        this.initFeedback();        
    } 

    public createFeedback() {
        // set answered state
        this.survey.answered_survey = this.isAnsweredSurvey();
        if (!this.survey.answered_survey)   {
            this.survey.feedback = null;
            return;
        }
        
        this.survey.answered_survey = true;
        this.survey.updateFeedback(this.feedback);
    }

    /**
     * Check wherether user finished answer survey or not
     * Check in both cases: in form survey or in indepenent survey
    */
    private isAnsweredSurvey() {
        if (this.in_form) {
            if (!this.feedback.comment && this.survey.getData().required) {
                return false;
            }
        } else {
            if ( (this.REQUIRED_CONTACT_FIELDS && (!this.feedback.name || !this.feedback.contact)) 
                || (!this.feedback.comment && this.survey.getData().required) ) {
                return false;
            }
        }
        return true;
    }

    /**
     * This event is called when user make answer by inputing into form in survey screen
     * This method is checked for independent text survey
    */
    updateDataChange(data) {
        this.createFeedback();
        
        this.dataChange.emit(this.survey);
    }
}
