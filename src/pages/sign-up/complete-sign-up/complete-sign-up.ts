import {Component} from '@angular/core';
import {NavController, NavParams, ToastController, MenuController} from 'ionic-angular';
import {FormBuilder, Validators, FormGroup} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../providers/user-service';


import * as _ from 'lodash';

import {AnalyticsService} from '../../../providers/analytics-service';
import {SignUpService} from '../../../providers/sign-up-service';
import {RegistrationService} from '../../../providers/registration-service';

import {Inbox} from '../../documents/inbox/inbox';
import {BillingOptions} from '../billing-options/billing-options';

@Component({
    selector: 'page-complete-sign-up',
    templateUrl: 'complete-sign-up.html'
})
export class CompleteSignUp {
    public form: FormGroup;
    public errors: string[] = [];
    public pushPage: any;
    public user_form_step_first = true;
    public businessPlans: boolean = false;
    public choosedPlan;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public formBuilder: FormBuilder,
                private translateService: TranslateService,
                private signUpService: SignUpService,
                private registrationService: RegistrationService,
                private analyticsService: AnalyticsService,
                private toastCtrl: ToastController,
                private menuCtrl: MenuController,
                private userService: UserService) {
        // disable the menu to fix
        // the problem with the view been frozen
        // on small screens (iOS for example)
        this.menuCtrl.enable(false);

        this.initForm();
        let message = this.navParams.get("message");
        if (message) {
            let toast = this.toastCtrl.create({
                message: this.translateService.instant(message),
                duration: 3000,
                position: 'bottom'
            });
            toast.present();
        }

    }

    ionViewDidLoad() {

        //let data = {
          //  'title': 'Complete Sign Up',
          //  'url': 'complete-sign-up'
        //};
        //this.analyticsService.trackPageView(data);
    }

    // sets up the form for the user. inits data already stored for the
    // registration if provided by the user.
    initForm() {
        let self = this;
        this.userService.getCurrentUser().subscribe(
          user => {
              let general_data = {
                'event':'page',
                'p_path':'/complete-sign-up',
                'p_title':'Complete SignUp',
                'user': user.id
              };

              this.analyticsService.trackCustomEvent(general_data);

              this.form = this.formBuilder.group({
                  firstName: [
                      user.firstName, //self.fetchValue('firstName'),
                      Validators.required
                  ],
                  lastName: [
                      user.lastName, //self.fetchValue('lastName'),
                      Validators.required
                  ],
                  address: [
                      user.street,
                      Validators.required
                  ],
                  company: [user.companyName],
                  zip: [
                      user.zipcode,
                      Validators.required
                  ],
                  city: [
                      user.city,
                      Validators.required
                  ],
                  phone: [
                      user.phone,//self.fetchValue('phone')
                      Validators.required
                  ],
                  selectedPlan: [
                      self.navParams.get('selectedPlan')
                  ],
                  mailDeliveryFirstName: [
                      user.firstName,
                      Validators.required
                  ],
                  mailDeliveryLastName: [
                      user.lastName,
                      Validators.required
                  ],
                  mailDeliveryAddress: [
                      user.street,
                      Validators.required
                  ],
                  mailDeliveryCompany: [user.company],
                  mailDeliveryZip: [
                      user.zipcode,
                      Validators.required
                  ],
                  mailDeliveryCity: [
                      user.city,
                      Validators.required
                  ],
              });
          },
          err => {
              console.log('error');
          });
    }

    // returns a stored value for the form. this is used since the user can go
    // back and forward between the steps.
    private fetchValue(attributeName, attributeNestedIn = null) {
        return this.signUpService.fetchStoredData(attributeName, attributeNestedIn, 'completeSignUp');
    }

    public fetchSignupPlans(): Array<Object> {
      let data = this.signUpService.getAvailableBillingPlans();
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
      if (step == 4 && this.user_form_step_first) {
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

    // copies address data to the mail delivery address data. that way the user
    // does not have to enter his address data twice.
    public copyAddress(event) {
        event.preventDefault();
        let attributes = [
            'firstName',
            'lastName',
            'company',
            'address',
            'zip',
            'city'
        ];
        _.each(attributes, (attr) => {
            const value = this.form.value[attr];
            const attribute = _.upperFirst(attr);
            const target = `mailDelivery${attribute}`;
            let data = {};
            data[target] = value;
            this.form.patchValue(data);
        });
        return false;
    }

    // called when we submit the form.
    onSubmit(event: FormGroup) {
        this.errors = [];
        if (this.form.valid) {
            this.handleFormValid();
        } else {
            this.handleFormInvalid();
        }
    }

    // called when the form is valid
    private handleFormValid() {
        // store the form in the registration service.
        this.registrationService.stepOneData = this.form;
        this.registrationService.stepOneCompleted = true;
        this.navCtrl.push(BillingOptions);
    }

    // called when the form is invalid. this will perform several clientside
    // validations to catch obvious errors and then show them to the user.
    private handleFormInvalid() {
    }

    public onBack() {
      setTimeout(() => {
        this.navCtrl.setRoot(Inbox);
      }, 1000);
    }
}
