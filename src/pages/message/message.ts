import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

import { AppInit } from '../../providers/app-init/app-init';
import { CONSTANTS } from '../../providers/feedback-service/constants';
import { BasePage } from '../../providers/feedback-service/basepage';

/**
 * This page is for display message.
 * @date 2018 Dec 10
 * @author Thuc VX<thuc@hearme.vn>
 */
@Component({
	selector: 'page-message',
	templateUrl: 'message.html',
})
export class MessagePage extends BasePage {
	private customer = null;
	private proverb = null;
	private valTimeId = null;
	
	constructor(
		public navCtrl: NavController,
        // public navParams: NavParams,
		public appInit: AppInit, 
        public viewCtrl: ViewController) {
			
		super(appInit);
	}

    public loadPage() {
		this.customer = this.appInit.invitation.customer;
		this.proverb = this.appInit.proverbs.getOneByType(
			CONSTANTS.PROVERBS_TYPE_GREATING_VALID, this.appInit.languages.selected.id);
/* 			
		let tab_index = this.appInit.navCtrl.getActiveChildNav()
			.getSelected().index;
		if (tab_index==CONSTANTS.PAGE_INDEX_COLLECTIONS) {
			this.appInit.runFirstSurvey()r
r: Uncaught (in promise): removeView was not found
		}
 */
        let delay_time = CONSTANTS.MESSAGEPAGE_DEFAULT_DELAY; //Default delay time, 2 MINUTES
        this.valTimeId = setTimeout(() => {
            this.viewCtrl.dismiss();
			
            // Reset customer and attached session information
            this.appInit.customer = null;
            this.appInit.invitation.customer = null;
            this.appInit.invitation.attached_info = null;
            
            // this.fbService.resetFeedback();
        }, 1000*delay_time);	// Close seeding feedback invitation after specific range of time

    }

     // This event is fired when close this model windows or page
    ionViewWillLeave() {
        this.dismiss();
    }
       
    dismiss() {
        if (this.viewCtrl)      this.viewCtrl.dismiss().catch(() => {
            console.log("Dialog dismissed");
        });
        if (this.valTimeId)     clearTimeout(this.valTimeId);
    }
 
    closeModal() {
		let tab_index = this.appInit.navCtrl.getActiveChildNav()
			.getSelected().index;
		if (tab_index==CONSTANTS.PAGE_INDEX_COLLECTIONS) {
			this.runNextSurvey();
		} else if (this.survey && !this .survey.isFirst) {
            // Send un-finished feedback here
            this.fbService.sendFeedback();
            
            // Goto homepage
            this.fbService.survey.resetState();
            this.survey = null;
            this.runNextSurvey();
        }
        this.dismiss();
    }

}
