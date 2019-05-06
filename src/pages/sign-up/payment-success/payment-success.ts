import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AnalyticsService } from '../../../providers/analytics-service';
import { UserPaymentTutorial } from '../user-payment-tutorial/user-payment-tutorial';
import { HttpService } from "../../../providers/http-service";
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/observable/throw';
import { ENV } from '@app/env';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Component({
    selector: 'page-payment-success',
    templateUrl: 'payment-success.html'
})
export class PaymentSuccess {
    private checkerUrl = `${ENV.adminUrl}/`;

    constructor(
        private analyticsService: AnalyticsService,
        public navCtrl: NavController,
        public navParams: NavParams,
        private http: HttpService
    ) {}

    onRedirect() {
        let user = this.navParams.get('user');
        this.trackPaymentStatistics(user);
        let general_data = {
            'event':'page',
            'p_path':'/payment-success',
            'p_title':'Payment Success',
            'user': user.id
        };

        this.analyticsService.trackCustomEvent(general_data);
        this.navCtrl.push(UserPaymentTutorial, {
            user: user,
            path: this.navParams.get('path')
        });
    }

    public trackPaymentStatistics(user){
        let url = this.checkerUrl + 'user_statistics/' + user.id;
        setTimeout(() => {
            this.http.get(url)
                .map(response => {
                    let resp = response.json();
                    if (resp.id) {
                        let data = {
                            pageCategory: 'Statistics',
                            visitorType: 'customer',
                            userId: resp.id,
                            subscription: resp.plan,
                            revenue_predicted: resp.revenue_predicted,
                            revenue_cashflow: resp.revenue_cashflow,
                            url: '',
                            event: 'subscription'
                        };

                        if (resp.plan != 'demob2c' && resp.plan != 'demob2b') {
                            let new_data = {
                                "event": "purchase",
                                'ecommerce': {
                                    'purchase': {
                                        'actionField': {
                                            "id": resp.id, //transaction ID chane after impl invoices
                                            "affiliation": "Online",
                                            "revenue": resp.revenue_cashflow,
                                            "tax": 0,
                                            "shipping": 0,
                                            "coupon": resp.voucher
                                        },
                                        "products": [{
                                            "id": resp.plan,
                                            "name": resp.plan_name,
                                            "price": resp.price,
                                            "variant": "full",
                                            "quantity": 1
                                        }]
                                    }
                                }
                            };

                            if (resp.is_company) {
                                this.analyticsService.trackCustomEvent({'event':'purchase b2b'});
                            } else {
                                this.analyticsService.trackCustomEvent({'event':'purchase b2c'});
                            }

                            this.analyticsService.trackCustomEvent(new_data);
                        }
                        this.analyticsService.trackUserEvent(data);
                        // this.analyticsService.pushEventToTaboola();
                    }

                    return resp;
                })
                .catch((response) => Observable.throw(response.json()))
                .subscribe();
        }, 2000);
    }
}