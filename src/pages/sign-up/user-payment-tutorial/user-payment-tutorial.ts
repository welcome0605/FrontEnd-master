import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Inbox } from '../../documents/inbox/inbox';
import { AnalyticsService } from "../../../providers/analytics-service";
import { Slides } from 'ionic-angular';
import { ViewChild } from '@angular/core';


@Component({
    selector: 'page-user-payment-tutorial',
    templateUrl: 'user-payment-tutorial.html'
})
export class UserPaymentTutorial {
    swiper:any;
    @ViewChild('slider') slider: Slides;
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private analyticsService: AnalyticsService
    ) {}

    onIonDrag(event){
        this.swiper = event;
        this.swiper.lockSwipes();
    }

    slideNext(){
        if(this.swiper){
            this.swiper.unlockSwipes();
        }
        this.slider.slideNext();
    }
    slidePrevious(){
        if(this.swiper){
            this.swiper.unlockSwipes();
        }
        this.slider.slidePrev();
    }
    ifSlideFirst(){
        if(this.slider._activeIndex == 0){
            return true;
        }
        return false;
    }
    ifSlideLast(){
        if(this.slider._activeIndex == 3 ){
            return true;
        }
        return false;
    }
    onRedirect() {
        let path = this.navParams.get('path');
        let user = this.navParams.get('user');
        let general_data = {
            'event':'page',
            'p_path':'/user-payment-tutorial',
            'p_title':'User Payment Tutorial',
            'user': user.id
        };

        this.analyticsService.trackCustomEvent(general_data);
        if (path === '/full-signup'){
            this.navCtrl.setRoot(Inbox, {
                onboardingCompleted: true,
              registrationSuccess: true
            })
        }
        else {
                this.navCtrl.setRoot(Inbox, {
                    registrationSuccess: true
                });
            }

    }
}
