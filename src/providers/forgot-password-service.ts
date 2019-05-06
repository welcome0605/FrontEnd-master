import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { ENV } from '@app/env';

@Injectable()
export class ForgotPasswordService {
  private baseUrl = `${ENV.apiUrl}/password_resets`;
  constructor(public http: Http) {
  }

  public request(opts) {
      return this.http.post(this.baseUrl, opts).map(res => res.json());
  }

}
