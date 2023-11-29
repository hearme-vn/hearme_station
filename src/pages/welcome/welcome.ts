import { Component } from '@angular/core';
import { CONSTANTS } from '../../providers/feedback-service/constants';
import { BasePage } from '../../providers/feedback-service/basepage';

import { AppInit } from '../../providers/app-init/app-init';

/**
 * @author Thuc VX
 * @date 26 Oct 2018
 * This page is used to welcome user
 */
//@IonicPage()
@Component({
	selector: 'page-welcome',
	templateUrl: 'welcome.html',
})
export class WelcomePage extends BasePage {
    private customer: any;
	private invitation: any;
	private welcome_Words: any;
    // private proverb: any;
	
    constructor(public appInit: AppInit) {
		super(appInit);
	}

	ionViewDidLoad() {
		this.loadPage();
	}
	
    ionSelected() {
        this.loadPage();
    }
	
	public loadPage() {
		// General data
		this.customer = this.appInit.invitation.customer;	
		this.invitation = this.appInit.invitation;
		this.changeLanguage(null);
	}

	ionViewDidEnter() {
		this.appInit.pageController = this;
	}
	
	ionViewDidLeave () {
		this.appInit.pageController = null;
	}
	
	public startSendFeedback() {
		//document.documentElement.requestFullscreen();
		//window.screen.orientation.lock("landscape");
		this.runNextSurvey();
	}
	
	/**
	* For processing language related to this page
	*/
	public changeLanguage(langSelected) {
        super.changeLanguage(langSelected);
        
        // Greating words - from proverb collection
        if (!this.appInit.proverbs)     return;
		if (this.invitation && 
			this.invitation.status!=CONSTANTS.INVITATION_STATUS_ACTIVE) {
            this.welcome_Words = this.appInit.proverbs.getOneByType(
                CONSTANTS.PROVERBS_TYPE_GREATING_INVALID, langSelected.id);                
		} else {
            this.welcome_Words = this.appInit.proverbs.getOneByType(
                CONSTANTS.PROVERBS_TYPE_GREATING_VALID, langSelected.id);                
		}		
	}
}
