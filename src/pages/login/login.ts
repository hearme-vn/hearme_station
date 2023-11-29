import { Component } from '@angular/core';
// import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
// import { TranslateService } from '@ngx-translate/core';

import { BasePage } from '../../providers/feedback-service/basepage';
import { AuthService } from '../../providers/auth-service/auth-service';
import { AppInit } from '../../providers/app-init/app-init';
import { Config } from '../../app/config';
import { Util } from '../../providers/feedback-service/utils';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginPage extends BasePage {
    loading: any;
    registerCredentials = { device_id: '', device_secret: '', isSetUrl:false, url:'', hardware_id: '' };
    public unregisterBackButtonAction: any;
    public appUpdateCallBack;
    
    constructor(
        public conf: Config,
        // private translate: TranslateService, 
        private auth: AuthService,
        public appInit: AppInit,
        public util: Util,
        // private androidFullScreen: AndroidFullScreen,
        private barcodeScanner: BarcodeScanner ) {
            
        super(appInit);
/* 
        if (this.platform.is('android')) {
            this.androidFullScreen.isImmersiveModeSupported()
                .then(() => this.androidFullScreen.immersiveMode())
                .catch((error: any) => console.log(error));
        }
 */
        // Update hardware_id
        let p_device = this.util.getDeviceInformation();
        this.registerCredentials.hardware_id = p_device.hardware_id;
    }

    public loadPage() {
        this.appInit.setupLanguageData();
        // this.appInit.eventService.httpService.resend_batchjob();
    }

    public login() {
        this.showLoading()
        if (this.registerCredentials.url) {
            this.conf.reConfigureAPI(this.registerCredentials.url);
        } else {
            this.conf.setDefaultAPI();
        }
        this.auth.login(this.registerCredentials).subscribe(
            res => {
                this.appInit.initApplication();
            },
            error => {
                this.showError(error);
            }
        );
    }
    
    showHideUrl() {
        this.registerCredentials.isSetUrl = !this.registerCredentials.isSetUrl;
        if (!this.registerCredentials.isSetUrl) {
            this.registerCredentials.url = '';
        }
    }
    
    showLoading() {
        this.loading = this.util.showProgressive('LOGIN_processing');
    }
    
    showError(error) {
        this.loading.dismiss();
    
        if (error.status==0) {
            //this.util.showAlertMessageByID("message.NETWORK_DISCONNECTED");
            this.util.showToastMessageByID("message.NETWORK_DISCONNECTED");
        } else {
            this.util.alertErrorResponse(JSON.parse(error._body));
        }
    }
 	
    ionViewWillLeave() {
        if (this.loading != null)    this.loading.dismiss();
    }
    
    barcodeScan() {
        this.barcodeScanner.scan().then(
        (barcodeData) => {
            //console.log('barcodeData', barcodeData);
            if (barcodeData.format == 'QR_CODE') {
                if ( barcodeData.text.indexOf('_') >= 0) {
                    var temps = barcodeData.text.split("_");
                    if (temps.length >= 2) {
                        this.registerCredentials.device_id = temps[0];
                        this.registerCredentials.device_secret = temps[1];
                        if (temps.length==3) {
                            this.conf.reConfigureAPI(temps[2]);
                            this.registerCredentials.url = temps[2];
                        }  else {
                            this.conf.setDefaultAPI();
                            this.registerCredentials.url = null;
                        }
                        
                        this.showLoading();
                        this.auth.login(this.registerCredentials).subscribe(
                            res => {
                                this.appInit.initApplication();
                            },
                            error => {
                                this.showError(error);
                            }
                        );
                        return;
                    }
                }
            }
            this.util.showAlertMessageByID("message.BARCODE_INVALID");
        }, (err) => {
            this.util.showAlertMessageByID("message.BARCODE_ERROR");
        });
    }
}
