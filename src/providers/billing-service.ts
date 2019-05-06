import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from "rxjs/Observable";
import { BillingStatement } from '../models/billing-statement';
import { TokenService} from './token-service';
import { BillingPlan } from "../models/billing-plan";
import { ENV } from '@app/env';


@Injectable()
export class BillingService  {
    billingStatement: BillingStatement;
    private baseUrl = `${ENV.apiUrl}/billing_statements`;
  private BILLING_PLAN_URL = `${ENV.apiUrl}/profile/plan`;

    constructor(
      private http: Http,
      private tokenService: TokenService
    ) { }

    getBillingInfo(): Observable<BillingStatement> {
        return this.http
          .get(this.baseUrl + "?token=" + this.tokenService.get())
          .map(res => res.json())
          .map(res => res.shift());
    }
    
    getBillingPlan(): Observable<BillingPlan>{
        return this.http
        .get(this.BILLING_PLAN_URL ).map(res => {
          return  res.json();
        });        
    }
}
