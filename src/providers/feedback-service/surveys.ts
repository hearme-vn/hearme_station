import { Util } from '../feedback-service/utils';
import { CONSTANTS } from './constants';

/**
* General interface for survey
*/
interface SurveyINF {
    feedback: any;
    data: any;          // Store json of this Survey
    id: String;
    subs: any[];      	// Store factor surveys
    question: any;

    /**
     * - value true if user finished answering, otherwise, false
     * - This property is used for text survey
    */
    answered_survey: boolean;     

    // Getter / setter
    getData: () => any;
    getSubs: () => any;
    getId: () => String;

    // For routing survey
    goNext: () => Survey;
    goPrevious: () => Survey;
    getFirstSurvey: () => Survey;
    getLastSurvey: () => Survey;
    getSteps: () => number; // Get number of steps (screens) user take to answer feedback
    updateLastSurvey: () => void;
    
    // For working
    changeLanguage: (int) => void;
        
    // For working with object state
    getSurveyClass: () => Survey;
    resetState: () => void;
    
    // Working with feedback data
    is_Finished_feedback: () => boolean;
    updateFeedback: (any) => void;  // Update feedback data from pages to survey object
    needNotification: () => boolean;
	recursiveNotification: () => boolean;
    packageFeedback: () => any;   // Return feedback message
    
}

/**
* Abstract class survey
* Don not support sub survey
*/
class Survey {
    // Define state
    public SURVEY_STATE_START = -1; 
    public SURVEY_STATE_RUNNING = 0; 
    public SURVEY_STATE_CHILD_RUNNING = 1;
    public SURVEY_STATE_FINISHED = 1000;
    
    // Define child rule
    public CHILD_RULE_BAD = "bad"; 
    public CHILD_RULE_GOOD = "good"; 
    
    // State variables
    public lang_id = null;     // Default Vietnamese language
    public state: number = this.SURVEY_STATE_START;   // For routing purpose
    public page: number;    // Page number that runs this survey
    public isFirst = false;
    public isLast = false;
    public steps = 1;
    public position: number = 0; // Point to current survey
    public child: Survey = null; // For state management, rounting
    public child_rule: String = null;	// Rule used for routing childs
    public isShowInfo = false;
    public startTime: Date;     // Time when reset survey
    
    // Data to store feedback from userAgent
    public feedback: any = null;
    public check_notification = false;
    public notification = false;
    public notificationMessages = null;
    public notificationColor = null;
    public answered_survey: boolean = false;
    public severity: Number = 0;

    // Survey data
    public data: any;       // Store json of this Survey
    public promotion; any;  // Store promotion data
    public id: String;
    public question: String;
    public childs: Survey[] = [];	// Store child surveys
    public subs: any[] = [];      	// Store factor surveys
    public display_name = '';       // Name of survey that diplay in notification
    public rule: String = null;		// Condition to goto this child survey
    
    constructor(data: any) {
        this.data = data;
        this.id = data.id;
        this.question = Util.processContent(data.question);

        if (data.notification)      this.check_notification = true;
        
        // Create child surveys
        if (data.children && data.children.length > 0) {
            for (let i=0; i<data.children.length; i++) {
                let child_survey = createSurvey(data.children[i]);
                child_survey.rule = data.children[i].relation.rule;
                this.childs.push(child_survey);
            }
        }
        
        // Factor surveys: for selection survey only
        if (data.subs && data.subs.length>0) {
            this.subs = data.subs;
            
            // Processing questions for subs
            for (let i=0; i<this.subs.length; i++) {
                // Update language for factor i
                var sub = this.subs[i];
                sub.question = Util.processContent(sub.question);
            }            
        }
        
        // Promotion data
        if (data.promotion)
            this.promotion = data.promotion;

		// Check theme. If theme is inactive, delete it 
		if (data.theme && data.theme.status!=CONSTANTS.THEME_ACTIVE) {
			data.theme = null;			
		}		
    }

    // Routing methods: For state transient
    // Return null if no other survey, otherwise return a survey
	// This method is for all survey types
    
    public isState(state) {
        return this.state == state;
    }
	
	public getChildRule() {};

    // Rule applied for child survey: good, bad
    public getNextChildForRule(rule) {
        if (rule==undefined || rule==null)      return null;
        if (!this.childs || this.childs.length<=0)      return null;      
        
        while (this.position<this.childs.length) {
            if (this.childs[this.position].rule==rule) {
                return this.childs[this.position];
            }
            this.position++;
        }
        // if (this.position==this.childs.length)  
            // this.position = 0
        return null;
    }

    // Rule applied for child survey: good, bad
    public getPreviousChildForRule(rule) {
        if (!this.childs || this.childs.length<=0) {
            return null;
        }
        
        this.position--;
        while (this.position>=0) {
            if (this.childs[this.position].rule==rule) {
                return this.childs[this.position];
            }
            this.position--;
        }
        if (this.position<0)    this.position = 0
        return null;
    }
    	
    public goNext() {
        // In Staring state
        if (this.isState(this.SURVEY_STATE_START)) {
            this.state = this.SURVEY_STATE_RUNNING;
			this.position = 0;
            return this;
        }
        
        if (this.isState(this.SURVEY_STATE_RUNNING)) {
            // In running main survey state        
            if (!this.feedback) {
                this.state = this.SURVEY_STATE_FINISHED;
                return null; // No answer. Cannot goto next state - not allowed
                //return this; // No answer. Cannot goto next state - not allowed
            }
			
			if (!this.childs || !this.childs.length) {
				// Return finished state
                this.state = this.SURVEY_STATE_FINISHED;
                return null;
			}
			
			this.getChildRule();			
            this.child = this.getNextChildForRule(this.child_rule);
            if (this.child) {
                this.state = this.SURVEY_STATE_CHILD_RUNNING;
                return this.child.goNext();         
            } else {
                this.state = this.SURVEY_STATE_FINISHED;
                return null;
            }
        }
		
		if (this.isState(this.SURVEY_STATE_CHILD_RUNNING)) {
            // In running child survey state, checking Child survey feedback
			let nextSurvey = this.child.goNext();
			if (nextSurvey)	return nextSurvey;
			
            this.position++;
            this.child = this.getNextChildForRule(this.child_rule);
            if (this.child) {
                return this.child.goNext();
            } else {
                this.state = this.SURVEY_STATE_FINISHED;
                return null;
            }
        }
		
        // In Finished state
        if (this.isState(this.SURVEY_STATE_FINISHED))    return null;
    }
    
    public goPrevious() {
        // In Finished state
        if (this.isState(this.SURVEY_STATE_FINISHED)) {
			this.child = this.getPreviousChildForRule(this.child_rule);
			if (this.child) {
				this.state = this.SURVEY_STATE_CHILD_RUNNING;
				return this.child.goPrevious();
			}
			
			this.state = this.SURVEY_STATE_RUNNING;
			this.position = 0;
			return this;
		}

		if (this.isState(this.SURVEY_STATE_CHILD_RUNNING)) {
			let pre_survey = this.child.goPrevious();
			if (pre_survey)		return pre_survey;

			this.child = this.getPreviousChildForRule(this.child_rule);
			if (this.child)		return this.child.goPrevious();

			this.position = 0
			this.state=this.SURVEY_STATE_RUNNING;
			return this;
		}
		
		if (this.isState(this.SURVEY_STATE_RUNNING) ||
			this.isState(this.SURVEY_STATE_START)) {			
			this.state=this.SURVEY_STATE_START;
            return null;
		}
    }
    
    public getFirstSurvey() {
        return this;
    }
    
    public getLastSurvey() {
        if (this.childs && this.childs.length>0) {
            return this.childs[this.childs.length-1].getLastSurvey()
        } else
            return this;    
    }
    
    // Get number of steps (screens) for user to send feedback
    public getSteps() {
        return this.steps;
    }
    
    public getSurveyClass() {
        return this;
    }
    
    public resetState() {
        this.state = this.SURVEY_STATE_START;
        this.feedback = null;
        this.notification = false;
        this.position = 0;
        this.startTime = new Date();
        this.severity = 0;
        
        if (this.childs && this.childs.length>0) {
            for (var i=0; i<this.childs.length; i++) {
                this.childs[i].resetState();
            }
        }
    }
    
    public updateFeedback(feedback) {
        this.feedback = feedback;
    };
    
    /**
     * Purpose: 
     * - Check if answering this survey is finished or not.
     * - This method is check and decide wherether application can move to next page
     * 
     * Method will check in three factors:
     * - Wherether survey is required or not
     * - Is there feedback data
     */ 
    public is_Finished_feedback() {
        if (!this.data.required)    return true;    // Survey is not required
        if (!this.feedback)     return false        // Feedback is empty
        return true;
    }
    
    public packageFeedback() {
        if (!this.feedback)   return null;
        
        this.feedback.sur_id = this.data.id;
        this.feedback.sur_path = this.data.sur_path;
        this.feedback.type = this.data.type;
        this.feedback.severity = this.getSeverity();
        // this.feedback.status = 0;   // Newly created        
    
        if (this.childs && this.childs.length > 0) {
            let children = [];
            for (var i=0; i<this.childs.length; i++) {
                let child_survey = this.childs[i];
                if (this.child_rule && this.child_rule!=child_survey.rule)
                    continue;
                
                let feedback = child_survey.packageFeedback();
                if (feedback) {
                    children.push(feedback);
                
                    // Update contact to root feedback
                    if (child_survey.data.type==CONSTANTS.SURVEY_TYPE_TEXT) {
                        this.feedback.comment = feedback.comment;
                        this.feedback.name = feedback.name;
                        this.feedback.contact = feedback.contact;
                    } if (child_survey.data.type==CONSTANTS.SURVEY_TYPE_CONTACT) {
                        this.feedback.name = feedback.name;
                        this.feedback.contact = feedback.phone;
                    }
                }
            }
            if (children.length > 0) {
				if (!this.feedback.children)
					this.feedback.children = children
				else
					this.feedback.children = this.feedback.children.concat(children);
			}
                

            // This logic may not be correct for supplementary survey
            // if (children.length < this.childs.length) {
                // this.feedback.status = CONSTANTS.FEEDBACK_STATUS_UNFINISHED;
            // }
            // if (!this.is_Finished_feedback())
            //     this.feedback.status = CONSTANTS.FEEDBACK_STATUS_UNFINISHED;
            
        }
        
        // Factor surveys: for selection survey only
        // if (this.subs && this.subs.length>0) {
        // //this.subs = data.subs;
        // }
        
        return this.feedback;
    }
    
    // Change language of question
    public changeLanguage(lang_id) {
        // Check language id
        // if (lang_id!=0 && lang_id!=1)   return;     // Invalid lang_id    
        if (this.lang_id == lang_id)    return;     // No language change
        
        this.lang_id = lang_id;
        this.updateSurveyLang(lang_id);
        
        // Change language for child survey
        if (this.childs && this.childs.length > 0) {
            for (var i=0; i<this.childs.length; i++) {
                this.childs[i].changeLanguage(lang_id);
            }            
        }        
	}
	
	// Update survey and factor's text for language
	// Value will be updated into main question and description
	public updateSurveyLang(lang_id) {
        // Change language for main question
        if (this.data.question_texts && this.data.question_texts.length>0) {
            for (let i=0; i<this.data.question_texts.length; i++) {
                if (this.data.question_texts[i].lang_id==lang_id) {
                    this.question = Util.processContent(this.data.question_texts[i].value);
                    break;
                }
            }
        }

        // Change language for col_posts
        if (this.data.col_posts && this.data.col_posts.length>0) {
            for (let i = 0; i < this.data.col_posts.length; i++) {
                let colPosts = this.data.col_posts[i];
                if (colPosts.content_texts && colPosts.content_texts.length > 0) {
                    for (let j = 0; j < colPosts.content_texts.length; j++) {
                        if (colPosts.content_texts[j].lang_id==lang_id) {
                            colPosts.content = Util.processContent(colPosts.content_texts[j].value);
                            break;
                        }
                    }
                }
            }
        }

        // Change language for factor questions
        this.isShowInfo = false;
        if (this.subs && this.subs.length>0) {
            for (let i=0; i<this.subs.length; i++) {
                // Update language for factor i
                let sub = this.subs[i];
                if (sub.question_texts && sub.question_texts.length>0) {
                    for (let k=0; k<sub.question_texts.length; k++) {
                        if (sub.question_texts[k].lang_id==lang_id) {
                            sub.question = Util.processContent(sub.question_texts[k].value);
                            break;
                        }
                    }
                }
				if (sub.description_texts && sub.description_texts.length>0) {
                    let k=0;
                    for (k=0; k<sub.description_texts.length; k++) {
                        if (sub.description_texts[k].lang_id==lang_id 
							&& sub.description_texts[k].value
							&& sub.description_texts[k].value.trim()) {
                            this.isShowInfo = true;
                            sub.description = Util.processContent(sub.description_texts[k].value);
                            break;
                        }
                    }
                    if (k==sub.description_texts.length)     sub.description = "";
                }
            }
        }
        
    }

    public getSeverity() {
        return this.severity;
    }

    /**
     * Based on rating level, define severity from 1-3.
     * 1 is the most serve; 3 is the least serve
    */
    public setSeverity() {
        // Get severity for this survey
        if (this.notification)
            this.severity = this.feedback.rating
        else
            this.severity = 0;

        return this.severity;
    }

    /**
     * Severity based on feedback for this survey and its child surveys
     * 1 is the most serve; 3 is the least serve
    */
    public setRecursiveSeverity() {
        this.setSeverity();

        // Get severity for its child surveys
        for (let i=0; i<this.childs.length; i++) {
            let child_severity = this.childs[i].setRecursiveSeverity();

            if (this.severity==0)
                this.severity = child_severity
            else 
                if ((child_severity>0) && (child_severity < this.severity))
                    this.severity = child_severity
        }

        return this.severity;
    }

    public recursiveNotification() {
        let messages = [];
        let color = 10;
		
		if (this.needNotification()) {
			messages = messages.concat(this.notificationMessages);
			color = this.notificationColor;
		}
        
        for (var i=0; i<this.childs.length; i++) {
            if (this.childs[i].recursiveNotification()) {
                messages = messages.concat(this.childs[i].notificationMessages);
                if (color > this.childs[i].notificationColor)   
                    color = this.childs[i].notificationColor;
                this.notification = true;
            }
        }
        if (this.notification && messages && messages.length) {
            this.notificationMessages = messages;
            this.notificationColor = color;
        }
        return this.notification;		
	}

    public needNotification() {
        if (!this.check_notification)   return false;
        
        if (this.notification && this.feedback && 
            (this.feedback.rating!=null) && (this.feedback.rating!=undefined)) {
            this.notificationMessages = [{
				rating: this.feedback.rating + "/" + this.data.scales,
                name: this.display_name
            }]; 
            this.notificationColor = this.severity;
        }
        return this.notification;
    }

    // Calculate and check last survey
    public updateLastSurvey() {
        if ((this instanceof MainSurvey) ||
            (this instanceof MIXED && this.childs && 
            this.childs.length>0 && 
            this.childs[this.childs.length-1] instanceof MainSurvey)) {
            
            // Re-calculate last survey
            let last = this.getLastSurvey();
            if (last)    last.isLast = true;

        }
    }
    
    public getData() {
        return this.data;
    }

    public getSubs() {
        return this.subs;
    }

    public getId() {
        return this.id;
    }

}

/**
* For surveys: Multi Selection, Exclusive selection, rating and comment
*/
class SupSurvey extends Survey implements SurveyINF {
        
    isSentFeedback() {
        if (this.feedback) 
            return true
        else
            return false;
    }

    public resetState() {
        super.resetState();
        
        if (this.subs && this.subs.length>0) {
            for (var i=0; i<this.subs.length; i++) {
                this.subs[i].rating = 0;
            }
        }    
    }
}

/**
* Class for selection survey
*/
class MULTISELECTION extends SupSurvey {
    page = CONSTANTS.PAGE_SUPPORT_SURVEY;
    // page = CONSTANTS.PAGE_INDEX_MULTI;


}

/**
* Class for Rating survey
*/
class RATING extends SupSurvey {
    page = CONSTANTS.PAGE_SUPPORT_SURVEY;
    // page = CONSTANTS.PAGE_INDEX_QUESTIONS;
	//check_notification = CONSTANTS.NOTIFICATION_5STARS_DEFAULT;   //Deprecated
    RATING_THRESHOLD = 3;

    public needNotification() {
		if (!this.check_notification)	return false;
		if (!this.subs || !this.subs.length)	return false;

		let messages = [];
		this.notificationColor = 5;
		for (var i=0; i<this.subs.length; i++) {
			if (this.subs[i].rating>0 && 
				this.subs[i].rating<=this.RATING_THRESHOLD) {
				this.notification = true;	
				messages.push({
					rating: this.subs[i].rating + "/" + this.subs[i].scales,
					name: this.subs[i].question
				});
				if (this.notificationColor > this.subs[i].rating)
					this.notificationColor = this.subs[i].rating;				
			}
			
		}
		if (this.notification)	this.notificationMessages = messages;
        return this.notification;
    }

    public setSeverity() {
        if (!this.check_notification) {
            this.severity = 0;
            return this.severity;
        }

        // Get severity for its child surveys
        for (var i=0; i<this.subs.length; i++) {
            if ((this.subs[i].rating>0) && (this.subs[i].rating<=this.RATING_THRESHOLD)) {
                if (this.severity==0)
                    this.severity = this.subs[i].rating
                else
                    if (this.subs[i].rating<=this.severity) {
                            this.severity = this.subs[i].rating
                    }
            }
        }
        return this.severity;
    }    

}

/**
* Class for Text survey
*/
class TEXT extends SupSurvey {
    page = CONSTANTS.PAGE_SUPPORT_SURVEY;

    // page = CONSTANTS.PAGE_INDEX_COMMENTS;
    
    public resetState() {
        this.answered_survey = false;        
        super.resetState();
    }  

    /**
     * Text component check required fields. 
     * If all required fields were filled, it create a feedback
    */
    public is_Finished_feedback() {
        return this.answered_survey;
    }

}

/**
* Class for Contact survey
*/
class Contact extends SupSurvey {
    page = CONSTANTS.PAGE_SUPPORT_SURVEY;
    
    public resetState() {
        this.answered_survey = false;        
        super.resetState();
    }

    /**
     * Text component check required fields. 
     * If all required fields were filled, it create a feedback
    */
    public is_Finished_feedback() {
        return this.answered_survey;
    }
    
}

/**
* Class for Uoloader survey
*/
class Uploader extends SupSurvey {
    page = CONSTANTS.PAGE_SUPPORT_SURVEY;
    
    public resetState() {
        this.answered_survey = false;        
        super.resetState();
    }
    
}

/**
* For CSAT, NPS, CES and FLX survey
*/
class MainSurvey extends Survey implements SurveyINF {
    // Definition for class
    page = CONSTANTS.PAGE_INDEX_SURVEY;
    RATING_THRESHOLD = 3;
    
	// Decide rule to switch to child surveys
	public getChildRule() {
		this.child_rule = this.CHILD_RULE_GOOD;    
		if (this.feedback.rating <= this.RATING_THRESHOLD)
			this.child_rule = this.CHILD_RULE_BAD;
		
		return this.child_rule;
	}
	
    // Get number of steps (screens) for user to send feedback
    public getSteps() {
        
        if (!this.childs || this.childs.length<1) {
            // No child survey
            return 1;
        } else if (this.childs.length>1){
            // There are two child surveys
            return 2;
        } else {
            // There is only one child survey
            if (this.child) {
                // Run child survey        
                return 2;
            } else 
                return 1;
        };
        
    }
        
    public resetState() {
        super.resetState();
        this.child = null;
        this.position = 0;
		this.child_rule = null;
    }
    
    public updateFeedback(feedback) {
        // Main feedback data
        this.feedback = feedback;
        
        // Notification
        if (this.check_notification && this.feedback && this.feedback.rating <= this.RATING_THRESHOLD)  
            this.notification = true
        else 
            this.notification = false;
                
        // Reset child survey
        if (this.child) {
            this.child.feedback = null;
            this.child = null;
        }
    };
    
    public getLastSurvey() {
        if (this.child) {
            return this.child
        } else if (!this.childs && this.childs.length<=0) {
            // No child survey
            return this;
        } else {
            return null;
        }
    }

    // Check if answering this survey is finished or not
    // public is_Finished_feedback() {
    //     if (!this.feedback)     return false;
        
    //     // Count children survey for rule
    //     let child_count = 0;
    //     if (this.childs && this.childs.length) {
    //         for (let i=0; i<this.childs.length; i++) {
    //             if (this.childs[i].rule==this.rule)     child_count++;
    //         }
            
    //         if (child_count) {
    //             if (this.feedback.children && this.feedback.children.length
    //                 && this.feedback.children.length==child_count)
    //                 return true;
    //             else
    //                 return false;
    //         }
    //     }
    //     return true;
    // }
    
}

/**
* Class for selection survey
*/
class SINGLESELECTION extends MainSurvey {
    page = CONSTANTS.PAGE_SUPPORT_SURVEY;
    public selected_factor: any = null;       // save selected factor in single selection

	// Decide rule to switch to child surveys
	public getChildRule() {
		this.child_rule = this.selected_factor.id;
		return this.child_rule;
	}
    
    public resetState() {
        super.resetState();
        this.selected_factor = null;
    }

    public updateFeedback(feedback) {
        // Main feedback data
        this.feedback = feedback;
        
        // Reset child survey
        if (this.child) {
            this.child.feedback = null;
            this.child = null;
        }
    };

}

/**
* Class for CSAT survey
*/
class CSAT extends MainSurvey {
    // page = CONSTANTS.PAGE_INDEX_CSAT;
    RATING_THRESHOLD = 3;
    display_name = "CSAT";
    

    public setSeverity() {
        if (this.notification)
            this.severity = this.feedback.rating
        else
            this.severity = 0;

        return this.severity;        
    }
}

/**
* Class for FLX survey
*/
class FLX extends MainSurvey {
    // page = CONSTANTS.PAGE_INDEX_FLX;
    display_name = "FLX";
    
	constructor(data: any) {
		super(data);
		
		this.RATING_THRESHOLD = (this.data.scales+1)/2;
		
	}

	// Decide rule to switch to child surveys
	public getChildRule() {
		this.child_rule = this.feedback.rating;    
		return this.child_rule;
	}

    public setSeverity() {
        if (this.notification)
            this.severity = Math.ceil(this.feedback.rating*3/this.RATING_THRESHOLD)
        else
            this.severity = 0;

        return this.severity;        
    }
    
    // public needNotification() {
    //     let ret = super.needNotification();
    //     if (ret)
    //         this.notificationColor = Math.ceil(this.feedback.rating*6/(this.data.scales+1));
	// 		//console.log("FLX color: ", this.notificationColor);
    //     return ret;
    // }
	
}

/**
* Class for NPS survey
*/
class NPS extends MainSurvey {
    // page = CONSTANTS.PAGE_INDEX_NPS;
    RATING_THRESHOLD = 6;
    display_name = "NPS";

    public setSeverity() {
        if (this.notification)
            this.severity = Math.round(this.feedback.rating*0.5)
        else
            this.severity = 0;

        return this.severity;        
    }

    /**
     * Check notification and set notification message.
     * In this method, rating = score /  max_score (scales -1)
    */
    public needNotification() {
        if (!this.check_notification)   return false;
        
        if (this.notification && this.feedback && 
            (this.feedback.rating!=null) && (this.feedback.rating!=undefined)) {
            this.notificationMessages = [{
				rating: this.feedback.rating + "/" + (this.data.scales-1),
                name: this.display_name
            }]; 
            this.notificationColor = this.severity;
        }
        return this.notification;
    }
}

/**
* Class for CES survey
*/
class CES extends MainSurvey {
    // page = CONSTANTS.PAGE_INDEX_CES;
    RATING_THRESHOLD = 4;
    display_name = "CES";
    
    /**
     * Based on rating level, define severity from 1-3.
     * 1 is the most serve; 3 is the least serve
    */
    public setSeverity() {
        if (this.notification)
            this.severity = Math.round(this.feedback.rating*0.75)
        else
            this.severity = 0;

        return this.severity;        
    }

    // public needNotification() {
    //     let ret = super.needNotification();
    //     if (ret)
    //         this.notificationColor = Math.round(this.feedback.rating*0.75);
    //     return ret;
    // }

}

/**
 * Class for Info survey
 */
class INFO extends MainSurvey {
  display_name = "INFO";

  /**
   * Text component check required fields.
   * If all required fields were filled, it create a feedback
   */
  public is_Finished_feedback() {
    return true;
  }

}

/**
* Class for Mixed survey
*/
class MIXED extends Survey implements SurveyINF {
    public position: number; // Point to current survey
    
    public goNext() {
        // Validate condition
        if (this.childs.length<=0) {
            this.state = this.SURVEY_STATE_FINISHED;
            return null;
        }

        // Finished mixed survey
        if (this.isState(this.SURVEY_STATE_FINISHED))  return null;		

		// STARTING STATE
        if (this.isState(this.SURVEY_STATE_START)) {
			this.state = this.SURVEY_STATE_RUNNING;
            this.position = 0;
			this.child = this.childs[this.position];
		}
        
		// RUNNING STATE
		let next_survey = this.child.goNext();
		if (next_survey)	return next_survey;
		
		// Check next position reach end child list
		this.position += 1;
		if (this.position == this.childs.length) {
			this.state = this.SURVEY_STATE_FINISHED;
			return null;
		}
		
		// Goto next survey in child list
		this.child = this.childs[this.position];
		return this.child.goNext();
    }
    
    public goPrevious() {
        // Validate condition
        if (this.childs.length<=0) {
            this.state = this.SURVEY_STATE_FINISHED;
            return null;
        }
    
        if (this.isState(this.SURVEY_STATE_START))    return null
    
        // Finished mixed survey
        if (this.isState(this.SURVEY_STATE_FINISHED)) {
			this.state = this.SURVEY_STATE_RUNNING
            this.position = this.childs.length - 1;
			this.child = this.childs[this.position];
		}
    
        let pre_survey = this.child.goPrevious();
        if (pre_survey)		return pre_survey;
    
        this.position -= 1;
        if (this.position>=0) {
			this.child = this.childs[this.position];
            return this.child.goPrevious();
        } else {
            this.state = this.SURVEY_STATE_START;
            return null;
        }
    }
    
    // Get number of steps (screens) for user to send feedback
    public getSteps() {
        let steps = 0;
        
        if (this.childs && this.childs.length>0) {
            for (var i=0; i<this.childs.length; i++) {
                steps += this.childs[i].getSteps();
            }
        };
        
        return steps;
    }
    
    public getFirstSurvey() {
		let firstSurvey = null;
        if (this.childs && this.childs.length>0)
            firstSurvey = this.childs[0].getFirstSurvey();
		
        return firstSurvey;
    }
    
    public resetState() {
        super.resetState();
        this.feedback = {
            rating: 0
        };
    }
}

/**
* Class for Mixed survey
*/
class FORMBASED extends Survey implements SurveyINF {
    page = CONSTANTS.PAGE_SUPPORT_SURVEY;

    public resetState() {
        super.resetState();
        this.feedback = {
            rating: 0
        };
    }

    /**
     * Checking wherether user finished answering form-based survey 
     * User finshed answering only all children surveys are finished
    */
    public is_Finished_feedback() {        
        if (this.childs && this.childs.length) {
            for (let i=0; i<this.childs.length; i++) {
                if (!this.childs[i].is_Finished_feedback())     return false;
            }
        }
        return true;
    }

}

function createSurvey(survey: any): Survey {
    
    switch (survey.type) {
        case 0: {
            return new CSAT(survey);
        }
        case 1: {
            return new NPS(survey);
        }
        case 2: {
            return new CES(survey);
        }
        case 4: {
            return new MULTISELECTION(survey);
        }    
        case 5: {
            return new SINGLESELECTION(survey);
        }
        case 6: {
            return new RATING(survey);
        }
        case 7: {
            return new TEXT(survey);
        }
        case 8: {
            return new MIXED(survey);
        }
        case 9: {
            return new Contact(survey);
        }
        case 10: {
            return new FLX(survey);
        }
        case 11: {
            return new FORMBASED(survey);
        }
        case 12: {
            return new Uploader(survey);
        }
        case 13: {
            return new INFO(survey);
        }
    }
}

export {
    createSurvey, SurveyINF, SINGLESELECTION, TEXT, Contact
}
