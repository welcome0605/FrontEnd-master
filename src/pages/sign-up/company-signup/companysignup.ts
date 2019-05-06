import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, Platform, ToastController, ModalController } from 'ionic-angular';
import { TokenService } from '../../../providers/token-service';
import { FormGroup, Validators, FormBuilder, FormControl } from "@angular/forms";
import { BillingPlan } from "../../../models/billing-plan";
import { TranslateService } from '@ngx-translate/core';
import { SignUpService } from "../../../providers/sign-up-service";
import { Inbox } from "../../documents/index";
import { Terms, Policy } from "../index";
import { AnalyticsService } from '../../../providers/analytics-service';
import * as utils from "../../../utils/utils";
import { ENV } from '@app/env';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { HttpService } from '../../../providers/http-service';
import { PaymentSuccess } from "../payment-success/payment-success";

@Component({
    selector: 'page-companysignup',
    templateUrl: 'companysignup.html'
})
export class CompanySignupPage {
    public registerForm: FormGroup;
    public addressForm: FormGroup;
    public bankForm: FormGroup;
    public cardForm: FormGroup;
    public tacForm: FormGroup;
    public paymentMethod: string = "bank";
    public billingPlan: BillingPlan;
    private loader: any;
    private checkerUrl = `${ENV.adminUrl}/`;
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
    private http: HttpService,
    private toastCtrl: ToastController
    ) {
        
      let planType = this.navParams.get("planType");
      this.loadBillingPlanInfo(planType);
      this.initForm();
      this.subscribePaymentTypeChanges();
      this.setPaymentMethodType(this.PAYMENT_METHOD_TYPE.BANK);

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
        return "";
    }
    
    initAddressForm(self) {
        
        this.addressForm = this.formBuilder.group(
        {
            
            firstName: [
            this.fetchValue('firstName'),
            Validators.required
            ],
            lastName: [
            this.fetchValue('lastName'),
            Validators.required
            ],
            address: [
            this.fetchValue('address'),
            Validators.required
            ],
            company: [
            this.fetchValue('company'),
            Validators.required
            ],
            zip: [
            this.fetchValue('zip'),
            Validators.required
            ],
            city: [
            this.fetchValue('city'),
            Validators.required
            ],
            phone: [
            this.fetchValue('phone'),
            Validators.required
            ]
        });
        
    }
    
    initPaymentMethodBankModel(self) {
        
        return {
            accountHolderName: [
              this.fetchValue('accountHolderName'),
              Validators.required
            ],
            accountNumber: [
              this.fetchValue('accountNumber'),
              Validators.required
            ],
            voucher: [
              this.fetchValue('voucher')
            ],
            token: this.fetchValue('token')
        };
        
    }
    initPaymentMethodCardModel(self) {
        const cardNoRegex = `^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$`;
        const cvcRegex = `^[0-9]{3,4}$`;
        
        return {
            creditCardNumber: [
            this.fetchValue('creditCardNumber'),
            [Validators.required, Validators.pattern(cardNoRegex)]
            ],
            name: [
            this.fetchValue('holder'),
            Validators.required
            ],
            expiryMonth: [
            this.fetchValue('expiryMonth'),
            Validators.required
            ],
            expiryYear: [
            this.fetchValue('expiryYear'),
            Validators.required
            ],
            cvc: [
            this.fetchValue('cvc'),
            [Validators.required, Validators.pattern(cvcRegex)]
            ],
            voucher: [
              this.fetchValue('voucher')
            ],
            token: this.fetchValue('token'),
            method: this.fetchValue('paymentMethod')
        };
    }
    
    
    initForm() {
        
        this.initAddressForm(this);
        
        this.tacForm = this.formBuilder.group({
            tac: [
            false,
            Validators.requiredTrue
            ]
        });
        this.registerForm = this.formBuilder.group({
            userForm: this.initUserForm(),
            addressForm: this.addressForm,
            paymentMethod: this.initPaymentMethodFormGroup(),
            tacForm: this.tacForm
        });
        
    }
    initUserForm() {
        
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        return this.formBuilder.group({
            emails: this.formBuilder.group(
            {
                email: [
                '',
                [
                  Validators.required,
                  Validators.pattern(emailRegex)
                ]
                ],
                emailConfirmation: [
                null,
                Validators.required
                ]
            },
            { validator: this.matching('email', 'emailConfirmation') }
            ),
            passwords: this.formBuilder.group(
            {
                password:
                [
                  null,
                  [
                    Validators.required
                  ]
                ],
                passwordConfirmation: [
                  null,
                  [
                    Validators.required
                  ]
                ]
            },
            { validator: this.matching('password', 'passwordConfirmation') }
            ),
        });
        
    }
    
    initPaymentMethodFormGroup() {
        // initialize payment method form group
        const group = this.formBuilder.group({
            type: [''],
            voucher: '',
            plan: [this.billingPlan.stripeId, Validators.required],
            card: this.formBuilder.group(this.initPaymentMethodCardModel(this)),
            bank: this.formBuilder.group(this.initPaymentMethodBankModel(this)),
            plan_id: this.billingPlan.plan_id
        });
        
        return group;
    }
    
    register(event) {
        // handle registristration form submit process
        
        if (this.registerForm.valid) {
            this.presentLoading();
            // this.registrationService.register();
            let method = this.registerForm.controls.paymentMethod.get("type").value;
            const pmCtrl = (<any>this.registerForm).controls.paymentMethod;
            const addressCtrl = (<any>this.registerForm).controls.addressForm;
            let bankCtrl = pmCtrl.controls.bank;
            let cardCtrl = pmCtrl.controls.card;
            let voucher = pmCtrl.get("voucher").value;
            
            
            let address = null;
            let form =  cardCtrl;
            if(method == 'bank'){
                address =  {
                    address: addressCtrl.get('address').value,
                    city: addressCtrl.get("city").value, 
                    zip: addressCtrl.get("zip").value
                };
                form = bankCtrl;
            }      
            this.signupService.getToken(method, form, address).then(
            token => {
                // store the token correctly.
                if (method == "card") {
                    cardCtrl.patchValue({ token: token });
                } else {
                    bankCtrl.patchValue({ token: token });
                }
                this.signupService.companySignup(this.registerForm).subscribe(
                  res => {
                   // this.trackRegistrationData(res);

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
                    this.presentToast(this.translateService.instant('signUp.signUpSuccess.title'));
                  },
                  err => {
                      // invalid card
                      if (this.loader) {
                          this.loader.dismiss();
                          this.loader = null;
                      }
                      this.handleStripeError(err);
                  }
                );
            },
            err => {
                // invalid card
                if (this.loader) {
                    this.loader.dismiss();
                    this.loader = null;
                }
                this.handleStripeError(err);
            });
            
        } else {
            // invalid registration form
            
        }
        
    }
    
    private presentToast(message: string) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000
        });
        toast.present();
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
    
    
    setPaymentMethodType(type: string) {
        // update payment method type value
        const ctrl: FormControl = (<any>this.registerForm).controls.paymentMethod.controls.type;
        ctrl.setValue(type);
    }
    
    subscribePaymentTypeChanges() {
        
        // controls
        const pmCtrl = (<any>this.registerForm).controls.paymentMethod;
        let bankCtrl = pmCtrl.controls.bank;
        let cardCtrl = pmCtrl.controls.card;
        
        // initialize value changes stream
        const changes$ = pmCtrl.controls.type.valueChanges;
        
        // subscribe to the stream
        changes$.subscribe(paymentMethodType => {
            if (paymentMethodType === this.PAYMENT_METHOD_TYPE.BANK) {
                
                // set back validators for bank control
                Object.keys(bankCtrl.controls).forEach(key => {
                    bankCtrl.controls[key].setValidators(this.initPaymentMethodBankModel(this)[key][1]);
                    bankCtrl.controls[key].updateValueAndValidity();
                });
                // remove validators for card control
                Object.keys(cardCtrl.controls).forEach(key => {
                    cardCtrl.controls[key].setValidators(null);
                    cardCtrl.controls[key].updateValueAndValidity();
                });
            }
            
            if (paymentMethodType === this.PAYMENT_METHOD_TYPE.CARD) {
                // remove validators for bank form control
                Object.keys(bankCtrl.controls).forEach(key => {
                    bankCtrl.controls[key].setValidators(null);
                    bankCtrl.controls[key].updateValueAndValidity();
                });
                // set back validators for card control
                Object.keys(cardCtrl.controls).forEach(key => {
                    cardCtrl.controls[key].setValidators(this.initPaymentMethodCardModel(self)[key][1]);
                    cardCtrl.controls[key].updateValueAndValidity();
                });
            }
            
        });
    }
    
    matching(key: string, confirmationKey: string) {
        //validate if the key match
        return (group: FormGroup) => {
            let input = group.controls[key];
            let confirmationInput = group.controls[confirmationKey];
            if (input.value !== confirmationInput.value) {
                return confirmationInput.setErrors({ notEquivalent: true });
            }
        };
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
     // let data = {
     //   title: 'Full account created',
     //   url: '/reg/full_account_created',
     //   orderid: user.id,
     //   subscription: this.billingPlan.name,
     // };
      //this.analyticsService.trackPageView(data);
     // let otherData = {
     //   title: 'Payment data added',
     //   url: '/reg/payment_data_added',
     //   orderid: user.id,
     //   subscription: this.billingPlan.name,
     // };
      //this.analyticsService.trackPageView(otherData);
    //}

    private handleStripeError(err) {
      if (err.indexOf('sepa_debit[iban]') >= 0) {
        // Invalid IBAN: "The payment method `sepa_debit` requires the parameter: sepa_debit[iban]."
        this.presentToast(this.translateService.instant('signUp.stripeError.invalidIban'));
      } else if (err.indexOf('owner[name]') >= 0) {
        // Invalid owner: "You passed an empty string for 'owner[name]'. 
        // We assume empty values are an attempt to unset a parameter;
        // however 'owner[name]' cannot be unset. 
        // You should remove 'owner[name]' from your request or supply a non-empty value."
        this.presentToast(this.translateService.instant('signUp.stripeError.invalidOwner'));
      } else {
        this.presentToast(err);
      }
      // Invalid IBAN: "The payment method `sepa_debit` requires the parameter: sepa_debit[iban]."
    }
}
