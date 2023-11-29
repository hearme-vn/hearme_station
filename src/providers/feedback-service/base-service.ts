import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

import { Config } from '../../app/config';
import { AuthService } from '../auth-service/auth-service';

@Injectable()
export class BaseService {
    
    constructor(private conf: Config, private http : Http, private auth: AuthService) {
    }

    /**
     * Send message to hearme server by post APIs.
     */ 
    public sendPost(endpoint, payload) {
        let url = this.conf.dataFront_service + endpoint;
        let token = this.auth.getToken();
        let headers = new Headers({ 'Authorization': 'BEARER ' + token, 'Content-Type': 'application/json'});
        let options = new RequestOptions({ headers: headers });
        return this.http.post(url, payload, options);
    }

    /**
     * Call get APIs.
     */ 
    public sendGet(endpoint) {
        let url = this.conf.dataFront_service + endpoint;
        let token = this.auth.getToken();
        let headers = new Headers({ 'Authorization': 'BEARER ' + token });
        let options = new RequestOptions({ headers: headers });
        return this.http.get(url, options);
    }

    /**
     * Convert an JSON object to FormData object
    */
    makeFormData(data) {
        let formData = new FormData();
        for ( var key in data ) {
            formData.append(key, data[key]);
        }
        return formData;
    }

    /**
     * Upload local file into server, input are:
     * 1. file: file uploading
     * 2. data is a JSON object with fields
     * - type: file type, 0: for image; 1: for data file; 2: other
     * - sur_id: survey id
     * - created: created time
     * - sur_path: survey path
     * 
     * This function return a Promise
    */
    uploadFile(blob, fileName, data) {
        // Form data
        let formData = this.makeFormData(data);
        formData.append("postFile", blob, fileName);

        // Making upload
        let url = this.conf.dataFront_service + "post/create";
        let token = this.auth.getToken();
        let headers = new Headers({ 'Authorization': 'BEARER ' + token, 'enctype': 'multipart/form-data; boundary=----WebKitFormBoundaryuL67FWkv1CA' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(url, formData, options);       
    }

    /**
     * This API is for deleting a post in backend
     * input is post_id
     * Return: http promise
    */
    deletePost(post_id) {
        let url = "post/delete/" + post_id;
        return this.sendGet(url);
    }
}