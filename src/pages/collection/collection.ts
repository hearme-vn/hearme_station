import { Component, ViewChild, ElementRef } from '@angular/core';
import { Config } from '../../app/config';
import { AppInit } from '../../providers/app-init/app-init';
// import { Util } from '../../providers/feedback-service/utils';
import { YTPlayerService } from '../../providers/feedback-service/player.service';
import { BasePage } from '../../providers/feedback-service/basepage';

import { Slides } from 'ionic-angular';
//@IonicPage()
@Component({
    selector: 'page-collection',
    templateUrl: 'collection.html',
	providers: [YTPlayerService]
})
export class CollectionPage extends BasePage {
    @ViewChild('videoIframe') videoIframe: ElementRef;
    @ViewChild(Slides) slides: Slides;
    
	private video_Container = "ytPlayer";
	
    public collectionPage=true;
    private collections:any = [];
    public linkIdle = 'assets/imgs/splash.png';
    public videoId = null;
    public mediaType = 0;   //0: default, 1: image, 2: youtube
    public imgServer = "";
    
    constructor(
        public appInit: AppInit, 
		private YTplayer: YTPlayerService,
        private config: Config) {
            
        super(appInit);
    }
	
    stopCollection() {
        if (this.mediaType==1) {
            this.slides.stopAutoplay()
        } else if (this.mediaType==2)
            if (this.YTplayer)    this.YTplayer.stopVideo()
    }
	
    public getMyStyles(item){
        //console.log('item', item);
        let myStyles = {
            'background-image': "url('" + this.config.img_server + item.fileName + "')"
        };
        return myStyles;
    }
	
    // This event is fired when change from one tab to another tab
    ionViewWillLeave() {
        this.stopCollection();
    }
    
    public loadPage() {
        this.initPageData();
        
        if (this.tabs && this.tabs.length>1) {
            let tab = this.tabs[1];
            if (tab.collection && tab.collection.length > 0) {//collection
                this.mediaType = 1;
                if (this.slides && (tab.collection != this.collections)) {
                    this.slides.ngOnDestroy()
                }
                this.collections = tab.collection;
                if (this.slides) {
                    this.slides.ngAfterContentInit();
                    this.slides.startAutoplay();
                }
                if (this.YTplayer && this.YTplayer.player) {
                    this.YTplayer.unloadPlayer();
                }
            } else {//youtube
                this.mediaType = 2;
                let videoId = this.YouTubeGetID(tab.params);
                
                if (!this.YTplayer.player) {
                    this.YTplayer.setupPlayer(this.video_Container, videoId);
				} else {
                    if (this.videoId != videoId) { 
                        this.YTplayer.unloadPlayer();
                        this.YTplayer.setupPlayer(this.video_Container, videoId);
                        this.videoId = videoId;
                    } else {
                        this.YTplayer.playVideo();
                    }
                }
            }
        }

        this.configurePageUI();
    }
    
    private YouTubeGetID(url){
        var ID = '';
        url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        if(url[2] !== undefined) {
            ID = url[2].split(/[^0-9a-z_\-]/i);
            ID = ID[0];
        } else {
            ID = url.toString();
        }
        return ID;
    }
    
    // Stop autoplay and handl swipe event
    public slideChanged() {
        this.slides.startAutoplay();
    }
    
    public gotoFeedback() {
        let survey = this.fbService.survey.goNext();
        if (!survey)    return;
        
        // Goto survey page for this survey
        // Check the last survey
        this.fbService.survey.updateLastSurvey();
        this.appInit.survey = survey;
        this.appInit.navCtrl.getActiveChildNav().select(survey.page);        
    }
}