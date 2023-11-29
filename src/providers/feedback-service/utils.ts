import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device';
import { NativeAudio } from '@ionic-native/native-audio';
import { NavController, Platform } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { md5 } from '../md5/md5';

import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ToastController } from 'ionic-angular';

import { CONSTANTS } from './constants';

/**
* General utility class
*/
@Injectable()
export class Util {
    private alert_handle: any;
    public navCtrl: NavController;
    
    constructor(
        private loadingCtrl: LoadingController, 
        public pdevice: Device, 
        public alertCtrl: AlertController,
        public platform: Platform,
		private screenOrientation: ScreenOrientation,
 
        // private toast: Toast,
        public toastController: ToastController,
        public translate: TranslateService
        ) {        
    }

    public getDeviceInformation() {
		let device_infor = {
			// For running in device
			"cordova": this.pdevice.cordova,
			"os": this.pdevice.platform? this.pdevice.platform: "n/a",
			"type": 0,  // Tablet
			"hardware_id": this.pdevice.uuid? this.pdevice.uuid: Util.makeRandomString(CONSTANTS.APP_HARDWARE_ID_LENGTH),
			"model": this.pdevice.model,
			"version": this.pdevice.version,
			"manufacturer": this.pdevice.manufacturer,
			// "isVirtual": this.pdevice.isVirtual,
			"serial": this.pdevice.serial,
		}

        // console.log('device_infor', device_infor);
        return device_infor;
    }

	// Convert date to ISO format, example: 2018-04-23T10:26:00.996Z
    static toISOFormat(date) {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    }

	/**
     *  Change timezone of datetime d
     * @d input date time
     * @offset time zone
     * */
	static changeTimeZone(d, offset) {
		// convert to msec 
		// add local time zone offset
		// get UTC time in msec
		let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
	   
		// create new Date object for different zone
		// using supplied offset
		return new Date(utc + (3600000*offset));
	}
    
	// Extract captcha information
	static extractCaptchaInfomation() {
		if (document.getElementById('g-recaptcha-response')) {			
			let g_response = (<HTMLInputElement>document.getElementById('g-recaptcha-response')).value;
			//console.log(g_response);
			return g_response;
		}
	}
    
    
    static processContent(content) {
        if (!content)   return null;
        
        let ret = content.replace(/\\n/g, "<br/>");
        return ret;
    }
    
    // Validate email address
    static isEmail(email: string): boolean {
        let  serchfind:boolean;

        let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        serchfind = regexp.test(email);
        
        return serchfind
    }    

    // Validate email address
    // Check length: 10 or 11 digits
    static isPhoneNumber(phone: string): boolean {
        if (!phone)     return false;
        
        let digits = phone.replace(/\D/g, "").length;        
        
        return (digits==10 || digits==11);
    }
	
	/**
	* Set backgound image for specific object
	*/
	static setObjectBackgroundImage(obj, bgrImg) {
		if (!obj || !bgrImg)	return;
			
 		var classElements = document.getElementsByTagName(obj);
		if (classElements && classElements.length) {
			var urlString = 'url(' + bgrImg + ')';
			classElements[0].style.background = urlString;
		}
	}
    
	/**
	* Set html element attribute
    * Input: 
    * - obj: string - object selector
    * - attr: string - Attribute name
    * - val: Atrribute value
	*/
	static setAppendAttributeValue(obj, attr, val) {
		if (!obj || !attr)	return;
			
 		var classElements = document.getElementsByTagName(obj);
		if (classElements && classElements.length) {
            let classes = classElements[0].getAttribute(attr);
            if (!classes.includes(val))
                classElements[0].setAttribute(attr, classes + " " + val);
		}
	}

	static setAttributeValue(obj, attr, val) {
		if (!obj || !attr)	return;
			
 		var classElements = document.getElementsByTagName(obj);
		if (classElements && classElements.length) {
            classElements[0].setAttribute(attr, val);
		}
	}

	/**
	* Set backgound image for specific object
	*/
	static setObjectBackgroundColor(obj, color) {
		if (!obj || !color)	return;
			
 		var classElements = document.getElementsByTagName(obj);
		if (classElements && classElements.length) {
            classElements[0].style.background = null;
			classElements[0].style.backgroundColor = color;
		}
	}

	/**
	* Clear backgound image for specific object
	*/
	static clearObjectBackground(obj) {
			
 		var classElements = document.getElementsByTagName(obj);
		if (classElements && classElements.length) {
			classElements[0].style.background = null;
		}
	}

    /**
     * Update elements atrributes, inputs:
     * - selector: use css selector
     * - att: attribute
     * - val: value for attribute
    */
    static updateElementAttributes(selector, att, val) {
        let elements = document.querySelectorAll( selector );
        if (elements && elements.length)
            // elements.forEach(elem => {
            //     elem.style.setProperty(att, val);                
            // });
            for (let i=0; i<elements.length; i++) {
                elements[i].style.setProperty(att, val);
            }
        else 
            return false
        
        return true;
    }
    
    /**
     * Update main corlor for items
    */
    static updateMainColor(main_color) {
        Util.updateElementAttributes(".main_background_color", "background-color", main_color);
        Util.updateElementAttributes(".main_text_color", "color", main_color);
        Util.updateElementAttributes(".main_border_color", "border-color", main_color);
    }

    // Search by one key
    static findObjectByKey(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return i;
            }
        }
        return -1;
    }

    // Use LocalStorage to get and set value by key
    static setConfigStorageByKey(key, value) {
        return localStorage.setItem(key, value);
    }
    	
    // Use LocalStorage to get and set value by key
    static getConfigStorageByKey(key) {
        return localStorage.getItem(key);
    }

    /**
     * make random string with length specified in @length
     * @seed is string contains letters for result string
     * @length is length of random string
    */
    static makeRandomString(length, seed=null) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        if (seed && seed.length)    possible = seed;

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    // Method to show alert text messages
    public showAlertTextMessage(message) {
        if (this.alert_handle)  this.alert_handle.dismiss();
        
        this.alert_handle = this.alertCtrl.create({
            title: message,
            buttons: [{ text: this.translate.instant('TOAST_BUTTON_CLOSE')}]
        });
        this.alert_handle.present();
        return this.alert_handle;
    }

    // Method to show alert with message id
    // Input is message id from language definition
    public showAlertMessageByID(MSG_ID) {
        return this.showAlertTextMessage(this.translate.instant(MSG_ID));
    }
    
    // Show alert message for http call by Checking error code and message
    // Default use toast to show alrt message, but can assign alert function
    public alertErrorResponse(err) {
        if (!err)   return;
        
        let message = "";
        if (err.code) {
            message = this.translate.instant("httpcode." + err.code);
        } else {
            message = err.message;
        }
        if (!message)   message = this.translate.instant("message.UNKNOWN");
        this.showToastMessage(message);
    }
    
    // Close all alert message that shown
    public closeAlertMessage() {
        if (this.alert_handle)  this.alert_handle.dismiss();
    }

    // Show progressive bar with message from language definition
    public showProgressive(message_id) {
        let loading = this.loadingCtrl.create({
            content: this.translate.instant(message_id),
            dismissOnPageChange: true
        });
        loading.present();
        return loading;
    }

    /**
     * Show toast message, with following options:
     * - message
     * - position: 'center', 'bottom', 'top'
     * - duration: time in seconds
     * - cssClass
    */
    async showToastMessage(message, opts=null) {
            
        if (this.alert_handle)      this.alert_handle.dismiss();
        
        if (!opts) {
            opts = {
                showCloseButton: true,
                closeButtonText: this.translate.instant('TOAST_BUTTON_CLOSE'),
                message: message
            }
        } else {
            opts.showCloseButton = true;
            opts.closeButtonText = this.translate.instant('TOAST_BUTTON_CLOSE');
            opts.message = message;
        }
        if (!opts.position)     opts.position="top";
        if (!opts.duration)     opts.duration=CONSTANTS.APP_TOAST_INTERVAL;
        if (!opts.cssClass)     opts.cssClass = Util.getOrientation();

        this.alert_handle = await this.toastController.create(opts);

        this.alert_handle.present();
        return this.alert_handle;
    }
    
    // duration: time in seconds
    public showToastMessageByID(MSG_ID, opts=null) {
            
        let message = this.translate.instant(MSG_ID);
        return this.showToastMessage(message, opts);
    }

    /**
     * Delete object's properties that its value is null or empty
     * */ 
    static cleanObject(obj) {
        for (let prop in obj) { 
            if (obj[prop] === null || obj[prop] === undefined) { 
                delete obj[prop]; 
            } 
        }
        return obj     
    }

    /**
     * HTML5 API to detect mobile operating system 
    */
    static getMobileOperatingSystem() {
        //let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        let userAgent = navigator.userAgent || navigator.vendor;
    
          // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return CONSTANTS.OS_NAME_WINDOWSPHONE;
        }
    
        if (/android/i.test(userAgent)) {
            return CONSTANTS.OS_NAME_ANDROID;
        }
    
        //if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        if (/iPad|iPhone|iPod/.test(userAgent)) {
            return CONSTANTS.OS_NAME_IOS;
        }
    
        return CONSTANTS.OS_NAME_OTHERS;
    }    

	/**
     * Get device orientation type, 
     * return value: portrait / landscape
     * */ 
	static getOrientation() {       
        let default_type = "portrait";
		let sw = window.screen.width;
		let sh = window.screen.height;
		
		if(window.innerWidth !== undefined && window.innerHeight !== undefined) { 
			sw = window.innerWidth;
			sh = window.innerHeight;
		}
		if (sw>sh) 	default_type = "landscape";

/* 		
        let os = this.getMobileOperatingSystem();
        if (os == "iOS") {
    		let sw = window.innerWidth;
    		let sh = window.innerHeight;
    		if (sw>sh) 	default_type = "landscape";
    	} else {
 		    let sw = window.screen.width;
		    let sh = window.screen.height;
		    if (sw>sh) 	default_type = "landscape";
        }	 */
		
    	return default_type;
	}

	/**
     * Get device orientation type, 
     * return value: portrait / landscape
     * */ 
     public getDeviceOrientation() {
        if (this.isMobileApp()) {
            // console.log("Mobile orientation: ", this.screenOrientation.type);
            // Android, iOS and other mobile os
            // if (this.screenOrientation.type==this.screenOrientation.ORIENTATIONS.LANDSCAPE || 
            //     this.screenOrientation.type==this.screenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY || 
            //     this.screenOrientation.type==this.screenOrientation.ORIENTATIONS.LANDSCAPE_SECONDARY) {
                 
            if (this.screenOrientation.type && this.screenOrientation.type.length) {
                return this.screenOrientation.type.split("-")[0];
            } else {
                return "portrait";
            }
        } else {
            // For web app
            // console.log("Web app orientation");
            return Util.getOrientation();
        }
    }

    /**
     * Check if user is running device app or web app
    */
    public isMobileApp() {
        if (this.platform.is('core') || this.platform.is('mobileweb'))
            return false
        else 
            return true;
    }

    public getPlatform() {
        return this.platform;
    }

    /**
     * Check if this application is running in specific OS name, osName can be:
     * - Android
     * - iPhone
     * - iPad
     * - Macintosh: for Macbook
     * - Win: For Windows
    */
    static isOS(osName) {
        return navigator.appVersion.indexOf(osName) != -1;
    }


    /**
     * Play thank sound by selected language
     * @input selected language
    */
    playThankSound(selected_lang) {
        // Play sound of thank words
        let thanks_file = "assets/sounds/thanks_" + selected_lang.code + ".mp3";

        let thank_sound_handle = new SoundPlayer(this.platform, thanks_file);
        if (thank_sound_handle)    thank_sound_handle.play();
    }
}

// Hybrid player for web and native platform
export class SoundPlayer {
    private audio: any;
    private sound_id: any;
    private platform: any;
    private nativeAudio: any;
    
	constructor(platform: Platform, src: String) {
        this.platform = platform;
        this.nativeAudio = new NativeAudio();
        
         if (this.platform.is('cordova')) {
            this.sound_id = md5(src);
            this.nativeAudio.preloadComplex(this.sound_id, src, 1, 2, 0).then((success)=>{
                // console.log("load sound success: ", src);
            },(error)=>{
                console.log(error);
            });
        } else {
            this.audio = this.loadHTML5Sound(src);
        }        
	}

    public loadHTML5Sound(src) {
        let audio = new Audio();
        audio.src = src;
        audio.load();
        return audio;
    }
    
    public play() {
        if (this.platform.is('cordova')) {
            this.nativeAudio.play(this.sound_id).then((success)=>{
                // console.log("success playing");
            },(error)=>{
                console.log(error);
            });
        } else {
            this.audio.play();
        }        
    }
    
}

export class Proverbs {
	
	private proverbs;	
	
	constructor(proverbs: any) {
		this.proverbs = proverbs;
	}
	
	// Get list of proverbs by type and language id
	public getPrvsByType(type, lang_id) {
        let prvs = [];
		
		if (this.proverbs && this.proverbs.length) {
			for (let i=0; i<this.proverbs.length; i++) {
				let proverb = this.proverbs[i];
				if (proverb.lang_id == lang_id && 
					proverb.category == type) {
					prvs.push(proverb);
				}
			}
		}
		
		return prvs;
	}
	
	// Get ONE proverb by type and language id
	public getOneByType(type, lang_id) {
        let prvs = this.getPrvsByType(type, lang_id);

		if (prvs.length) {
			let random = Math.floor(Math.random() * (prvs.length-1));
			let proverb = prvs[random];
            proverb.content = Util.processContent(proverb.content);
			return proverb;
			
		} else 
			return null;

	}
}
