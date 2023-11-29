import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { IndexComponent } from '../../providers/feedback-service/basecomponent';
import {Util} from "../../providers/feedback-service/utils";

/**
 * INFO Component for INFO survey
 * @author The NV <thenv4590@gmail.com>
 * @date Jun 26, 2021
 * 
 */
@Component({
    selector: 'info',
    templateUrl: 'info.html'
})
export class INFOComponent extends IndexComponent {
    @Input() private question: String;
    private isShowPromotionCode = false;
    private question_text: String;

    ngOnChanges() {
        super.ngOnChanges();
        if (this.question)    this.question_text = this.replateInfo(this.question);
    }

    private replateInfo(str){
        if (!str || !str.length)   return;
        
        // replace \n
        str = Util.processContent(str);

        // replace cusName
        if (str.includes('{CUS_NAME}')) {
            let cusName = this.appInit.customer && this.appInit.customer.name ? this.appInit.customer.name : '';
            str = str.replace(/{CUS_NAME}/g, cusName);
        }

        // replace promotion
        this.isShowPromotionCode = false;
        if (str.includes('{CUS_PROMOTIONCODE}')) {
            this.isShowPromotionCode = true;
            let promotionCode = this.appInit.fbService && this.appInit.fbService.promotion_code ? this.appInit.fbService.promotion_code : '';
            str = str.replace(/{CUS_PROMOTIONCODE}/g, promotionCode);
        }
        return str;
    }

}
