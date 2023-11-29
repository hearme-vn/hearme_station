import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { AppInit } from '../../providers/app-init/app-init';
import { CONSTANTS } from '../../providers/feedback-service/constants';
import { BasePage } from '../../providers/feedback-service/basepage';
import { Util, SoundPlayer } from '../../providers/feedback-service/utils';

@Component({
    selector: 'page-thanks',
    templateUrl: 'thanks.html',
})
export class ThanksPage extends BasePage {
    private proverb = null;
    private style_isPopup = false;
    private promotion_code = null;
    // private promotion_prime_code  = null;
    private valTimeId: any;
	private customer = null;
	// private lang_code = null;
    private thank_sound_handle = null;
    
    constructor(
        public appInit: AppInit, 
        public viewCtrl: ViewController,
        public platform: Platform
        ) {

		super(appInit);
        this.setConfigsByLanguage(this.appInit.languages.selected);
        
        this.appInit.languages.lang_change_cbs.push(this.setConfigsByLanguage.bind(this));
    }

    public loadPage() {
        // Get thank message or sorry message based on feedback attitude: positive or negative
        this.proverb = null;
        if (!this.appInit.fbService.isPositive_feedback) {
            this.proverb = this.appInit.proverbs.getOneByType(
                CONSTANTS.PROVERBS_TYPE_RATING_BAD, this.appInit.languages.selected.id);
        }
        if (!this.proverb) {
            this.proverb = this.appInit.proverbs.getOneByType(
                CONSTANTS.PROVERBS_TYPE_THANKS, this.appInit.languages.selected.id);
        }

        // Thank page style
        var page_style = this.appInit.configs['THANKPAGE_STYLE'];
        if (page_style)
            this.style_isPopup = (page_style.value==CONSTANTS.THANKPAGE_STYLE_POPUP);
        
        // Set background color white in pop-up mode        
        if (this.style_isPopup)
            Util.setObjectBackgroundColor("page-thanks", "white");
        
        // Promotion code
        this.promotion_code = this.appInit.fbService.last_promotion_code;
        // this.promotion_prime_code = null;
        // if (this.promotion_code) {
        //     let codes = this.promotion_code.split("-");
        //     if (codes && codes.length)
        //         this.promotion_prime_code = codes[1];
        // }
        
        // Get feedback customer
        // this.customer = this.appInit.customer || this.appInit.invitation.customer;
        this.customer = this.appInit.customer;
        this.sendPromotioncode(this.promotion_code, this.customer);
		
        // Set timer
        let delay_conf = this.appInit.configs['THANKPAGE_DELAY'];
        let delay_time = CONSTANTS.THANKPAGE_DEFAULT_DELAY; //Default delay time
        if (delay_conf)     delay_time = Number(delay_conf.value);
        this.valTimeId = setTimeout(() => {
            if (this.style_isPopup)     this.viewCtrl.dismiss();
            this.runNextSurvey();
        }, 1000*delay_time);// Goto homepage after 0.5 munutes in idle status

        // Play sound of thank words
        // if (this.lang_code != this.appInit.languages.selected.code) {
            // this.lang_code = this.appInit.languages.selected.code;
            // let thanks_file = "assets/sounds/thanks_" + this.lang_code + ".mp3";
            // this.thank_sound_handle = new SoundPlayer(this.platform, 
                // this.nativeAudio, thanks_file);
        // }        
        if (this.thank_sound_handle)    this.thank_sound_handle.play();

        this.configurePageUI();
    }
    
    ionViewWillLeave() {
        if (this.valTimeId)   clearTimeout(this.valTimeId);
        this.appInit.customer = null;
        this.customer = null;
    }
    
    closeModal() {
        if (this.valTimeId)   clearTimeout(this.valTimeId);
        if (this.style_isPopup)     this.viewCtrl.dismiss();
        this.runNextSurvey();
    }

    // Configure by language change
    public setConfigsByLanguage(selected) {
        // Play sound of thank words
        let thanks_file = "assets/sounds/thanks_" + selected.code + ".mp3";
        this.thank_sound_handle = new SoundPlayer(this.platform, thanks_file);
    }

    // Sending promotion_code to customer either by email or SMS message
    sendPromotioncode(code, customer) {
        // this is frame for upgrading later
    }
}
