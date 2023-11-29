import { Injectable } from '@angular/core';

@Injectable()
export class Config {
    public motions = ["RATING_unhappy", "RATING_accepted", "RATING_good", "RATING_excellent", "RATING_inloved"];
    public motions_nps = ["RATING_NPS_1", "RATING_NPS_2", "RATING_NPS_3", "RATING_NPS_4", "RATING_NPS_5", "RATING_NPS_6", "RATING_NPS_7", "RATING_NPS_8", "RATING_NPS_9", "RATING_NPS_10", "RATING_NPS_11"];
    public motions_ces = ["RATING_CES_extremely_difficult", "RATING_CES_very_difficult", "RATING_CES_fairly_difficult", "RATING_CES_neither", "RATING_CES_fairly_easy" ,"RATING_CES_very_easy", "RATING_CES_extremely_easy"];
    
    // Setting default language for application
    public DEFAULT_LANGUAGE='vn';
    
    public oauth_Service=		null;
    public core_Service=		null;
    public dataFront_service=	null;
    public socketio_service=	null;
    public img_server = 		null;

    public setDefaultAPI() {
        this.oauth_Service=		'https://api.hearme.vn/oauth/';
        this.core_Service=		'https://api.hearme.vn/main/';
        this.dataFront_service=	'https://api.hearme.vn/front/';
        this.socketio_service=	{ root: 'https://comm.hearme.vn', path: ""};
        this.img_server = 		'https://hearme.vn/img/';
    }

    //0.5 seconds to re-send feedback message from local storage
    public timeDelay = 500;

	public LANGUAGES = [
		{
			"id": '1',
			"name": "English",
			"code": "en",
			"flag": "assets/icon/en.svg",
			"default": false,
			"active": false,
			"selected": false
		},
        {
            "id": "2",
            "name": "中国",
            "code": "cn",
            "flag": "assets/icon/cn.svg",
            "default": false,
            "active": false,
            "selected": false
        },
        {
            "id": "4",
            "name": "한국어",
            "code": "ko",
            "flag": "assets/icon/kr.png",
            "default": false,
            "active": false,
            "selected": false
        },
        {
            "id": "3",
            "name": "Pусский",
            "code": "ru",
            "flag": "assets/icon/ru.svg",
            "default": false,
            "active": false,
            "selected": false,
		},
		{
			"id": '0',
			"name": "Tiếng Việt",
			"code": "vn",
			"flag": "assets/icon/vn.svg",
			"default": true,
			"active": false,
			"selected": false
		}

	]
	
	public SERVER_TIMEZONE=7;	// Timezone to store datetime in DB
	// public SERVER_TIMEZONE_STR="+07:00";	// Timezone to store datetime in DB
	
    constructor() {
        this.setDefaultAPI();   // For PRODUCTION
        // this.reConfigureAPI("http://222.252.6.164:7021");	// For DEV server
        // this.reConfigureAPI("http://222.252.6.164:7022");	// For sandbox server
    }
    
    public reConfigureAPI(root) {
		if (!root)	return;
		
		this.oauth_Service = root + "/oauth/";
		this.core_Service = root + "/main/";
		this.dataFront_service = root + "/front/";
		this.socketio_service = { 
			root: root,
			path: "/comm/socket.io"
		};
		this.img_server = root + "/img/";
	}

    // Event log token
    EVENT_LOG_TOKEN = "xxxxxx";

};
