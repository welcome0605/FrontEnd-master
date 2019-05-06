import { Component } from '@angular/core';
import { ViewController, NavController, App, MenuController,NavParams } from 'ionic-angular';
import { UserService } from '../../providers/user-service';
import { AnalyticsService } from '../../providers/analytics-service';
import { ENV } from '@app/env';

@Component({
    selector: 'referral-prompt',
    templateUrl: 'referral-prompt.html'

})
export class ReferralPrompt {
    private nav: NavController;
    public  referral: string = '';
    public  possibleReferralNumber: number = 0;
    constructor(public viewCtrl: ViewController,
                public menuCtrl: MenuController,
                public navParams: NavParams,
                private analyticsService: AnalyticsService,
                private userService: UserService,
                private appCtrl: App) {
        this.nav = appCtrl.getRootNav();
        this.userService.getCurrentUser().subscribe(
            user=> {
                if (user.id) {
                    this.sendAnalytics(user);
                    this.getReferrenceLink(user.referral.code);
                    this.getPosibleRefferalsNumber(user.referral.possible_number, user.referral.usage_counter );
                }
            }
        );

    }
    private sendAnalytics(user){

        let general_data = {
            'event':'page',
            'p_path':'/referral-promt',
            'p_title':'Referral Popup',
            'user': user.id
        };
        this.analyticsService.trackCustomEvent(general_data);
    }

    public closeTapped() {
        this.viewCtrl.dismiss();
    }

    public getReferrenceLink(referral){
        this.referral = `${ENV.envUrl}/#/free-account?ref=${referral}`;
    }

    private getPosibleRefferalsNumber(possibleNumber, usageCounter ){
        this.possibleReferralNumber = possibleNumber - usageCounter ;
    }
}