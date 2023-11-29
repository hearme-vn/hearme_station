import { Injectable } from '@angular/core';

import { HttpService } from './http-service';
import { Util } from './utils';
import { CONSTANTS } from './constants';
import { Config } from '../../app/config';

/**
 * This class supports sending event to server
*/
@Injectable()
export class EventService {    
    constructor(public httpService: HttpService,
        private util: Util,
        private conf: Config) {
    }

    /**
     * Send event log to server
    */
    sendEvent(event_type, meta=null) {
        let message_type = CONSTANTS.MESSAGE_TYPE_EVENT;

        let message = this.util.getDeviceInformation();
        message.type = event_type;
        if (meta)   message["meata"] = meta;

        message["source"] = CONSTANTS.EVENT_SRC_DEVICE;

		let destination_date = Util.changeTimeZone(new Date(), this.conf.SERVER_TIMEZONE);
        message["created"] = Util.toISOFormat(destination_date);

        // this.httpService.sendMessage(message_type, message)
    }

}
