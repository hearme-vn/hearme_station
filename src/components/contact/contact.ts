import { Input, Output, EventEmitter } from '@angular/core';
import { Component } from '@angular/core';
import { BaseComponent } from '../../providers/feedback-service/basecomponent';
import { Contact } from '../../providers/feedback-service/surveys';
import { Util } from '../../providers/feedback-service/utils';

/**
 * Contact Component
 * @author Thuc VX <thuc@hearme.vn>
 * @date Aug 23, 2020
 * 
 */
@Component({
  selector: 'contact',
  templateUrl: 'contact.html'
})
export class ContactComponent extends BaseComponent {
	@Input() survey: Contact;

    @Output() dataChange: EventEmitter<Contact> = new EventEmitter<Contact>();

    public fieldMap = {
        'CONTACT_NAME': 'name',
        'CONTACT_PHONE': 'phone',
        'CONTACT_EMAIL': 'email',
        'CONTACT_ADDRESS': 'address',
        'CONTACT_ROOMNUMBER': 'roomnumber'
    }
    private configures;

    // constructor() {}
    
    public initFeedback() {
        setTimeout(() => {

        this.feedback = {
            name: null,
            phone: null,
            email: null,
            address: null,
            roomnumber: null
        };
        if (this.survey.feedback) {
            this.feedback = this.survey.feedback;
        } else {
            let customer = this.appInit.invitation.customer;
               
            // Update information from customer
            if (customer) {
                this.feedback.name = customer.name;
                this.feedback.phone = customer.phone;
                this.feedback.email = customer.email;
                this.feedback.address = customer.address;
                this.feedback.roomnumber = customer.roomnumber;
            }
        }

        this.survey.answered_survey = this.isAnsweredSurvey();
        }, 0);
    }    

    ngOnChanges() {
        // console.log("---Inside ngDoChanges---");
        super.ngOnChanges();

        if (this.survey && this.survey.data && this.survey.data.configures) {
            this.configures = this.survey.data.configures;
            
            if (this.configures.length%2 ==1) {
                this.configures[this.configures.length-1]['allLine'] = true;
            }
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
        this.survey.feedback = this.feedback;
    }

    /**
     * Check wherether user finished answer survey or not
     * Check in both cases: in form survey or in indepenent survey
    */
    private isAnsweredSurvey() {
        if (this.configures && this.configures.length) {
            for (let i=0; i<this.configures.length; i++) {
                let configure = this.configures[i];
                let key = configure.cfg_key;
                let field = this.fieldMap[key];
                
                if (configure.value>=2 && !this.feedback[field]) {
                    return false;
                }

                // Validate
                var valid = true;
                if (key=='CONTACT_PHONE' && configure.value==3) {
                    valid = Util.isPhoneNumber(this.feedback[field]);                    
                }
                if (valid && key=='CONTACT_EMAIL' && configure.value==3) {
                    valid = Util.isEmail(this.feedback[field]);
                }
                if (!valid) {
                    return false;
                }
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

    // ngOnInit() {
    //     console.log("---Inside ngOnInit---");
    //   }
    // ngDoCheck() {
    // console.log("---Inside ngDoCheck---");
    // }
    // ngAfterContentInit() {
    // console.log("---Inside ngAfterContentInit---");
    // }
    // ngAfterContentChecked() {
    // console.log("---Inside ngAfterContentChecked---");
    // }
    // ngAfterViewInit() {
    // console.log("---Inside ngAfterViewInit---");
    // }  
    // ngAfterViewChecked() {
    // console.log("---Inside ngAfterViewChecked---");    
    // }
    // ngOnDestroy() {
    // console.log("---Inside ngOnDestroy---");      
    // }

}
