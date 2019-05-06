import { Component } from '@angular/core';
import { NavController, ModalController, ToastController } from 'ionic-angular';
import { SignupStep2 } from '../step-2/step-2';
import { Login } from '../../login/login';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RegistrationService } from '../../../providers/registration-service';
import { TranslateService } from '@ngx-translate/core';
import { Toc } from '../terms-and-conditions/terms-and-conditions';
import { Privacy } from '../privacy-policy/privacy-policy';
import { AnalyticsService } from '../../../providers/analytics-service';
import * as _ from 'lodash';
import { ENV } from '@app/env';


@Component({
  selector: 'signup-step1',
  templateUrl: 'step-1.html'
})
export class SignupStep1 {

  pushPage: any = null;
  public form;
  public errors: any = [];
  public goToLogin: any = Login;

  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public reg: RegistrationService,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private translateService: TranslateService,
    private analyticsService: AnalyticsService
  ) {
    this.pushPage = SignupStep2;
    let self = this;
    this.form = this.fb.group({
      firstName: [self.fetchValue('firstName'), [
        Validators.required,
      ]],
      lastName: [self.fetchValue('lastName'), [
        Validators.required,
      ]],
      address: [self.fetchValue('address'), Validators.required],
      company: [self.fetchValue('company')],
      zip: [this.fetchValue('zip'), [
        Validators.required
      ]],
      city: [self.fetchValue('city'), [
        Validators.required
      ]],
      mailDeliveryFirstName: [self.fetchValue('mailDeliveryFirstName'), [
        Validators.required
      ]],
      mailDeliveryLastName: [self.fetchValue('mailDeliveryLastName'), [
        Validators.required
      ]],
      mailDeliveryAddress: [self.fetchValue('mailDeliveryAddress'), Validators.required],
      mailDeliveryCompany: [self.fetchValue('mailDeliveryCompany')],
      mailDeliveryZip: [this.fetchValue('mailDeliveryZip'), [
        Validators.required
      ]],
      mailDeliveryCity: [self.fetchValue('mailDeliveryCity'), [
        Validators.required
      ]],
      emails: this.fb.group(
        {
          email: [self.fetchValue('email', 'emails'), [
            Validators.required,
            Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
          ]],
          emailConfirmation: [self.fetchValue('emailConfirmation', 'emails'), Validators.required]
        },
        { validator: matching('email', 'emailConfirmation') }
      ),
      passwords: this.fb.group(
        {
          password: [self.fetchValue('password', 'passwords'), [
            Validators.required,
            /*Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/)*/
          ]],
          passwordConfirmation: [self.fetchValue('passwordConfirmation', 'passwords'), [
            Validators.required,
            /*Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/)*/
          ]]
        },
        { validator: matching('password', 'passwordConfirmation') }
      ),
      checkedTermsAndConditions: [self.fetchValue('checkedTermsAndConditions'), Validators.required],
      checkedPrivacyPolicy: [self.fetchValue('checkedPrivacyPolicy'), Validators.required]
    });

    // uncomment this to speed registration up.
    if (ENV.prefillRegistration) {
      let random = (Math.random() * 100).toString().replace('.', '');
      let data = {
        firstName: 'Hendrik',
        lastName: 'Kleinwaechter',
        address: 'Wattenbergstraße 13',
        company: 'Foo GmbH',
        zip: '21075',
        city: 'Hamburg',
        mailDeliveryFirstName: 'Hendrik',
        mailDeliveryLastName: 'Kleinwächter',
        mailDeliveryAddress: 'Wattenbergstraße 13',
        mailDeliveryCompany: 'Foo GmbH',
        mailDeliveryZip: '21075',
        mailDeliveryCity: 'Hamburg',
        emails: {
          email: "hendrik.kleinwaechter+" + random + "@gmail.com",
          emailConfirmation: "hendrik.kleinwaechter+" + random + "@gmail.com"
        },
        passwords: {
          password: 'test',
          passwordConfirmation: 'test'
        },
        checkedTermsAndConditions: true,
        checkedPrivacyPolicy: true,
      };
      this.form.patchValue(data);
    }
  }

  public formSubmitted = (event) => {
    this.errors = [];
    if (this.form.valid) {
      if (this.form.value.checkedTermsAndConditions && this.form.value.checkedPrivacyPolicy) {
        this.navCtrl.push(this.pushPage);
        this.reg.stepOneData = this.form;
      } else {
        this.translateService.get('signup.step3.needToAccept').subscribe(
          value => {
            let message = value;
            this.toast(message);
          }
        );
      }
    } else {

      let emailValid = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(this.form.value.emails.email);

      if (!emailValid) {
        this.errors.push(this.translateService.instant('signup.step1.errors.emailInvalid'));
      }

      if (this.form.value.passwords.password != this.form.value.passwords.passwordConfirmation) {
        this.errors.push(this.translateService.instant('signup.step1.errors.passwordsDontMatch'));
      }

      if (this.form.value.emails.email != this.form.value.emails.emailConfirmation) {
        this.errors.push(this.translateService.instant('signup.step1.errors.emailsDontMatch'));
      }

      let message = '';
      let length = this.errors.length;
      for (let i = 1; i <= length; i++) {
        if (i == length) {
          message += this.errors[i-1];
        } else {
          message += this.errors[i-1] + '\n';
        }
      }

      let toast = this.toastCtrl.create({
        message: message,
        duration: 5000
      });
      toast.present();

      console.log("invalid form submitted", this.form);
      return true;
    }
  }

  public fetchValue = (key, subkey = null) => {
    if (this.reg && this.reg.stepOneData && this.reg.stepOneData.value[key]) {
      return this.reg.stepOneData.value[key];
    } else if (this.reg && this.reg.stepOneData && this.reg.stepOneData.value[subkey] && this.reg.stepOneData.value[subkey][key]) {
      return this.reg.stepOneData.value[subkey][key];
    } else {
      let booleanDefaultFields = ['checkedTermsAndConditions', 'checkedPrivacyPolicy'];
      if (_.includes(booleanDefaultFields, key)) {
        return false;
      } else {
        return '';
      }
    }
  }

  acceptTermsAndConditions($event) {
    let tocModal = this.modalCtrl.create(Toc);
    this.form.patchValue({checkedTermsAndConditions: false});
    tocModal.onDidDismiss(checked => {
      this.form.patchValue({checkedTermsAndConditions: checked});
   });
    tocModal.present();
  }

  acceptPrivacyPolicy($event) {
    let tocModal = this.modalCtrl.create(Privacy);
    this.form.patchValue({checkedPrivacyPolicy: false});
    tocModal.onDidDismiss(checked => {
      this.form.patchValue({checkedPrivacyPolicy: checked});
   });
    tocModal.present();
  }

  copyAddress($event) {
    $event.preventDefault();
    let attributes = [
      'firstName',
      'lastName',
      'company',
      'address',
      'zip',
      'city'
    ];
    _.each(attributes, (attr) => {
      let value = this.form.value[attr];
      let attribute = _.upperFirst(attr);
      let target = `mailDelivery${attribute}`;
      let data = {};
      data[target]  = value;
      this.form.patchValue(data);
    });
    return false;
  }

  private toast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  ngOnInit() {
   // let data = {
   //   'title':'Step 1 | digitalkasten.de',
   //   'url':'/reg/step1'
   // };
    //this.analyticsService.trackPageView(data);
  }
}

function matching(key: string, confirmationKey: string) {
  return (group: FormGroup) => {
    let input = group.controls[key];
    let confirmationInput = group.controls[confirmationKey];
    if (input.value !== confirmationInput.value) {
      return confirmationInput.setErrors({notEquivalent: true});
    }
  };
}
