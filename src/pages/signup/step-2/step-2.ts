import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { SignupStep3 } from '../step-3/step-3';
import { SignupStep1 } from '../step-1/step-1';
import { FormBuilder } from '@angular/forms';
import { RegistrationService } from '../../../providers/registration-service';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../../providers/analytics-service';


@Component({
  selector: 'signup-step2',
  templateUrl: 'step-2.html'
})
export class SignupStep2 {

  pushPage: any = null;
  public errors: any = [];
  public toViewOne: any = SignupStep1;

  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public reg: RegistrationService,
    public toastCtrl: ToastController,
    private translateService: TranslateService,
    private analyticsService: AnalyticsService
  ) {
  }

  public setPlan = (plan) => {
    if (plan == 'flexible_plan' || plan == '6months_plan' || plan == '12months_plan') {
      this.reg.stepTwoData.plan = plan;
      this.navCtrl.push(SignupStep3);
    }
  }

  ngOnInit() {
   // let data = {
   //   'title':'Step 2 | digitalkasten.de',
   //   'url':'/reg/step2'
   // };
    //this.analyticsService.trackPageView(data);
  }
}
