import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import { Device } from '@ionic-native/device';
import { TranslateService } from '@ngx-translate/core';
import { NavController, Platform } from 'ionic-angular';
import * as io from 'socket.io-client';
import { ModalController } from 'ionic-angular';
import { forkJoin } from "rxjs/observable/forkJoin";
import { AlertController } from 'ionic-angular';

import { AuthService } from '../auth-service/auth-service';
import { Config } from '../../app/config';
import { FeedbackService } from '../feedback-service/feedback-service';
import { EventService } from '../feedback-service/event-service';
import { CONSTANTS } from '../feedback-service/constants';
import { Util, Proverbs } from '../feedback-service/utils';

@Injectable()
export class AppInit {

    // Loading application data
    public status = CONSTANTS._STATUS_NOT_INIT_;
    public device = null;
    public organization = null;  
	public invitation = {customer: null, attached_info: null};
    public survey_data = null;
    public socket = null;
    public proverbs = null //Store proberb word in languages
    public tabs = [];
    public configs = {};
    public survey = null;
    //public promotion_code = null;
	public customer = null;
    
    // Utility data
    public navCtrl: NavController;
    public ThanksPage = null;
    public WelcomePage = null;
    public FactorsInfoPage = null;
	public MessagePage = null;
    public request_options = null;
    public page_timeout_length = CONSTANTS.APP_PAGES_DELAY_DEFAULT;
    
    // Processing
    public header = null;
	private mdlg_handle;    // Used for displaying customer info dialog
	public pageController: any;     // To access to controller's functions
	public screen_orientation="landscape"; 	// values: landscape-primary; portrait-primary
    public languages = {        // Init language data with default is English
        selected: {id: 1, code: "en"},
        datas: [],
        isShow: false,
        lang_change_cbs: []   // List of callbacl functions to handle changing language event
    };
    
    constructor(public conf: Config, public http: Http, private auth: AuthService, 
        public util: Util,
        public pdevice: Device, 
        public alertCtrl: AlertController,
        public translate: TranslateService, 
        public platform: Platform, 
        public modalCtrl: ModalController, 
        public fbService: FeedbackService,
        public eventService: EventService
        ) {
        
    }

    public initApplication() {
        // Check existing token
        let token = this.auth.checkAndInitTokenExising();
        if (!token) {
            this.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_LOGIN);
            return;
        } else {
			this.loadApplicationdata();
		}
	}

    // Start loading device data and init application
    public loadApplicationdata() {
		// Check loading status
		if (this.status == CONSTANTS._STATUS_INIT_SUCCESS_)	return;
		
		setTimeout(() => {
            if (this.status == CONSTANTS._STATUS_DEVICE_DISCONNECTED_)
                this.loadApplicationdata();
		}, CONSTANTS.APP_RE_INIT_INTERVAL);

        // Attach device and check active
        this.attachDevice().subscribe(
        device => {
            // Checking receivable device
            if (this.device.receivable==CONSTANTS._DEVICE_RECEIVABLE_) {
                this.status = CONSTANTS._STATUS_ACTIVE_;
            } else {
                this.status = CONSTANTS._STATUS_INACTIVE_;
                this.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_IDLE);
                return this.util.showAlertMessageByID("message.DEVICE_INACTIVE");
            }
            
            //Load active survey
            this.getActiveSurvey().subscribe(
				survey => {
                    if (survey.status!=CONSTANTS.SURVEY_STATUS_ACTIVE) {                                   
                        this.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_IDLE);
                        this.status = CONSTANTS._STATUS_NO_SURVEY_;
                        return this.util.showAlertMessageByID("message.SURVEY_INACTIVE");
                    }
                    
					//Load other items here: language for organization, survey, tabs
					this.getDeviceData().subscribe(
						results => {
							//console.log("tabs info: ", JSON.stringify(this.tabs));
							this.afterInit();
						}
					);
				},
				error => {
                    this.httpErorProcessing(error, CONSTANTS._STATUS_NO_SURVEY_);
				});
        },
        error => {
            this.httpErorProcessing(error);
        }); 
    }

    // Processing error on calling APIs to start application
    public httpErorProcessing(error, err_status=CONSTANTS._STATUS_APIS_CALL_ERROR_) {    
        if (error.status==0) {
            this.status = CONSTANTS._STATUS_DEVICE_DISCONNECTED_;
            this.util.showToastMessageByID("message.NETWORK_DISCONNECTED");
        } else {
            this.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_IDLE);
        
            this.status = err_status;
            this.util.alertErrorResponse(JSON.parse(error._body));
        }
    }
 	    
    /**
    * Method to attach physical device into logical device. Check device active
    */  
    public attachDevice() {
        let token = this.auth.getToken();
        let headers = new Headers({ 'Authorization': 'BEARER ' + token, 'Content-Type': 'application/json'});
        let options = new RequestOptions({ headers: headers });
        this.request_options = options;
        
        // User logged, now update device information
        let device_infor = this.util.getDeviceInformation();
        //return Observable.create(observer => {
        return  this.http.post(this.conf.core_Service + "device/attach", JSON.stringify(device_infor), options).map(
            (res) => {
                //console.log("Attached device to account with token: ", token);
                this.status = CONSTANTS._STATUS_ATTACHED_;
                this.device = res.json().device;
                this.organization = this.device.organization;
                if (this.organization && this.organization.logo)   
                    this.organization.logo = this.conf.img_server + this.organization.logo;

                // Setting socket
                this.socketSetting(token);                
                return this.device;
    
            });
    }
   
    // Connect socket and all hook functions 
    private socketSetting(token) {
        if (this.socket && this.socket.connected)       return;

        // Connect to socketio server
        //console.log("Connect to socket now");
        let socket_params = {
            query:"type=1&token=" + token, 
            path: this.conf.socketio_service.path,
            reconnection: true,
            reconnectionDelay: CONSTANTS.SOCKET_RECONNECTION_DELAY,
            reconnectionDelayMax : CONSTANTS.SOCKET_RECONNECTION_DELAY_MAX,
            reconnectionAttempts: Infinity                        
        }
        let socket = io.connect(this.conf.socketio_service.root, socket_params);
        let self = this;

        socket.on('connect', function(data) {
            console.log("Socket connected to: ", socket.id);
        });
        
        socket.on('update_device', function(data) {
            // console.log(socket.id);
            self.resetAppState();
            self.initApplication();
        });
        
        socket.on('signout_device', function(data) {
            //console.log('signout_device', data);
            self.auth.logout();
            socket.disconnect();
            self.resetAppState();
            self.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_LOGIN);

            // Send Logged out event
            self.eventService.sendEvent(CONSTANTS.EVENT_TYPE_LOGGED_OUT);
        });

        socket.on('update_customer', function(customer, attached_info) {
            // console.log('update_customer', customer);
            self.customer = customer;           // For using in Thank page
            self.invitation.customer = customer;
            self.invitation.attached_info = attached_info;
            self.openGreetingMessagePage();
        });
        
        // Just clear all customer information and close invitation dialog (If it's appearing)
        socket.on('reset_customer', function(data) {
            self.customer = null;
            self.invitation.customer = null;
            self.invitation.attached_info = null;
            // self.fbService.resetFeedback();
            if ( self.mdlg_handle ) {
                self.mdlg_handle.dismiss();
            }
            
        });
        
        // Clear customer information, 
        socket.on('reset_feedback', function(data) {
            self.customer = null;
            self.invitation.customer = null;
            self.invitation.attached_info = null;
            if ( self.mdlg_handle ) {
                self.mdlg_handle.dismiss();
            }            
            self.fbService.resetFeedback();
            self.fbService.survey.resetState();
            self.survey = null;
            self.runFirstSurvey();
           
        });
        
        // This event is applied for Android only
        socket.on('close_device', function(data) {
            // Check Android os
            if (Util.getMobileOperatingSystem() != CONSTANTS.OS_NAME_ANDROID)       return;
            if (!navigator['app'])      return;

            // Send Logged out event
            self.eventService.sendEvent(CONSTANTS.EVENT_TYPE_CLOSEAPP);
            
            socket.disconnect();
            navigator['app'].exitApp();
        });
        
        this.socket = socket;
    }

    /**
    * Get Active survey for device. If not success, goto Idle page
    */  
    public getActiveSurvey() {
        let token = this.auth.getToken();
        let headers = new Headers({ 'Authorization': 'BEARER ' + token, 'Content-Type': 'application/json'});
        let options = new RequestOptions({ headers: headers });
        
        // Device is active. Now get active survey 
         //Observable.create(observer => {
        return this.http.get(this.conf.core_Service + "v1.5/device/active_survey", options).map (
            (res) => {
                this.survey_data = res.json();
                //console.log('this.survey', this.survey);
                // this.status = CONSTANTS._STATUS_AVTIVE_SURVEY_;
                //observer.next(this.survey);
                //observer.complete();
                return this.survey_data;
            });
        // });
    }
    
    /**
    * Get all data for running device survey: organization, proverbs, tabs, configs
    */
    public getDeviceData() {
        if (!this.request_options)  return null;  
        let request_Set = [];
        
        // Get organization name
        if (this.organization && this.organization.id) {
            var uri = "fieldtext/list/organization/name/" + this.organization.id;
            let org_names = this.http.get(this.conf.core_Service + uri, this.request_options).map(
                (res) => {
                    this.organization.org_names = res.json();
                    return this.organization.org_names;
                },
                (error) => {
                    this.httpErorProcessing(error);
                }
            );
            request_Set.push(org_names);
        }

        //get proverbs
        let proverbs_req = this.http.post(this.conf.core_Service + "v160/device/proverbs", "{}",
			this.request_options).map(
				(res) => {
                    let proverbs_data = res.json();
					this.proverbs = new Proverbs(proverbs_data);
                    return proverbs_data;
				},
				(error) => {
					this.httpErorProcessing(error);
				}
			);
        request_Set.push(proverbs_req);
        
        //Get device tabs
        let tab_req =  this.http.get(this.conf.core_Service + "device/tabs", 
        this.request_options).map(
            (res) => {
                this.tabs = [];
                var tabs = res.json();
                
                // Get default language for tabs
                for (var i = 0; i < tabs.length; i++) {
                    let tab = tabs[i];
					tab.tab_names = tab.label_texts;
                    this.tabs[tab.function] = tab;
                }
                return tabs;
            },
            (error) => {
                this.httpErorProcessing(error);
            }
        );
        request_Set.push(tab_req);
    
        // Get device configuration, Get only active config
        let param = {status: CONSTANTS.CONFIG_ACTIVE};
        let config_req = this.http.post(this.conf.core_Service + "device/configs", JSON.stringify(param), 
        this.request_options).map(
            (res) => {
                // Processing config data
                let configs = res.json();
				this.configs = [];
                if (configs && configs.length>0) {
                    for (var i=0; i<configs.length; i++) {
                        this.configs[configs[i].cfg_key] = configs[i];
                    }
                }
                // Init timeout value for pages
                if (this.configs['FEEDBACK_TIMEOVER'])
                    this.page_timeout_length = this.configs['FEEDBACK_TIMEOVER'].value;
                return configs;
            },
            (error) => {
                this.httpErorProcessing(error);
            }
        );
        request_Set.push(config_req);
        
        // Join all here
        return forkJoin(request_Set);
    }

	// PreProcessing device data and then run survey
	private afterInit() {
        // Set header for feedback message
        this.header = {
            "device_id": this.device.id,
            "grp_id": this.device.grp_id,
        }
        if (this.survey_data && this.survey_data.promotion)
            this.header["pro_id"] = this.survey_data.promotion.id;
        else 
            this.header["pro_id"] = null;
		
		// Init Feedback service
		if (!this.fbService.initSurvey(this.survey_data)) {
			this.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_IDLE);
			return;
		}
        this.fbService.initPromotionCode();
		
		// Update language for application
        this.setupLanguageData();
        this.updateDeviceLanguage(this.languages.selected);
        
        // Goto firt survey page
		this.runFirstSurvey();
		
        // Other configuration
		this.fbService.messageHeader = this.header;
        this.fbService.invitation = this.invitation;
		// Set background images
		if (this.configs['DEVICE_BGR_IMG']) {
			let url = this.conf.img_server + this.configs['DEVICE_BGR_IMG'].value;
			Util.setObjectBackgroundImage("page-tabs", url);
		} else {
            Util.setObjectBackgroundColor("page-tabs", "white");
        }
        
		this.status = CONSTANTS._STATUS_INIT_SUCCESS_;
        this.util.closeAlertMessage();

        // Send logged event
        this.eventService.sendEvent(CONSTANTS.EVENT_TYPE_LOGGED_IN);
	}
    
    public runFirstSurvey() {
        this.survey = this.fbService.survey.goNext();
        if (!this.survey) {
            // Error in this survey, display message
            this.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_IDLE);
            this.status = CONSTANTS._STATUS_NO_SURVEY_;
            return this.util.showAlertMessageByID("message.SURVEY_INACTIVE");
        }

        var page = this.survey.page;
        this.navCtrl.getActiveChildNav().select(page);
    }

    public openGreetingMessagePage() {
		if (this.mdlg_handle)	this.mdlg_handle.dismiss().catch(() => {
            console.log("Dialog dismissed");
        });

		// Open popup style
		let data = {};
		let opts = { enableBackdropDismiss: false, showBackdrop: true };
		this.mdlg_handle = this.modalCtrl.create(this.MessagePage, data, opts);
		this.mdlg_handle.present();
	}
    
    public resetAppState() {
        this.status = CONSTANTS._STATUS_NOT_INIT_;
        this.survey = null;
        this.survey_data = null;
        this.configs = null;
    }
    
    public getAllLanguages() {
        return this.conf.LANGUAGES;
    }
    
    // Get languages configures by user in administration system
    public getUserLanguages() {
        let langs = this.getAllLanguages();

        let user_langs = [];
        if (this.configs && this.configs['DEVICE_LANGUAGES']) {
            let cfgDeviceLangs = this.configs['DEVICE_LANGUAGES'];
            let ids = cfgDeviceLangs.value.split(",");
            if (ids && ids.length) {
                for (let i=0; i<ids.length; i++) {
                    let index = Util.findObjectByKey(langs, "id", ids[i]);
                    if (index>=0)   user_langs.push(langs[index]);
                }
            }
        } else {
			user_langs = langs;
		}
        return user_langs;
    }

    // Return default language from language list
    // Input: list of language; 
    // Output: default language
    public getDefaultLanguage(langs) {
        let default_index = -1;
        
        // Second priority from administration configuration
        if (this.configs && this.configs['DEVICE_LANGUAGE_DEFAULT']) {
            default_index = Util.findObjectByKey(langs, "id", this.configs['DEVICE_LANGUAGE_DEFAULT'].value);
        }
        
        if (default_index < 0)
            // Get default language in this application config
            default_index = Util.findObjectByKey(langs, "default", true);
            
        return langs[default_index];
    }
    
    // Setup data for language combobox
    public setupLanguageData() {
        let langs = this.getUserLanguages();
        let default_lang = this.getDefaultLanguage(langs);
        this.translate.setDefaultLang(default_lang.code);

        this.languages.selected = default_lang;
        this.languages.datas = langs;
    }
    
    // Update language for item in device: organization, tab labels
    public updateDeviceLanguage(langSelected) {
        if (!langSelected)      return;
        let lang_id = langSelected.id;
       
        // Update company name
        if (this.organization && this.organization.org_names && 
            this.organization.org_names.length>1) {
            for (var i=0; i<this.organization.org_names.length; i++) {
                if (this.organization.org_names[i].lang_id == lang_id) {
                    this.organization.name = this.organization.org_names[i].value;
                    break;
                }
            }
        }
        
        // Update for tabs
		if (this.tabs && this.tabs.length) {
            for (let i=0; i<this.tabs.length; i++) {
                let tab = this.tabs[i];
				if (tab.tab_names && tab.tab_names.length>0) {
                    let i=0;
                    for (i=0; i<tab.tab_names.length; i++) {
                        let label = tab.tab_names[i];
						if (label.lang_id == lang_id) {
                            tab.label = label.value;
                            break;
                        }
                    }
                    if (i==tab.tab_names.length)    tab.label = null;
				}
            }

			// this.tabs.forEach( function(tab) {
			// 	if (tab.tab_names && tab.tab_names.length>0) {
            //         let i=0;
            //         for (i=0; i<tab.tab_names.length; i++) {
            //             let label = tab.tab_names[i];
			// 			if (label.lang_id == lang_id) {
            //                 tab.label = label.value;
            //                 break;
            //             }
            //         }
            //         if (i==tab.tab_names.length)    tab.label = null;
			// 	}
			// });
		}
    }

}
