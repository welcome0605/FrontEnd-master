import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import 'rxjs/add/operator/map';
import { ENV } from '@app/env';

@Injectable()
export class LoginService {
  private baseUrl = `${ENV.apiUrl}/sessions`;

  constructor(public http: HttpService) {
    this.http = http;
  }

  login(opts) {
      return this.http.post(this.baseUrl, opts).map(res => res.json());
  }
}
