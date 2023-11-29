import { Component, Input } from '@angular/core';
import { ModalController, ViewController, NavParams, Platform } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry } from '@ionic-native/file';

import { AppInit } from '../../providers/app-init/app-init';
import { BaseComponent } from '../../providers/feedback-service/basecomponent';
import { BaseService } from "../../providers/feedback-service/base-service";
import { Util } from '../../providers/feedback-service/utils';
import { CONSTANTS } from '../../providers/feedback-service/constants';
import { Config } from '../../app/config';
import { AuthService } from '../../providers/auth-service/auth-service';

import { CameraPage } from '../../pages/camera/camera';

/**
 * Component for Uploading files and capturing images
 * @author Thuc VX <thuc@hearme.vn>
 * @date Nov 06, 2020
 * Support: browser and mobile environment
 */
@Component({
	selector: 'uploader',
	templateUrl: 'uploader.html'
})
export class UploaderComponent extends BaseComponent {
    public selector: any;

    public uploaded_files = [];        // List of uploaded file
    private camera_image: string;
    private token = null;

    constructor(private conf: Config, private baseService: BaseService,
        public platform: Platform,
        private auth: AuthService,
        public file: File,
        private util: Util,
        public camera: Camera,
        public modalCtrl: ModalController) { 
        super();

        this.token = this.auth.getToken();
        this.selector = this.createSelector();
    }

    /**
     * Based on which platform use is using, modlule create appropriate selector
    */
    createSelector() {
        if (this.platform.is("core")  || this.platform.is("mobileweb")) {
            if (Util.isOS("iPhone") || Util.isOS("iPad")) {
                return new iOSWebSelector(this);
            } else {
                return new WebSelector(this);
            }
        } else {
            return new AppSelector(this);
        }
    }

    /**
     * init data when this component load survey data
    */
    ngOnChanges() {
        super.ngOnChanges();

        if (this.survey && this.survey.feedback) {
            this.uploaded_files = JSON.parse(this.survey.feedback["comment"]);
        }
    }

    /**
     * Checking whether file is an image or data file, return value:
     * - false: a data file
     * - true: an image file
    */
    isImageFile(fileName) {
        let re = /(?:\.([^.]+))?$/;
        let ext = re.exec(fileName)[1];
        if (!ext)   return false;

        ext = ext.toLowerCase();
        if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg' && ext !== 'bmp') {
            return false;
        }
        return true;
    }

   /** 
     * For upload file into server 
     */
    uploadDataFile(blob, fileName) {
        // console.log("Starting uploading file");
        let progressiveCtrl = this.appInit.util.showProgressive("message.DATA_PROCESSING");

        // Calculate created me to server
		let current_Time = new Date();
		let destination_date = Util.changeTimeZone(current_Time, this.conf.SERVER_TIMEZONE);
        let created = Util.toISOFormat(destination_date);

        let data = {
            type: (this.isImageFile(fileName)? 0: 1),
            sur_id: this.survey.id,
            created: created,
            description: fileName
        }
        if (this.survey.data.sur_path)      data["sur_path"] = this.survey.data.sur_path;

        this.baseService.uploadFile(blob, fileName, data)
        .subscribe ((res) => {
            // success, add file into data
            // console.log(res.json());
            this.uploaded_files.push(res.json());

            // Update change
            this.updateChange(this.uploaded_files);

            progressiveCtrl.dismiss();
        }, (err) => {
            // error, make a message
            this.httpErrorProcessing(err);

            progressiveCtrl.dismiss();
            return;
        });
    }

    /**
     * This methed is for uploading image file
     * - Check if this is an image file
     * - Check image size, if it's greater then a thredhold, then resize this iamge
     * - Upload file into server
    */
    uploadImageFile(file, fileName) {
        let mime = "image/jpeg";
        let img = new Image();
        
        img.onload = function () {
            let width = img.width;
            let height = img.height;

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
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            // Clear canvas, and resize image
            ctx.clearRect(0, 0, CONSTANTS.IMAGE_MAX_SIZE.WIDTH, CONSTANTS.IMAGE_MAX_SIZE.HEIGHT);
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
        
            // Get image from canvas as a dataURI, and convert to a blob object
            let dataURI = canvas.toDataURL(mime);
            let image_blob = this.dataURLToBlob(dataURI);
            this.uploadDataFile(image_blob, fileName);

        }.bind(this);
        img.src = URL.createObjectURL(file); 
    }

    /* Utility function to convert a canvas to a BLOB */
    dataURLToBlob(dataURL) {
        let BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            let parts = dataURL.split(',');
            let contentType = parts[0].split(':')[1];
            let raw = parts[1];

            return new Blob([raw], {type: contentType});
        }

        let parts = dataURL.split(BASE64_MARKER);
        let contentType = parts[0].split(':')[1];
        let raw = window.atob(parts[1]);
        let rawLength = raw.length;

        let uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }
    
    /**
     * Trigger method: when a file is selected
     * Used in web app version
    */
    selectedEvent(event) {
        if (!event.target || !event.target.files.length)    return;

        console.log("Processing upload file event");
        // Check file size whethere is smaller than max size,then display a message
        let file = event.target.files[0];
        if (this.isImageFile(file.name)) {
            this.uploadImageFile(file, file.name);
        } else {
            if (file.size > CONSTANTS.FILE_UPLOAD_MAX_SIZE * 1024) {
                this.appInit.util.showToastMessageByID("message.EXCEED_MAX_SIZE", { 
                    position: "top", 
                    duration: CONSTANTS.APP_TOAST_INTERVAL,
                    cssClass: this.appInit.screen_orientation
                });
                return;
            }
            this.uploadDataFile(file, file.name);
        }
    }

    /**
     * For deleting files
    */
    deleteUploadedFile(idx) {
        // Delete file in backend by calling API
        this.baseService.deletePost(this.uploaded_files[idx].id).subscribe(
            (ret) => {
                // console.log(ret);
            },
            (err) => {
                console.log(err);
            }
        );

        // Delete file in screen
        this.uploaded_files.splice(idx, 1);

        // Update change to survey's answer
        this.updateChange(this.uploaded_files);
    }

    public createFeedback(data) {
        console.log("Start making feedback");

        let fb_files = [];
        for (let i=0; i<this.uploaded_files.length; i++) {
            let file = this.uploaded_files[i];
            fb_files.push({
                id: file.id,
                file_name: file.file_name,
                type: file.type,
                description: file.description
            });
        }
        if (fb_files.length<=0) {
            this.survey.updateFeedback(null);
            return;
        }

        let feedback = {
            sur_id: this.survey.getId(),
            comment: JSON.stringify(fb_files)
        };
        this.survey.updateFeedback(feedback);
    }

    public viewImage(id) {
        let data = {
            image: this.appConf.dataFront_service + 'post/get/' + 
                this.uploaded_files[id].id + '?token=' + this.token
        };
        let options = { 
            "cssClass": "viewImageModal",
            "swipeToClose": true
        };
    
        const modal = this.modalCtrl.create(ViewImagePage, data, options);
        return  modal.present();        
    }

}

@Component({
	selector: 'viewimage',
	templateUrl: 'viewimage.html'
})
export class ViewImagePage {
    @Input() image: string;

    constructor (
        public appInit: AppInit, 
        public viewCtrl: ViewController,
        navParams: NavParams
        ) {

        this.image = navParams.get('image');
    }

    closeImagePreview() {
        this.viewCtrl.dismiss();
    }
}

/**
 * Base class for selecting file, image engine
*/
class BaseSelector {
    public uploader: UploaderComponent;        // Uploader component
    public file_button = false;
    public camera_button = false;

    constructor(uploader: any) {
        this.uploader = uploader;
    }

    /**
     * Used for select and upload file
    */
    public selectFile() {};

    /**
     * Used for select and upload file
    */
    public captureFromCamera() {};


}


/**
 * File selector engine for web app
*/
class WebSelector  extends BaseSelector {
    public file_button = true;
    public camera_button = true;

    constructor(uploader: UploaderComponent) { 
        super(uploader);
    }

    /**
     * Select file for uploading into server
     * Purpose: Trigger fileInput element to select local file
     */
    selectFile() {
        let localFile: HTMLElement = document.querySelector('input[name="localFile"]') as HTMLElement;
        localFile.click();
    }

    /**
     * Used for select and upload file
    */
    public captureFromCamera() {
        let options = { 
            "cssClass": "cameraModal",
            "swipeToClose": true
        };
        let cameraPage = this.uploader.modalCtrl.create(CameraPage, null, options);
        cameraPage.onDidDismiss(data => {
            if (!data || !data["image"])    return;

            const date = new Date().valueOf();
            const fileName = date + '.jpg';

            this.uploader.uploadDataFile(data["image"], fileName);
        });
        cameraPage.present();
    };

}

/**
 * Web selector for iOS, Android device
*/
class iOSWebSelector  extends WebSelector {
    public camera_button = false;

}

/**
 * File selector for device app
*/
class AppSelector extends BaseSelector {
    public camera_button = true;

    constructor(uploader: UploaderComponent) { 
        super(uploader);
    }
    
    /**
     * Convert DataURI from camera to binary blob
    */
    dataURItoBlob(dataURI) {
        const byteString = window.atob(dataURI);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([int8Array], { type: 'image/jpeg' });    
        return blob;
    }

    /**
     * Camera output type: BASE64 string. Used for preview, memory intensive
     * This method is working in mobile invironment
     * For opening popup and capture image from camera
     * sourceType: 1 for Camera and 0 for image library
     */
    public captureInDevice(sourceType) {
        const options: CameraOptions = {
            quality: 100,
            encodingType: this.uploader.camera.EncodingType.JPEG,
            mediaType: this.uploader.camera.MediaType.PICTURE,
            sourceType: sourceType,
            destinationType: this.uploader.camera.DestinationType.DATA_URL
        };
    
        this.uploader.camera.getPicture(options).then(async (imageData) => {
            const date = new Date().valueOf();

            // Replace extension according to your media type
            const fileName = date + '.jpeg';
                        
            // create image from camera
            const imageBlob = this.dataURItoBlob(imageData);    
            this.uploader.uploadImageFile(imageBlob, fileName);
        }, (err) => {
            // Handle error
            console.error( "Error in capture image from camera: "+JSON.stringify(err));
        });
    }

    /**
     * Camera output type: File URL, Then convert to Codova file, then HTML file and upload to server
     * This method is working in mobile invironment
     * For opening popup and capture image from camera
     * sourceType: 1 for Camera and 0 for image library
     */
    public async captureWith_FILEURI(sourceType) {
        const options: CameraOptions = {
            quality: 30,
            encodingType: this.uploader.camera.EncodingType.JPEG,
            mediaType: this.uploader.camera.MediaType.PICTURE,
            sourceType: sourceType,
            destinationType: this.uploader.camera.DestinationType.FILE_URI,
            targetWidth: CONSTANTS.CAPTURE_IMAGE_SIZE.WIDTH,
            targetHeight: CONSTANTS.CAPTURE_IMAGE_SIZE.HEIGHT,
            correctOrientation: true,
            cameraDirection: this.uploader.camera.Direction.FRONT
        };
    
        this.uploader.camera.getPicture(options).then((imageDataURI) => {
            // Convert System File URL to Codova File URL
            this.uploader.file.resolveLocalFilesystemUrl(imageDataURI).then(
                (entry: FileEntry) => {
                    entry.file( file => {
                        // console.log(file);
                        this.readFile(file);
                    });
                });

        }, (err) => {
            // Handle error
            console.error( "Error in capture image from camera: "+JSON.stringify(err));
        });
    }

    /**
     * This method convert Cordova file to HTML file (Blob), then upload into server
    */
    readFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const blob = new Blob([reader.result], {type: file.type});

            const date = new Date().valueOf();
            // Replace extension according to your media type
            const fileName = date + '.jpeg';

            this.uploader.uploadImageFile(blob, fileName);
        };
        reader.readAsArrayBuffer(file);
    };

    public selectFile() {
        this.captureWith_FILEURI(this.uploader.camera.PictureSourceType.PHOTOLIBRARY);
    };

    public captureFromCamera() {
        this.captureWith_FILEURI(this.uploader.camera.PictureSourceType.CAMERA);
    };

}

