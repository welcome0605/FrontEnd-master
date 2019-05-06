import { Component } from '@angular/core';
import { Platform, NavController, LoadingController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';


import { SignupStep1 } from '../step-1/step-1';
import { SignupStep2 } from '../step-2/step-2';
import { SignupStep5 } from '../step-5/step-5';

import { RegistrationService } from '../../../providers/registration-service';

import { AnalyticsService } from '../../../providers/analytics-service';

import { ENV } from '@app/env';

@Component({
  selector: 'signup-step3',
  templateUrl: 'step-3.html'
})
export class SignupStep3 {
  public errors: Array<String> = [];

  public form;
  public debitForm;
  public selectPayment;

  public toViewOne: any = SignupStep1;
public toViewTwo: any = SignupStep2;

  public loader: any;

  constructor(
    private platform: Platform,
    public navCtrl: NavController,
    public fb: FormBuilder,
    public reg: RegistrationService,
    private loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
    private analyticsService: AnalyticsService
  ) {
    let self = this;
    this.form = this.fb.group({
      number: [self.fetchValue('number'), [
        Validators.required
      ]],
      holder: [self.fetchValue('holder'), [
        Validators.required
      ]],
      exp_month: [self.fetchValue('exp_month'), Validators.required],
      exp_year: [self.fetchValue('exp_year'), Validators.required],
      cvc: [self.fetchValue('cvc'), [
        Validators.required
      ]],
      token: [self.fetchValue('token')],
      paymentMethod: [self.fetchValue('paymentMethod')]
    });

    this.selectPayment = this.fb.group({
      payment: [self.fetchPaymentMethod('paymentMethod')]
    });

    this.debitForm = this.fb.group({
      account_number: [self.fetchValue('account_number'), [
        Validators.required,
      ]],
      account_holder_name: [self.fetchValue('account_holder_name'), [
        Validators.required,
      ]],
      token: [self.fetchValue('token')]
    });
  }


  public formSubmitted = (event) => {
    this.presentLoading();

    this.getToken()
      .then(
        token => {
          if (this.selectPayment.value.payment == "creditcard") {
            this.form.patchValue({ token: token });
          } else {
            this.debitForm.patchValue({ token: token });
          }
          this.form.patchValue({paymentType: this.selectPayment.value.payment});
          this.reg.stepTwoData.card  = this.form;
          this.reg.stepTwoData.debit = this.debitForm;
          this.reg.create(this.reg.mapData())
            .subscribe(
              r => {
                // send data to our analytics service
               // this.trackRegistrationData(r, this.reg);
                // todo handle in case there are errors returned
                this.loader.dismiss();
                this.navCtrl.setRoot(SignupStep5);
                console.log(r);
              },
              err => {
                this.errors = err.json().errors.full_messages;
              }
            );
        },
        err => {
          this.loader.dismiss();

          let toast = this.toastCtrl.create({
            message: err,
            duration: 3000
          });
          toast.present();
        }
      );
  }

  public fetchValue = (key, subkey = null) => {
    if (this.reg && this.reg.stepTwoData && this.reg.stepTwoData.card && this.reg.stepTwoData.card.value[key]) {
      return this.reg.stepTwoData.card.value[key];
    } else if (this.reg && this.reg.stepTwoData && this.reg.stepTwoData.debit && this.reg.stepTwoData.debit.value[key]) {
      return this.reg.stepTwoData.debit.value[key];
    } else {
      return '';
    }
  }

  public fetchPaymentMethod = (key) => {
    if (this.reg && this.reg.stepTwoData && this.reg.stepTwoData.card && this.reg.stepTwoData.card.status && this.reg.stepTwoData.card.status == 'VALID') {
      return 'creditcard';
    } else {
      return 'directdebit';
    }
  }

  getTokenBankAccount() {
    return new Promise<string>((resolve, reject) => {
      (<any>window).Stripe.source.create({
        type: 'sepa_debit',
        sepa_debit: {
          iban: this.debitForm.get('account_number').value,
        },
        currency: 'EUR',
        owner: {
          name: this.debitForm.get('account_holder_name').value,
          address: {
            line1: this.reg.stepOneData.value.address,
            city: this.reg.stepOneData.value.city,
            postal_code: this.reg.stepOneData.value.zip,
            country: 'DE'
          },
        },
      }, (status: number, response: any) => {
        if (status === 200) {
          resolve(response.id);
        } else {
          reject(response.error.message);
        }
      });
    });
  }

  getTokenCreditCard() {
    return new Promise<string>((resolve, reject) => {
      (<any>window).Stripe.card.createToken({
        number: this.form.get('number').value,
        exp_month: this.form.get('exp_month').value,
        exp_year: this.form.get('exp_year').value,
        cvc: this.form.get('cvc').value,
      }, (status: number, response: any) => {
        if (status === 200) {
          resolve(response.id);
        } else {
          reject(response.error.message);
        }
      });
    });
  }

  isCompany() {
    return this.reg && this.reg.stepOneData && this.reg.stepOneData.value['company_name'] && this.reg.stepOneData.value['company_name'].length;
  }

  getToken() {

    (<any>window).Stripe.setPublishableKey(ENV.stripeKey);
    if (this.selectPayment.value.payment == "creditcard") {
      return this.getTokenCreditCard();
    } else {
      return this.getTokenBankAccount();
    }
  }

  presentLoading() {
    let spinner = this.platform.is('ios') ? 'ios' : 'crescent';
    let content;
    this.translateService.get('signup.step3.loading')
      .subscribe(translation => content = translation);

    this.loader = this.loadingCtrl.create({
      spinner: spinner,
      content: content
    });
    this.loader.present();
  }

  ngOnInit() {
    //let data = {
    //  'title':'Step 3 | digitalkasten.de',
    //  'url':'/reg/step3'
    //};
    //this.analyticsService.trackPageView(data);
  }

 // private trackRegistrationData(user, registrationForm) {
 //   let plan = registrationForm.stepTwoData.plan;
 //   let valueMapping = {
 //     'flexible_plan': 51.80,
 //     '6months_plan':  149.40,
 //     '12months_plan': 238.80
 //   };
 //   let data = {
 //     title: 'Danke | digitalkasten.de',
 //     url: '/reg/danke',
 //     orderid: user.id,
 //     subscription: plan,
  //    subscription_value: valueMapping[plan]
  //  };
    //this.analyticsService.trackPageView(data);
  //}

}
