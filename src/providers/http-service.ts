import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';

@Injectable()

// see: http://stackoverflow.com/questions/34464108/angular2-set-headers-for-every-request
export class HttpService {

    constructor(private http: Http) {}

    get(url) {
        let headers = new Headers();
        this.addDefaultHeaders(headers);
        return this.http.get(url, {
            headers: headers
        });
    }

    post(url, data) {
        let headers = new Headers();
        this.addDefaultHeaders(headers);
        return this.http.post(url, data, {
            headers: headers
        });
    }

    put(url, data) {
        let headers = new Headers();
        this.addDefaultHeaders(headers);
        return this.http.put(url, data, {
            headers: headers
        });
    }

    delete(url) {
        let headers = new Headers();
        this.addDefaultHeaders(headers);
        return this.http.delete(url, {
            headers: headers
        });
    }


    private addDefaultHeaders(headers): Headers {
        headers.append('Accept', 'application/json; version=2');
        return headers;
    }
}