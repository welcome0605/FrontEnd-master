import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-onboarding',
  templateUrl: 'onboarding.html',

})
export class OnboardingPage {
  constructor(public viewCtrl: ViewController){
  }

  closeTapped(){
    this.viewCtrl.dismiss();
  }
}
