import { Component, Input } from '@angular/core';
import { AppInit } from '../../providers/app-init/app-init';
import { CONSTANTS } from '../../providers/feedback-service/constants';

/**
 * Generated class for the HeaderComponent component.
 *
 */
@Component({
  selector: 'ion-header',
  templateUrl: 'header.html'
})
export class HeaderComponent {

    @Input() survey: any;
    @Input() organization: any;
    @Input() service: any;
    @Input() controller: any;
    
    public banner_image = null;
    public header = "sub_header";
    public appConf=null;
    
    constructor(private appInit: AppInit) {
        let survey = this.appInit.survey;
        if (!survey || 
            survey.data.type == 0 ||
            survey.data.type == 1 ||
            survey.data.type == 2 ||
            survey.data.type == 10 ||
            survey.data.type == 13) {
            this.header = "main_header";
        }
    }
    
    ngOnChanges() {
        if (this.service) {
            this.organization = this.service.organization;
            this.survey = this.service.survey;
            this.appConf = this.service.conf;
            
            this.banner_image = null;
            if (this.survey && this.survey.data.theme && 
                this.survey.data.theme.header) {
                    
                this.banner_image = this.survey.data.theme.header;
            } else if (this.service.configs.DEVICE_HEADER_IMG && 
                this.service.configs.DEVICE_HEADER_IMG.value) {
                    
                this.banner_image = this.service.configs.DEVICE_HEADER_IMG.value;
            }
        }
    }
}
