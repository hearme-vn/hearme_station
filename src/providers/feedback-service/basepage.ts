// import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

// import { Config } from '../../app/config';
import { Util } from '../feedback-service/utils';
import { CONSTANTS } from './constants';
import { AppInit } from '../app-init/app-init';
import { FeedbackService } from '../feedback-service/feedback-service';

export class BasePage {
    public appConf=null;
    public tabs=null;
    public organization=null;
	public device=null;
    public survey=null;
	public theme=null;
	public themeClass='theme_basic';
	public page_selector=null;
    
    public fbService: FeedbackService = null;
    public accountConfigs = null;
    private page_timeout_handle = null;
    private factorExplaination_handle = null;
    
    constructor(public appInit: AppInit) {
		this.appConf = this.appInit.conf;
        this.fbService = this.appInit.fbService;
    }
	
    // Register back button
    ionViewDidEnter() {
        this.loadPage();
    }

    ionSelected() {
        this.loadPage();
    }

    ngAfterViewChecked() {
        // console.log("Update color");
        let main_color = CONSTANTS.APP_MAIN_COLOR;
        if (this.appInit && this.appInit.configs && this.appInit.configs['DEVICE_MAIN_COLOR']) {
            main_color = this.appInit.configs['DEVICE_MAIN_COLOR'].value;
        }

        Util.updateMainColor(main_color);
    }
	
    /**
     * Set focus to input in contact form or open question form
    */
    textInput_setFocus() {
        setTimeout(() => {
            // Set focus for open question
            let ion_textarea = document.getElementById("page_textarea");
            if (ion_textarea && ion_textarea.children[0])   {
                let textarea = ion_textarea.children[0];
                (<HTMLElement>textarea).focus();
            }

            // Set focus for contact form
            let elements = document.querySelectorAll('#contact_form ion-input');
            if (elements && elements.length) {
                // console.log("Field count: ", elements.length);
                let input_elem = elements[0].children[0];
                (<HTMLElement>input_elem).focus();
            }
        }, 300)
    }

    // Init data for this page
    initPageData() {
        this.accountConfigs = this.appInit.configs;
        // this.urlParams = this.appInit.urlParams;
        this.device = this.appInit.device;
        this.tabs = this.appInit.tabs;
        this.organization = this.appInit.organization;
        this.survey = this.appInit.survey;
    }

    // This event is fired when change from one tab to another tab
    ionViewWillLeave() {
        this.clearTimers();
    }

    // Clear all timer funtions
    clearTimers() {
        // Clear page timeout event
        if (this.page_timeout_handle)      clearTimeout(this.page_timeout_handle);
        
        // Clear factor explaination pop-up
        if (this.factorExplaination_handle)
            this.factorExplaination_handle.dismiss();
    }

    public loadPage() {
        // let t1 = new Date();
        // console.log("Start loading: ", t1);
        this.initPageData();
        
        this.appInit.pageController = this;     // Support socket function, callback to controller
        if (this.appInit.survey) {
            this.survey = this.appInit.survey;
            this.survey.updateLastSurvey();
            
            // Update language for survey
            this.survey.changeLanguage(this.appInit.languages.selected.id);            
            // Stop batchjob
            this.fbService.httpService.stop_batchjob();            
            this.theme = this.survey.data.theme;
            
            this.configurePageUI();
            
            // Setting page timeout event
            this.page_timeout_handle = setTimeout(() => {
                // Function to goto homepage
                if (this.survey && this.survey.isFirst) {
                    // Reset new feedback state
                    // this.fbService.resetFeedback();
                    
                    // Goto collection page
                    if (this.appInit.configs['AUTO_RUN_COLLECTION'] && 
                        this.appInit.configs['AUTO_RUN_COLLECTION'].value == 'true') {
                        // Reset survey state
                        // this.fbService.survey.resetState();
                        this.goToCollectionPage();
                    }
                    
                    // Run batch-job to resend messages in local storage
                    if (this.appInit.pdevice && this.appInit.pdevice.platform)
                        this.fbService.httpService.resend_batchjob();
                } else {
                    // Send un-finished feedback here
                    this.fbService.survey.feedback.status = CONSTANTS.FEEDBACK_STATUS_UNFINISHED;
                    this.fbService.sendFeedback();
                    
                    // Goto homepage
                    this.fbService.survey.resetState();
                    this.fbService.initPromotionCode();
                    this.survey = null;
                    this.appInit.customer = null;
                    this.runNextSurvey();
                }

            }, 1000*this.appInit.page_timeout_length);// Goto homepage after 0.5 munutes in idle status            
        }
        // let t2 = new Date();
        // console.log("Loading end: ", new Date());
        // console.log("loading time (in ms): ", t2.getMilliseconds() - t1.getMilliseconds());

        this.textInput_setFocus();
    }

    public configurePageUI() {
        // Configure theme name for page
        if (this.theme && this.theme.css_class) {
            this.themeClass = 'theme_' + this.theme.css_class;
            let newClasses = "ion-page show-page " + this.themeClass;
            Util.setAttributeValue(this.page_selector, "class", newClasses);
        }

        // Configure page background color and image
        if (this.theme) {
            if (this.theme.background) {
                let url = this.appConf.img_server + this.theme.background;
                Util.setObjectBackgroundImage(this.page_selector, url);
            } else if (this.theme.type_id==1) {
                Util.setObjectBackgroundColor(this.page_selector, "white");
            } else {
                Util.clearObjectBackground(this.page_selector);
            }
        } else {
            Util.clearObjectBackground(this.page_selector);
        }
    }

    /**
     * This function is for checking data and preprocessing feedback data 
     * - Validate data
     * - Make feedback and update into survey
    */
    public preSendFeedback() {}

    /**
     * This is template method for sending feedback button in survey page.
     * - Preprocessing data by: preSendFeedback()
     * - Then check if user finished sending feedback
     * - Finally, send feedback by call method: runNextSurvey()
    */
    public sendFeedback() {
        // Processing data
        this.preSendFeedback();

        // Check if there is feedback
        if (!this.survey.is_Finished_feedback()) {
            // Display message here
            this.appInit.util.showToastMessageByID("message.ANSWER_REQUIRED", { 
                position: "top", 
                duration: CONSTANTS.APP_TOAST_INTERVAL,
                cssClass: this.appInit.screen_orientation
            });
            return;
        }
        
        // Run next survey
        this.runNextSurvey();
    }

    // This event is fired when change from one tab to another tab    
    public runNextSurvey() {
        // if (this.survey && !this.survey.feedback)    return;

        // Clear all timer in this page
        this.clearTimers();

        let survey = this.fbService.survey.goNext();
        if (!survey) {
            // Reach end survey, send feedback and go to thank page
			// Check captcha response code - for web channel

            // Send feedback
            this.fbService.survey.feedback.status = CONSTANTS.FEEDBACK_STATUS_NEW;
            this.fbService.sendFeedback();
            this.fbService.survey.resetState();
            this.fbService.initPromotionCode();

            // Check and go to Thank page
            this.survey = null;
            this.openThankPage();
            return;
        }
        // Goto survey page for this survey
        // Check the last survey
        this.fbService.survey.updateLastSurvey();
        this.appInit.survey = survey;
        this.appInit.navCtrl.getActiveChildNav().select(survey.page);
        
    }
 
    public runPreviousSurvey() {
        // Clear all timer in this page
        this.clearTimers();

        let survey = this.fbService.survey.goPrevious();
        if (!survey)   survey = this.fbService.survey.goNext();
        
        // this.setShowInfoBtnForSurvey(this.survey);
        var page = survey.page;
        this.appInit.survey = survey;
        this.appInit.navCtrl.getActiveChildNav().select(page);
    }    

    public openThankPage() {
        var thank_page_style = this.accountConfigs['THANKPAGE_STYLE'];
        if (thank_page_style && thank_page_style.status == CONSTANTS.CONFIG_ACTIVE) {
            // Run active thank page
            if (thank_page_style.value==CONSTANTS.THANKPAGE_STYLE_POPUP) {
                // Open popup style
                let data = {};
                let opts = { enableBackdropDismiss: false, showBackdrop: false };
                let myModal = this.appInit.modalCtrl.create(this.appInit.ThanksPage, data, opts);
                myModal.present();
            } else {
                // Thank page style
                this.appInit.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_THANKS);
            }
        } else {
            // Play thank sound
            this.appInit.util.playThankSound(this.appInit.languages.selected);
            // Ommit thank page in flow
            this.runNextSurvey();
        }
    }
    
    public openFactorsInfoPage() {
        // Open popup style
        let data = {};
        let opts = { enableBackdropDismiss: false, showBackdrop: true };
        this.factorExplaination_handle = this.appInit.modalCtrl.create(
            this.appInit.FactorsInfoPage, data, opts);
        this.factorExplaination_handle.present();
    }

    public goToCollectionPage() {
        // Reset survey
        this.fbService.resetFeedback();
        this.fbService.survey.resetState();
        this.fbService.initPromotionCode();
        
        // Goto collection page       
        this.appInit.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_COLLECTIONS);
    }
    
    public changeLanguage(langSelected) {
        if (!langSelected)      return;
        this.appInit.languages.isShow = false;
            
        this.appInit.languages.selected = langSelected;
        this.appInit.translate.use(langSelected.code);
        let lang_id = langSelected.id;
        
        if (this.survey)    this.survey.changeLanguage(lang_id);
        
        // Update related items' labels in device
        this.appInit.updateDeviceLanguage(langSelected);

        // Callback functions for this event
        for (let i=0; i<this.appInit.languages.lang_change_cbs.length; i++) {
            let cb = this.appInit.languages.lang_change_cbs[i];
            cb(langSelected);
        }
    }
  
    public showHideLanguageBox() {
        this.appInit.languages.isShow = !this.appInit.languages.isShow;
    }
}

/**
 * DEPRECATED DUE TO CHANGED TO SURVEY COMPONENT 
 * */
// export class IndexPage extends BasePage {

//     /**
//      * This function is index survey, to get rating level and send feedback
//      * - Validate data
//      * - Make feedback and update into survey
//     */
//     public getComment(rating) {
//         // Update rating
//         var feedback = {
//             rating: rating
//         }
//         this.survey.updateFeedback(feedback);
    
//         // Go next survey page
//         this.sendFeedback();
//     }
// }

export class IndexBasePage extends BasePage {

    /**
     * handle click to satisfaction level
     * input: survey is updated feecback data
    */
    indexRatingClicked(survey) {
        this.sendFeedback();
    }

}