import { NavController, Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Network } from '@ionic-native/network';

import { SqliteProvider } from '../sqlite/sqlite';
import { Config } from '../../app/config';
import { AuthService } from '../auth-service/auth-service';
import { CONSTANTS } from './constants';

/**
 * This class supports call APIs to server.
 * If calling failed, it store data in local storage and recall it later
*/
@Injectable()
export class HttpService {
    private batchjob_handl = null;
    private in_Resending = false;

    /**
     * True: if connected, False: if not connected
    */
    public online_state = true;
    public navCtrl: NavController;

    constructor(private conf: Config, private http : Http, private network: Network,
        public platform: Platform,
        public sqliteService : SqliteProvider, private auth: AuthService) {

        this.platform.ready().then(() => {
            setTimeout(() => {
                this.sqliteService.openDb();

                this.network.onConnect().subscribe(() => {
                    this.online_state = true;
                    console.log("Device online");
                });

                this.network.onDisconnect().subscribe(() => {
                    this.online_state = false;
                    console.log("Device OFFLINE");
                });
            }, 3000);   // 3 seconds after device was ready
        });
    }
    
    /**
     *  Send message to hearme server by post APIs.
     * @Input:type - type of post message
     *  0: send feedback message
     *  1: send event log
     */
    private post(type, payload) {
        // Check network connected
        if (!this.online_state)
            return Observable.create(observer => { console.log("Network disconnected")});

        let token: string;
        let url: string;
        
        switch (type) {
            case CONSTANTS.MESSAGE_TYPE_FEEDBACK: {
                token = this.auth.getToken();
                url = this.conf.dataFront_service + "message/create";
                break;
            }
            case CONSTANTS.MESSAGE_TYPE_EVENT: {
                token = this.conf.EVENT_LOG_TOKEN;
                url = this.conf.dataFront_service + "event/create";
                break;
            }
            default: {
                return;
            }
        }

        // Send feedback information
        let headers = new Headers({ 'Authorization': 'BEARER ' + token, 'Content-Type': 'application/json'});
        let options = new RequestOptions({ headers: headers });
        return this.http.post(url, payload, options);
    }
    
    /**
     * send data to server
     * Save to local storage if un-successful
    */
    public sendMessage(type, message, success_callback=null, error_callback=null) {
        let payload = JSON.stringify(message);

        if (!this.online_state) {
            let err_status = 0;     // Network disconnected

            // Save message to local storage
            let msg_date = new Date().toString();
            this.sqliteService.addMessage( type, payload, err_status, msg_date ).then(
                s => {
                    console.log(msg_date, ": Saved message to storage due to network disconnected");
                });
            return;
        }

        return this.post(type, payload)
            .subscribe(
                (res) => {
                    // console.log("Send message to system successfully", res.json());
                    if (success_callback)   success_callback(res);
                },
                (err) => {
                    console.log("Error in sending feedback, error code: ", err.status);
                    if (error_callback)    error_callback(err);

                    /** 
                     * Goto IDLE page if token is not authorized (401) or forbiden (403)
                     * */ 
                    if (err.status==401 || err.status==403) {
                        if (this.navCtrl)
                            this.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_IDLE);
                    }

                    /** 
                     * Save message to local storage if feedback data is valid (status is not 400)
                     * */ 
                    if (err.status!=400) {
                        let msg_date = new Date().toString();
                        this.sqliteService.addMessage( type, payload, err.status, msg_date ).then(
                            s => {
                                console.log(msg_date, ": Saved message to storage");
                            });    
                    }
                }
            );
    }

    // Function to re-send in batch job 
    public resend_batchjob() {
        this.batchjob_handl = setInterval(() => {
            this.reSendMessage();
        }, CONSTANTS.APP_SENDMESSAGE_INTERVAL);        
    }
    
    public stop_batchjob() {
        if (this.batchjob_handl)    clearInterval(this.batchjob_handl);
    }
    
    // Function to read messages from local storage and re-send to server
    public reSendMessage() {
        if (!this.online_state)     return;
        if (this.in_Resending)      return;

        // console.log("Start to read and re-send message"); 
        this.sqliteService.getRow().then (
            s => {
                let messages = this.sqliteService.arr;
                if (messages.length != undefined && messages.length > 0) {
                    this.in_Resending = true;
                    let message = messages[0];
                    // console.log("Start re-sending feedback: ", message);
                    this.post(message.type, message.payload)
                        .subscribe(
                            (res) => {
                                console.log("Re-Send feedback from local storage to system successfully", res.json());
                                // Delete message in storage
                                this.sqliteService.del(message.id).then(s => {});
                                this.in_Resending = false;
                            },
                            (err) => {
                                console.log("Error in re-send feedback, error code: ", err.status);
                                this.in_Resending = false;
                            }
                        );
                } else {
                    clearInterval(this.batchjob_handl);
                }
            }, 
            e => {
                clearInterval(this.batchjob_handl);
            }
        );
    }
    
}
