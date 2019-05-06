import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Rx';
import { ENV } from '@app/env';
import { HttpService } from './http-service';
import {TokenService} from './token-service';
import {SignUpService} from './sign-up-service';

@Injectable()
export class RegistrationService {
    private  BASE_URL = `${ENV.apiUrl}/onboardings`;
    public stepOneData: any = {
        value: {}
    };
    
    public stepOneCompleted: boolean = false;

    public stepTwoData: any = {
        value: {},
        card: null,
        debit: null,
        voucher: ''
    };


    public stepFourData: any = null;

    constructor(public http: HttpService,
                private tokenService: TokenService,
                private signupService: SignUpService) {
    }

    public create(opts) {
        return this.http.post(this.BASE_URL, opts)
            .map(res => res.json())
            .catch((response) => Observable.throw(response.json()));
    }

    public mapData() {
        let data = {};
        if (this.stepOneData) {
            data["first_name"] = this.stepOneData.value.firstName;
            data["last_name"] = this.stepOneData.value.lastName;
            data["street"] = this.stepOneData.value.address;
            data["company"] = this.stepOneData.value.company;
            data["zipcode"] = this.stepOneData.value.zip;
            data["city"] = this.stepOneData.value.city;
            data["mail_delivery_first_name"] = this.stepOneData.value.mailDeliveryFirstName;
            data["mail_delivery_last_name"] = this.stepOneData.value.mailDeliveryLastName;
            data["mail_delivery_street"] = this.stepOneData.value.mailDeliveryAddress;
            data["mail_delivery_company"] = this.stepOneData.value.mailDeliveryCompany;
            data["mail_delivery_zipcode"] = this.stepOneData.value.mailDeliveryZip;
            data["mail_delivery_city"] = this.stepOneData.value.mailDeliveryCity;
            data["accepted_tos"] = this.stepOneData.value.checkedTermsAndConditions;
            data["accepted_privacy"] = this.stepOneData.value.checkedPrivacyPolicy;
            data["phone"] = this.stepOneData.value.phone;
            data["stripe_plan_id"] = this.getStripePlan(this.stepOneData.value.selectedPlan);
            data["plan_id"] = this.getPlanId(this.stepOneData.value.selectedPlan);
            if (this.stepOneData.value.emails) {
                data["email"] = this.stepOneData.value.emails.email;
                data["email_confirmation"] = this.stepOneData.value.emails.emailConfirmation;
            }
            if (this.stepOneData.value.passwords) {
                data["password"] = this.stepOneData.value.passwords.password;
                data["password_confirmation"] = this.stepOneData.value.passwords.passwordConfirmation;
            }
        }

        if (this.stepTwoData) {
            if (this.stepTwoData.card && this.stepTwoData.card.value.token) {
                data["token"] = this.stepTwoData.card.value.token;
            } else {
                data["token"] = this.stepTwoData.debit.value.token;
            }
        }
        let userLang = navigator.language.split('-')[0];
        userLang = /(de|en)/gi.test(userLang) ? userLang : 'en';

        data["locale"] = userLang;
        data["voucher"] = this.stepTwoData.voucher;
        // for now always DE
        data["locale"] = 'de';
        return {
            onboarding: data,
            api_token: this.tokenService.get()
        };
    }

    // fetch stored data from the registration service
    //
    // attributeName: the name of the attribute to search for
    // attributeNestedIn: the subform where the attribute can be found in. used
    // in case form groups are used.
    // registrationStep: the step of the registration to look in.
    //
    // returns the value of the attribute or an empty string.
    public fetchStoredData(attributeName: string, attributeNestedIn = null, registrationStep = null) {

        let stepStore = this[registrationStep];
        if (registrationStep && stepStore) {

            if (stepStore.value[attributeName]) {
                // check for root level stored values on the registration service.
                return stepStore.value[attributeName];
            } else if (stepStore.value[attributeNestedIn] && stepStore.value[attributeNestedIn][attributeName]) {
                // it could also happen that we are storing a nestefd property in the
                // form. in that case check for the subkey
                return stepStore.value[attributeNestedIn][attributeName];
            }
        } else if (RegistrationService.shouldPrefillRegistrationWithTestData()) {
            // for testing/dev prefill some data in the registration
            return RegistrationService.fetchPrefilledRegistrationTestData(attributeName);
        } else {
            // nothing found, return an empty string
            return '';
        }
    }

    // returns true if we should prefill the registration with test data.
    private static shouldPrefillRegistrationWithTestData(): Boolean {
        return ENV.prefillRegistration;
    }

    // returns prefilled registration data
    private static fetchPrefilledRegistrationTestData(attributeName) {
        let data = {
            firstName: 'John',
            lastName: 'Doe Tester',
            address: 'Foostreet 12',
            company: 'Doe Ltd',
            zip: '21075',
            city: 'Hamburg',
            phone: '+49123123123123',
            mailDeliveryFirstName: 'Ally',
            mailDeliveryLastName: 'Doe Tester',
            mailDeliveryAddress: 'Friedelstrasse 12',
            mailDeliveryCompany: 'Mail Ltd',
            mailDeliveryZip: '10245',
            mailDeliveryCity: 'Berlin',
            accountHolderName: 'John Doe Tester',
            accountNumber: 'DE89370400440532013000',
            creditCardNumber: '4242424242424242',
            holder: 'John Doe Tester',
            expiryMonth: '12',
            expiryYear: '2021',
            cvc: '123'
        };
        return data[attributeName];
    }

    // get the id of the stripe plan for the backend
    private getStripePlan(name: any): String {
        return this.fetchPlanObject(name).stripeId;
    }
    private getPlanId(name: any): String {
        return this.fetchPlanObject(name).plan_id;
    }

    private fetchPlanObject(name: any) {
        if (name) {
            return this.signupService.getPlanByName(name);
        } else {
            return this.signupService.getDefaultBillingPlan();
        }
    }
}
