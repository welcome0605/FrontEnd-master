import { Component } from '@angular/core';
import { Platform, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import * as utils from '../../../utils/utils';
import { ENV } from '@app/env';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { HttpService } from '../../../providers/http-service';

import { AnalyticsService } from '../../../providers/analytics-service';
import { RegistrationService } from '../../../providers/registration-service';

import { UserService } from '../../../providers/user-service';
import { SignUpService } from "../../../providers/sign-up-service";
import { PaymentForm } from "../../../forms/payment-form";
import { PaymentSuccess } from "../payment-success/payment-success";

@Component({
  selector: 'page-billing-options',
  templateUrl: 'billing-options.html'
})
export class BillingOptions {
  public paymentForm: PaymentForm;
  public loader: any;
  public errors: string[] = [];
  public message = '';
  public user_form_step_first = true;
  private checkerUrl = `${ENV.adminUrl}/`;
  public businessPlans: boolean = false;
  public choosedPlan;

  constructor(
    private platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private translateService: TranslateService,
    private registrationService: RegistrationService,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    private singUpService: SignUpService,
    private http: HttpService
  ) {
    this.initForm();
  }

  ionViewDidLoad() {
   // let data = {
     // 'title': 'Billing Options',
      //'url': 'billing-options'
    //};
    //this.analyticsService.trackPageView(data);

  }
  initForm() {
    const defaultPlan = this.singUpService.getDefaultBillingPlan();
    this.paymentForm = new PaymentForm(this.formBuilder, defaultPlan.stripeId, defaultPlan.plan_id);
    this.paymentForm.setPaymentMethodType(this.fetchPaymentMethod());

    this.userService.getCurrentUser().subscribe(
      user => {
        let general_data = {
          'event':'page',
          'p_path':'/billing-options',
          'p_title':'Billing Options',
          'user': user.id
        };

        this.analyticsService.trackCustomEvent(general_data);
      }
    );
  }

  private fetchPaymentMethod(): string {
    if (this.registrationService && this.registrationService.stepTwoData
      && this.registrationService.stepTwoData.card
      && this.registrationService.stepTwoData.card.status
      && this.registrationService.stepTwoData.card.status == 'VALID') {
      return 'card';
    } else {
      return 'bank';
    }
  }

  checkVoucher() {
    let voucher = (<any>this.paymentForm.formGroup).controls.voucher.value;

    if (voucher.length > 6) {
      let url = this.checkerUrl + 'check_voucher/' + voucher;

      this.http.get(url)
        .map(response => {
          let resp = response.json();

          switch (resp.status) {
            case 'invalid':
              this.message = 'Ungültiger Code!';
              break;
            case 'good':
              this.message = 'Gültiger Code!';
              break;
            case 'used':
              this.message = 'Der Code wurde bereits benutzt.';
              break;
          }

          if (this.message.length > 1) {
            utils.presentToast(this.toastCtrl, this.message);
            this.message = '';
          }

          return resp;
        })
        .catch((response) => Observable.throw(response.json()))
        .subscribe();
    }
  }

  public fetchSignupPlans(): Array<Object> {
    let data = this.singUpService.getAvailableBillingPlans();
    let plans;

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

  checkUserForm(step) {
    if (step == 5 && this.user_form_step_first) {
      this.fetchSignupPlans();
      let data = this.analytic_structure(step);
      this.analyticsService.trackCustomEvent(data);
      this.user_form_step_first = false;
    }
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

  // called when the form is being submitted
  public onSubmit(event: FormGroup) {
    this.presentLoading();
    // get the token from stripe that validates our payment method.
    let method = this.paymentForm.getMethod();
    let form = (method == this.paymentForm.PAYMENT_METHOD_TYPE.BANK)? this.paymentForm.bankCtrl : this.paymentForm.cardCtrl;
    let address = {
      address: this.registrationService.stepOneData.value.address,
      city: this.registrationService.stepOneData.value.city,
      zip: this.registrationService.stepOneData.value.zip
    };
    this.singUpService.getToken(method, form, address)
      .then(
      token => {
        // store the token correctly.
        this.paymentForm.setToken(token);
        this.registrationService.stepTwoData.voucher = (<any>this.paymentForm.formGroup).controls.voucher.value;
        this.registrationService.stepTwoData.card = this.paymentForm.cardCtrl;
        this.registrationService.stepTwoData.debit = this.paymentForm.bankCtrl;
        // all good, proceed and store the registration.
        this.registrationService.create(this.registrationService.mapData())
          .subscribe(
          r => {
            // send data to our analytics service
           // this.trackRegistrationData(r, this.registrationService);
            // todo handle in case there are errors returned
            this.loader.dismiss();
            console.log(r);
            this.navCtrl.setRoot(PaymentSuccess, {
                user: r,
                path: ''
              });
          },
          err => {
            this.loader.dismiss();
            this.errors = err.errors.full_messages;
          }
          );

      },
      err => {
        let toastMessage = this.translateService.instant(err);
        utils.presentToast(this.toastCtrl, toastMessage);
        this.loader.dismiss();
      }
      );
  }

  // show a loading animation to the user.
  private presentLoading() {
    let spinner = this.platform.is('ios') ? 'ios' : 'crescent';
    let content;
    this.translateService.get('signUp.completingRegistration')
      .subscribe(translation => content = translation);

    this.loader = this.loadingCtrl.create({
      spinner: spinner,
      content: content
    });
    this.loader.present();
  }

  // returns a stored value for the form. this is used since the user can go
  // back and forward between the steps.
  private fetchValue(attributeName, attributeNestedIn = null) {
    return this.registrationService.fetchStoredData(attributeName, attributeNestedIn, 'stepTwoData');
  }
  ionViewCanEnter():boolean{
    // need to complete previous step to do this one
    // the previous step is done in the view CompleteSignUp
    return this.registrationService.stepOneCompleted;
  }

 // private trackRegistrationData(user, registrationForm) {
    // let valueMapping = {
      //'flexible_plan': 100,
    //};
    //let plan = 'flexible_plan';
    //let data = {
     // title: 'Payment data added',
     // url: '/reg/payment_data_added',
     // orderid: user.id,
     // subscription: plan,
      // subscription_value: valueMapping[plan]
    //};
    //this.analyticsService.trackPageView(data);
  //}
  
}