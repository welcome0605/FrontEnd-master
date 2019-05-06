import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { ENV } from '@app/env';

@Injectable()
export class ResetPasswordService {
    private baseUrl = `${ENV.apiUrl}/password_resets/`;

    constructor(public http: Http) { }

    public reset(data:  any): Observable<any> {
        let token = data.password_reset.reset_password_token;
        let url = this.baseUrl + token;
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, data, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private extractData(res: Response) {
        let body = res.json();

        return body || { };
    }

    private handleError (error: Response | any) {
        let err: string[] | string | any;
        let errMsg: string;

        if (error instanceof Response) {
            const body = error.json() || 'Unknown error';
            err = body.error.full_messages || JSON.stringify(body);
            let errors: string;
            if (err.isArray){
                errors = err.join('\n');
            }
            errMsg = `${error.status} - ${error.statusText || ''}\n${errors || err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(err);
    }
}