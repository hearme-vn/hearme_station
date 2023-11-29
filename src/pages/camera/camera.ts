import { Component, ViewChild } from '@angular/core';
import { AppInit } from '../../providers/app-init/app-init';
import { ViewController } from 'ionic-angular';

import { BasePage } from '../../providers/feedback-service/basepage';
import { CONSTANTS } from '../../providers/feedback-service/constants';

/**
 * CameraPage page for WEB PLATFORM.
 * Use HTML5 APIs
 */
@Component({
    selector: 'page-camera',
    templateUrl: 'camera.html',
})
export class CameraPage extends BasePage {
    private image: string;  // In type of DataURL
    private video: any;
    private camera_mode = "user";

    constructor (
        public appInit: AppInit, 
        public viewCtrl: ViewController
        ) {

        super(appInit);
    }

    /**
     * Init camera and display in screen
    */
    public loadPage() {
        console.log("Starting camera");
        this.startCamera();
    }

    /**
     * Start camera and display video in screen
    */
    startCamera() {
        let options = {
            video: {
                facingMode: this.camera_mode
            }
        }
        // Get access to the camera!
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(options).then(
                (stream) => {
                    this.video = document.getElementById('video');
                    this.video.srcObject = stream;
                    this.video.play();
                });
        }
    }

    /**
     * Stop display video
    */
    stopCamera() {
        if (!this.video)    return;
        var stream = this.video.srcObject;
        var tracks = stream.getTracks();
      
        for (var i = 0; i < tracks.length; i++) {
          var track = tracks[i];
          track.stop();
        }
      
        this.video.srcObject = null;        
    }

    /**
     * Capture image from camera and display into screen
    */
    captureImage() {
        if (!this.video)    return;

        if (this.image) {
            this.image = null;
            return;
        }

        let width = this.video.videoWidth;
        let height = this.video.videoHeight;

        if (width > height) {
            if (width > CONSTANTS.IMAGE_MAX_SIZE.WIDTH) {
                height *= CONSTANTS.IMAGE_MAX_SIZE.WIDTH / width;
                width = CONSTANTS.IMAGE_MAX_SIZE.WIDTH;
            }
        } else {
            if (height > CONSTANTS.IMAGE_MAX_SIZE.HEIGHT) {
                width *= CONSTANTS.IMAGE_MAX_SIZE.HEIGHT / height;
                height = CONSTANTS.IMAGE_MAX_SIZE.HEIGHT;
            }
        }
        const canvas = document.createElement("canvas");
        // get image resolution by predefine size
        canvas.width = width;
        canvas.height = height;

        canvas.getContext("2d").drawImage(this.video, 0, 0, width, height);

        // Other browsers will fall back to image/png
        this.image = canvas.toDataURL(CONSTANTS.IMAGE_ENCODING_DEFAULT);
    }

    /**
     * Convert data into BLOB for uploading into server
    */
    convertCanvas2Blob(canvas) {
        let blobBin = atob(canvas.split(',')[1]);
        let array = [];
        for(var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: CONSTANTS.IMAGE_ENCODING_DEFAULT});        
    }

    /**
     * Stop camera and close modal dialog
     * Return binary image to main component
    */
    saveImage() {
        this.stopCamera();
        if (!this.image) {
            // Send message to customer
            this.appInit.util.showToastMessageByID("message.HAVENOT_CAPTURE_IMAGE", { 
                position: "top", 
                duration: CONSTANTS.APP_TOAST_INTERVAL,
                cssClass: this.appInit.screen_orientation
            });
            return;
        }

        let data = { image: this.convertCanvas2Blob(this.image) };
        this.viewCtrl.dismiss(data);
    }

    /**
     * Stop camera and close modal dialog
    */
    closeModal() {
        this.stopCamera();
        this.viewCtrl.dismiss();
    }
}
