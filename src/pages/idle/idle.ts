import { Component } from '@angular/core';
import {CONSTANTS} from '../../providers/feedback-service/constants';
import {AuthService} from '../../providers/auth-service/auth-service';
import {AppInit} from '../../providers/app-init/app-init';

//@IonicPage()
@Component({
    selector: 'page-idle',
    templateUrl: 'idle.html',
})
export class IdlePage {
    
    //@ViewChild('videoIframe') videoIframe: ElementRef; 
    public linkIdle = 'assets/imgs/splash.png';
    //public linkVideo = '';
    //public mediaType = 0;//0: default, 1: image, 2: youtube
    
    
    constructor(
      private auth: AuthService,
      private appInit: AppInit,
    ) {
    }
    
    ionViewDidLoad() {
        //console.log('ionViewDidLoad IdlePage');
    }
    
    ionViewDidEnter() {
    }
    
    ionViewDidLeave() {
    }

    gotoLogin() {
        this.auth.logout();
        if (this.appInit.socket)    this.appInit.socket.disconnect();
        this.appInit.resetAppState();
        this.appInit.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_LOGIN);

        // Send Logged out event
        this.appInit.eventService.sendEvent(CONSTANTS.EVENT_TYPE_LOGGED_OUT);
    }
}
