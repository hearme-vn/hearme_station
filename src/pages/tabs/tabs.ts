import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Dialogs } from '@ionic-native/dialogs';
import { Autostart } from '@ionic-native/autostart';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';

import { LoginPage } from '../login/login';
import { ThanksPage } from '../thanks/thanks';
import { FactorsInfoPage } from '../factors-info/factors-info';
import { IdlePage } from '../idle/idle';
import { CollectionPage } from '../collection/collection';
import { MessagePage } from '../message/message';
import { WelcomePage } from '../welcome/welcome';
import { IndexSurveyPage } from '../index-survey/index-survey';
import { SupportSurveyPage } from '../support-survey/support-survey';

import { BasePage } from '../../providers/feedback-service/basepage';
import { Util } from '../../providers/feedback-service/utils';
import { AppInit } from '../../providers/app-init/app-init';
import { EventService } from '../../providers/feedback-service/event-service';
import { CONSTANTS } from '../../providers/feedback-service/constants';
import { HttpService } from '../../providers/feedback-service/http-service';

@Component({
    selector: 'page-tabs',
    templateUrl: 'tabs.html',
})
export class TabsPage extends BasePage{
    // Define pages  
    private Login: any;
    private Thanks: any;
    private Idle: any;
    private Collections: any;
    private CusGreeting: any;
	private Welcome: any;
    private IndexSurvey: any;
    private SupportSurvey: any;

    constructor(
        // private config: Config, 
        private androidFullScreen: AndroidFullScreen,
		private autostart: Autostart,
        public  appInit: AppInit,
		private navCtrl: NavController, 
        private platform: Platform,
        private dialogs: Dialogs,
		private screenOrientation: ScreenOrientation,
        private eventService: EventService,
        private httpService: HttpService,
        private util: Util
        ) {
		super(appInit);

        this.appInit.navCtrl = this.navCtrl;
        this.appInit.ThanksPage = ThanksPage;
        this.appInit.FactorsInfoPage = FactorsInfoPage;
        this.appInit.MessagePage = MessagePage;

        this.httpService.navCtrl = this.navCtrl;
        
        this.Thanks = ThanksPage;
        this.CusGreeting = MessagePage;
        this.Idle = IdlePage;
        this.Collections = CollectionPage;
        this.Login = LoginPage;
        this.Welcome = WelcomePage;
        this.IndexSurvey = IndexSurveyPage;
        this.SupportSurvey = SupportSurveyPage;

        this.platform.ready().then(() => {
            this.appStart();
        });        
    }

    appStart() {
        if (this.platform.is('android')) {
            this.androidFullScreen.isImmersiveModeSupported()
                .then(() => this.androidFullScreen.immersiveMode())
                .catch((error: any) => console.log(error));
        }
		this.autostart.enable();
        
        // Init and detect screen orientation
        if (this.platform.is('core') || this.platform.is('mobileweb'))
            window.addEventListener('resize', function() {
                this.appInit.screen_orientation = Util.getOrientation();
            }.bind(this));
        else {
            this.appInit.screen_orientation = this.util.getDeviceOrientation();
            this.screenOrientation.onChange().subscribe(
                () => {
                    this.appInit.screen_orientation = this.util.getDeviceOrientation();
                    // console.log("New device orientation: ", this.appInit.screen_orientation);
                }
            );
        }

        // Sending event log
        this.eventService.sendEvent(CONSTANTS.EVENT_TYPE_STARTAPP);
    }

    // Register back button
    ionViewDidEnter() {	
        this.appInit.initApplication();
        this.initializeBackButtonCustomHandler();
    }
    
    public initializeBackButtonCustomHandler(): void {
        this.platform.registerBackButtonAction(() => {
             this.handleLogOutBackButton();
        }, 10);
    }
    
    public handleLogOutBackButton(): void {
        var self = this;
        this.dialogs.confirm("Do you want to close your application?", "Close application")
        .then(function(res) {
            if (res==1) { // OK button
                self.platform.exitApp();
            }
        })
    
    }
}
