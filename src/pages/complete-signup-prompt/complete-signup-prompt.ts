import { Component } from '@angular/core';
import { ViewController, NavController, App, MenuController } from 'ionic-angular';
import { CompleteSignUp } from '../../pages/sign-up/complete-sign-up/complete-sign-up';
import { SignUpService } from "../../providers/sign-up-service";
import { UserService } from '../../providers/user-service';
import { AnalyticsService } from '../../providers/analytics-service';

@Component({
  selector: 'complete-signup-prompt',
  templateUrl: 'complete-signup-prompt.html',

})
export class CompleteSignupPromptPage {
  public stepOne: boolean = true;
  public stepTwo: boolean = false;
  public businessPlans: boolean = false;
  public choosedPlan;

  public signupPlans: Array<Object> = [];
  public logos: Array<Object> = [
    {
      url: "logon_scancenter_1.jpeg"
    },
    {
      url: "logon_scancenter_2.jpeg"
    },
    {
      url: "SRZ_ISO.png"
    }
  ];
  private nav: NavController;
  constructor(public viewCtrl: ViewController,
    public signupService: SignUpService,
    public menuCtrl: MenuController,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private appCtrl: App) {
    this.nav = appCtrl.getRootNav();
    this.signupPlans = this.fetchSignupPlans();

  }

  // returns an array of available signup plans
  public fetchSignupPlans(): Array<Object> {
    let data = this.signupService.getAvailableBillingPlans();
    let plans;
    // console.log(data);

    this.userService.getCurrentUser().subscribe(
      user => {
        if (user.is_company) {
          this.businessPlans = true;
          plans = [data.business_herbst_aktion];
          this.choosedPlan = data.business_herbst_aktion;
        } else {
          plans = [data.flatrate_herbst];
          this.choosedPlan = data.flatrate_herbst;
        }
      }
    );
    return plans;
  }

  private analytic_structure(step) {
    return {
      "event": "checkout",
      "ecommerce": {
        "checkout": {
          'actionField': {'step': step},
          'products': [{
            "id": this.choosedPlan.name.replace(/\s/g, ''),
            "name": this.choosedPlan.name,
            "price": this.choosedPlan.price,
            "variant": "full",
            "quantity": 1
          }]
        }
      }
    };
  }

  public stepTwoTapped(): Boolean {
    this.stepOne = false;
    this.stepTwo = true;
    return true;
  }

  public selectPlan(plan: String): Boolean {
    let data = this.analytic_structure(3);
    this.analyticsService.trackCustomEvent(data);

    this.viewCtrl.dismiss();
    this.menuCtrl.enable(false);
    this.nav.push(CompleteSignUp, { selectedPlan: plan });
    return true;
  }

  public closeTapped() {
    this.viewCtrl.dismiss();
  }
}
