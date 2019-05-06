import { Component } from '@angular/core';
import {
    NavController, NavParams,
    LoadingController,
    Platform,
    ToastController,
    ModalController
} from 'ionic-angular';
import { TokenService } from '../../../providers/token-service';
import { FormGroup, Validators, FormBuilder, FormControl } from "@angular/forms";
import { BillingPlan } from "../../../models/billing-plan";
import { TranslateService } from '@ngx-translate/core';
import { SignUpService } from "../../../providers/sign-up-service";
import { UserService } from "../../../providers/user-service";
import { RegistrationService } from "../../../providers/registration-service";
import { Inbox } from "../../documents/index";
import { Terms, Policy } from "../index";
import { AnalyticsService } from '../../../providers/analytics-service';
import { AddressForm } from "../../../forms/address-form";
import * as utils from "../../../utils/utils";
import { PaymentForm } from "../../../forms/payment-form";
import { UserForm } from "../../../forms/user-form";
import { ENV } from '@app/env';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { HttpService } from '../../../providers/http-service';
import { PaymentSuccess } from "../payment-success/payment-success";

@Component({
    selector: 'page-fullsignup',
    templateUrl: 'fullsignup.html'
})
export class FullSignupPage {
    public registerForm: FormGroup;
    public userForm: UserForm;
    public addressForm: AddressForm;
    public tacForm: FormGroup;
    public paymentForm: PaymentForm;
    public billingPlan: BillingPlan;
    private checkerUrl = `${ENV.adminUrl}/`;
    private loader: any;
    public message = '';
    public user_form_step_first = true;
    public user_form_step_second = true;

    public PAYMENT_METHOD_TYPE = {
        BANK: 'bank',
        CARD: 'card'
    };

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private tokenService: TokenService,
        private signupService: SignUpService,
        private formBuilder: FormBuilder,
        private translateService: TranslateService,
        private loadingCtrl: LoadingController,
        private modalCtrl: ModalController,
        private platform: Platform,
        private analyticsService: AnalyticsService,
        private registrationService: RegistrationService,
        private toastCtrl: ToastController,
        private userService: UserService,
        private http: HttpService,

    ) {
        
        let planType = this.navParams.get("planType");
        this.loadBillingPlanInfo(planType);
        this.initForm();

        let general_data = {
          'event':'page',
          'p_path':'/full-signup/' + this.billingPlan.identifier,
          'p_title':'Full Signup for ' + this.billingPlan.name
        };
        this.analyticsService.trackCustomEvent(general_data);
    }

    loadBillingPlanInfo(planType: string) {
        // load billing plan depending on url
        let billingPlans = this.signupService.getAvailableBillingPlans();
        this.billingPlan = billingPlans[planType];

        if (this.billingPlan === undefined) {
            // handle the invalid case
            this.billingPlan = billingPlans["base"];
        }
    }

    checkVoucher() {
      let voucher = (<any>this.registerForm).controls.paymentMethod.get("voucher").value;

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

    checkUserForm(step) {
      if (step == 4 && this.user_form_step_first) {
        let data = this.analytic_structure(step);
        this.analyticsService.trackCustomEvent(data);
        this.user_form_step_first = false;
      }

      if (step == 5 && this.user_form_step_second) {
        let data = this.analytic_structure(step);
        this.analyticsService.trackCustomEvent(data);
        this.user_form_step_second = false;
      }

    }

    private analytic_structure(step) {
      return {
        "event": "checkout",
        "ecommerce": {
        "checkout": {
          'actionField': {'step': step},
          'products': [{
            "id": this.billingPlan.name.replace(/\s/g, ''),
            "name": this.billingPlan.name,
            "price": this.billingPlan.price,
            "variant": "full",
            "quantity": 1
          }]
        }
      }
      };
    }

    // returns a stored value for the form. this is used since the user can go
    // back and forward between the steps.
    private fetchValue(attributeName, attributeNestedIn = null) {

        let fetchedValue = this.registrationService.fetchStoredData(attributeName);
        return fetchedValue;

    }
   
    public ionicViewCanEnter() {
        let response = new Promise((resolve, reject) => {
            this.userService.isLoggedIn().then(loggedIn => {
                if (loggedIn) {
                    // the user is logged in, so can't enter this page
                    //
                    resolve(false);

                }
                else {
                    // not logged in
                    //so can enter the page
                    resolve(true);
                }
            }, error => {

                reject(new Error("Failed to get user loggin state"));

            });
        });
        return response;

    }

    

    initForm() {

        this.addressForm = new AddressForm(this.formBuilder);
        this.paymentForm = new PaymentForm(this.formBuilder, this.billingPlan.stripeId, this.billingPlan.plan_id);
        this.userForm = new UserForm(this.formBuilder);
        this.tacForm = this.formBuilder.group({
            tac: [
                false,
                Validators.requiredTrue
            ]
        });

        this.registerForm = this.formBuilder.group({
            userForm: this.userForm.formGroup,
            addressForm: this.addressForm.formGroup,
            paymentMethod: this.paymentForm.formGroup,
            tacForm: this.tacForm
        });
    }
    
    register(event) {
        // handle registration form submit process
        if (this.registerForm.valid) {
            this.presentLoading();
            // this.registrationService.register();
            let method = this.registerForm.controls.paymentMethod.get("type").value;
            const pmCtrl = (<any>this.registerForm).controls.paymentMethod;
            const addressCtrl = (<any>this.registerForm).controls.addressForm;
            let bankCtrl = pmCtrl.controls.bank;
            let cardCtrl = pmCtrl.controls.card;
            let address = null;
            let voucher = pmCtrl.get("voucher").value;
            let form = cardCtrl;

            // this is pretty messy and is not maintainable
            // TODO: refactor this and make it more clear
            if (method == 'bank') {
                address = {
                    address: addressCtrl.get('address').value,
                    city: addressCtrl.get("city").value,
                    zip: addressCtrl.get("zip").value
                };
                form = bankCtrl;
            }

            this.signupService.getToken(this.paymentForm.getMethod(), form, address).then(
                token => {
                    // store the token correctly.
                    this.paymentForm.setToken(token);

                    this.signupService.fullSignup(this.registerForm).subscribe(
                        res => {
                       //     this.trackRegistrationData(res);

                            if (this.loader) {
                                this.loader.dismiss();
                                this.loader = null;
                            }
                            // set the token service so the ser gets singed in
                            this.tokenService.set(res.token);
                            this.navCtrl.setRoot(PaymentSuccess, {
                                user: res,
                                path: '/full-signup'
                            });


                        },
                        err => {
                            // invalid card
                            // why not a single error handler
                            console.error(err);
                            if (this.loader) {
                                this.loader.dismiss();
                                this.loader = null;
                            }
                            let toastMessage = this.translateService.instant(err);
                            utils.presentToast(this.toastCtrl, toastMessage);
                        }
                    );
                },
                err => {
                    // invalid card
                    console.error(err);
                    if (this.loader) {
                        this.loader.dismiss();
                        this.loader = null;
                    }
                    let toastMessage = this.translateService.instant(err);
                    utils.presentToast(this.toastCtrl, toastMessage);
                });

        } else {
            // invalid registration form

        }

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

    readTermsAndConditions(event) {
        // click callback handler to show the terms and conditions 
        event.preventDefault();
        let termsModal = this.modalCtrl.create(Terms);
        termsModal.present();
    }

    readPrivacyPolicy(event) {
        // click callback handler to show the privacy policy
        event.preventDefault();
        let policyModal = this.modalCtrl.create(Policy);
        policyModal.present();
    }

    //private trackRegistrationData(user) {
    //    let data = {
    //        title: 'Full account created',
    //        url: '/reg/full_account_created',
    //        orderid: user.id,
    //        subscription: this.billingPlan.name,
    //    };
        //this.analyticsService.trackPageView(data);
    //    let otherData = {
    //        title: 'Payment data added',
    //        url: '/reg/payment_data_added',
    //        orderid: user.id,
    //        subscription: this.billingPlan.name,
    //    };
        //this.analyticsService.trackPageView(otherData);
    //}
    
    checkInput(event: KeyboardEvent){
        // TODO: move this to an iban component instead
        // and handle all the logic there
        let key = event.key;
        if(/[^A-Za-z0-9 ]/g.test(key)){
            //not a valid key
            event.preventDefault();
        }
    }
}
