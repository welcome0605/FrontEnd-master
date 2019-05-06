import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { ENV } from '@app/env';
import { FormGroup } from "@angular/forms";
import { Card } from "../models/card";
import { BankAccount } from "../models/bank-account";
import { Address } from "../models/address";

@Injectable()
export class SignUpService {
    private baseUrl = `${ENV.apiUrl}`;
    completeSignUp: any = {};
    billingOptions: any = {
        card: null,
        bank: null,
    };

    constructor(
        public http: Http
    ) { }

    // return an object with the different billing plans as keys
    public getAvailableBillingPlans() {
        return {
            flatrate_herbst: {
                name: "Flatrate Herbst",
                plan_id:"ccaa3021-1203-4896-94b9-8d6d451e2e71",
                marketingName: "Flatrate Herbst",
                stripeId: "flatrate-herbst",
                price: "9.95",
                identifier: "flatrate_herbst",
                properties: [
                    {
                        name: "9,95€ für unbegrenztes Digitalisieren Deiner Briefe"
                    },
                    {
                        name: "Keine Mindestlaufzeit"
                    },
                    {
                        name: "Unbegrenztes Empfangen Deiner Briefe per Mail, App und WebApp"
                    },
                    {
                        name: "30 Tage Archivierung inklusive (danach 0,50€ pro Brief im Monat)"
                    },
                    {
                        name: "25€ einmalige Einrichtungsgebühr (Du sparst 25€)",
                        currentlyFree: false
                    },
                    {
                        name: "2,50€ + Porto pro Sammelsendung (beliebig viele Briefe inklusive)"
                    }
                ]
            },
            business_herbst_aktion: {
                name: "Business Herbst Aktion",
                marketingName: "Business Herbst Aktion",
                plan_id:"69bbb0ec-7e92-4dcc-8209-491d6c90f7c6",
                stripeId: "business-herbst-aktion",
                price: "19.95",
                identifier: "business_herbst_aktion",
                properties: [
                    {
                        name: "Einrichtungsgebühr 49,90€",
                        currentlyFree: false
                    },
                    {
                        name: "19.95€ Grundgebühr / Monat"
                    },
                    {
                        name: "Keine Mindestlaufzeit"
                    },
                    {
                        name: "0,80€ Pro Scan-Brief"
                    },
                    {
                        name: "25 Briefe inklusive"
                    },
                    {
                        name: "2,50€ Sammelsendung + Porto (beliebig viele Briefe inklusive)"
                    },
                    {
                        name: "Archivierung 0,50€ Pro Brief / Monat"
                    },
                    {
                        name: "Vernichtung 0,00€"
                    }
                ]
            },
            flatrate_regular: {
                name: "Digitalkasten Flatrate Regular",
                plan_id:"0a302cb4-6931-4980-a943-d167695b5a21",
                marketingName: "Digitalkasten Flatrate",
                stripeId: "flatrate-regular",
                price: "20",
                identifier: "flatrate_regular",
                properties: [
                    {
                        name: "20,00€ für unbegrenztes Digitalisieren Deiner Briefe"
                    },
                    {
                        name: "Keine Mindestlaufzeit"
                    },
                    {
                        name: "Unbegrenztes Empfangen Deiner Briefe per Mail, App und WebApp"
                    },
                    {
                        name: "30 Tage Archivierung inklusive (danach 0,50€ pro Brief im Monat)"
                    },
                    {
                        name: "25€ einmalige Einrichtungsgebühr (Du sparst 25€)",
                        currentlyFree: false
                    },
                    {
                        name: "2,50€ + Porto pro Sammelsendung (beliebig viele Briefe inklusive)"
                    }
                ]
            },
            flatrate_promo: {
                name: "Digitalkasten Flatrate Promo",
                plan_id:"a3aad459-d22b-4d37-8c96-14e450bffa59",
                marketingName: "Digitalkasten Flatrate",
                stripeId: "flatrate-promo",
                price: "20",
                identifier: "flatrate_promo",
                properties: [
                    {
                        name: "20,00€ für unbegrenztes Digitalisieren Deiner Briefe"
                    },
                    {
                        name: "Keine Mindestlaufzeit"
                    },
                    {
                        name: "Unbegrenztes Empfangen Deiner Briefe per Mail, App und WebApp"
                    },
                    {
                        name: "30 Tage Archivierung inklusive (danach 0,50€ pro Brief im Monat)"
                    },
                    {
                        name: "Keine Einrichtungsgebühren (Du sparst 50€)",
                        currentlyFree: false
                    },
                    {
                        name: "2,50€ + Porto pro Sammelsendung (beliebig viele Briefe inklusive)"
                    }
                ]
            },
            business_basic: {
                name: "Business Basic",
                plan_id:"319a91c4-07fb-4d3f-87d9-ccaba527a0f6",
                marketingName: "Business Basic",
                stripeId: "business-basic",
                price: "50",
                identifier: "business_basic",
                properties: [
                    {
                        name: "Einrichtungsgebühr 50,00€",
                        currentlyFree: false
                    },
                    {
                        name: "24,99€ Grundgebühr / Monat"
                    },
                    {
                        name: "12 Monate Laufzeit"
                    },
                    {
                        name: "1,20€ Pro Scan-Brief"
                    },
                    {
                        name: "20 Briefe inklusive"
                    },
                    {
                        name: "2,50€ Sammelsendung + Porto (beliebig viele Briefe inklusive)"
                    },
                    {
                        name: "Archivierung 0,50€ Pro Brief / Monat"
                    },
                    {
                        name: "Vernichtung 0,00€"
                    }
                ]
            },
            business_casual: {
                name: "Business Casual",
                marketingName: "Business Casual",
                plan_id:"1566845e-5187-466a-8bb2-cb5e9fa6b2fb",
                stripeId: "business-casual",
                price: "50",
                identifier: "business_casual",
                properties: [
                    {
                        name: "Einrichtungsgebühr 50,00€",
                        currentlyFree: false
                    },
                    {
                        name: "49,99€ Grundgebühr / Monat"
                    },
                    {
                        name: "12 Monate Laufzeit"
                    },
                    {
                        name: "0,99€ Pro Scan-Brief"
                    },
                    {
                        name: "50 Briefe inklusive"
                    },
                    {
                        name: "2,50€ Sammelsendung + Porto (beliebig viele Briefe inklusive)"
                    },
                    {
                        name: "Archivierung 0,50€ Pro Brief/ Monat"
                    },
                    {
                        name: "Vernichtung 0,00€"
                    }
                ]
            },
            business_professional: {
                name: "Business Professional",
                plan_id:"58c055fe-c681-4301-9d15-791c0add3628",
                marketingName: "Business Professional",
                stripeId: "business-professional",
                price: "50",
                identifier: "business_professional",
                properties: [
                    {
                        name: "Einrichtungsgebühr 50,00€",
                        currentlyFree: false
                    },
                    {
                        name: "89,00€ Grundgebühr / Monat"
                    },
                    {
                        name: "12 Monate Laufzeit"
                    },
                    {
                        name: "0,99€ Pro Scan-Brief"
                    },
                    {
                        name: "100 Briefe inklusive"
                    },
                    {
                        name: "2,50€ Sammelsendung + Porto (beliebig viele Briefe inklusive)"
                    },
                    {
                        name: "Archivierung 0,25€ Pro Brief/ Monat"
                    },
                    {
                        name: "Vernichtung 0,00€"
                    }
                ]
            },
            business_enterprise: {
                name: "Business Enterprise",
                marketingName: "Business Enterprise",
                plan_id:"267505bd-3f92-4558-9eca-444f9277ef8b",
                stripeId: "business-enterprise",
                price: "50",
                identifier: "business_enterprise",
                properties: [
                    {
                        name: "Einrichtungsgebühr 50,00€",
                        currentlyFree: false
                    },
                    {
                        name: "249,00€ Grundgebühr / Monat"
                    },
                    {
                        name: "12 Monate Laufzeit"
                    },
                    {
                        name: "0,80€ Pro Scan-Brief"
                    },
                    {
                        name: "300 Briefe inklusive"
                    },
                    {
                        name: "2,50€ Sammelsendung + Porto (beliebig viele Briefe inklusive)"
                    },
                    {
                        name: "Archivierung 0,25€ Pro Brief/ Monat"
                    },
                    {
                        name: "Vernichtung 0,00€"
                    }
                ]
            },
            business_standard: {
                name: "Business Standard",
                marketingName: "Business Standard",
                plan_id:"5ae5a6cc-bde1-4be4-b868-72350ea4054f",
                stripeId: "business-standard",
                price: "29.75",
                identifier: "business_standard",
                properties: [
                    {
                        name: "Einrichtungsgebühr 59,50€",
                        currentlyFree: false
                    },
                    {
                        name: "29,75€ Grundgebühr / Monat"
                    },
                    {
                        name: "Keine Mindestlaufzeit"
                    },
                    {
                        name: "1,19€ Pro Scan-Brief"
                    },
                    {
                        name: "25 Briefe inklusive"
                    },
                    {
                        name: "2,98€ Sammelsendung + Porto (beliebig viele Briefe inklusive)"
                    },
                    {
                        name: "Archivierung 0,60€ Pro Brief / Monat"
                    },
                    {
                        name: "Vernichtung 0,00€"
                    }
                ]
            },
            flatrate: {
                name: "Flatrate",
                marketingName: "Flatrate",
                plan_id:"d95b5a65-5e1a-4297-8af1-781ba58315e5",
                stripeId: "digitalkasten-flatrate",
                price: "49.99",
                identifier: "flatrate",
                properties: [
                    {
                        name: "Einrichtungsgebühr 49,99€",
                        currentlyFree: true
                    },
                    {
                        name: "Nachsendeauftrag 26,90€",
                        currentlyFree: true
                    },
                    {
                        name: "49,99€ Grundgebühr / Monat"
                    },
                    {
                        name: "12 Monate Laufzeit"
                    },
                    {
                        name: "0,00€ Pro Brief"
                    },
                    {
                        name: "2,50€ Sammelsendung + Porto (beliebig viele Briefe inklusive)"
                    },
                    {
                        name: "Archivierung 0,50€ / Monat"
                    }
                ]
            },
            base: {
                name: "Flexibel",
                marketingName: "Flexibel",
                plan_id: "b165ffe1-f9a0-4b84-9046-1d96d5af514e",
                identifier: "base",
                stripeId: "digitalkasten-base",
                price: "49.99",
                properties: [
                    {
                        name: "Einrichtungsgebühr 49,99€",
                        currentlyFree: true
                    },
                    {
                        name: "Nachsendeauftrag 26,90€",
                        currentlyFree: true
                    },
                    {
                        name: "0,00€ Grundgebühr / Monat"
                    },
                    {
                        name: "0 Monate Laufzeit"
                    },
                    {
                        name: "1,99€ Pro Brief"
                    },
                    {
                        name: "2,50€ Sammelsendung + Porto (beliebig viele Briefe inklusive)"
                    },
                    {
                        name: "Archivierung 0,50€ / Monat"
                    }
                ]
            },
            small: {
                name: "Günstig",
                marketingName: "Günstig",
                plan_id: "9f68b331-4985-4792-8a54-dac929980a0d",
                price: "49.99",
                stripeId: "digitalkasten-small",
                identifier: "small",
                properties: [
                    {
                        name: "Einrichtungsgebühr 49,99€",
                        currentlyFree: true
                    },
                    {
                        name: "Nachsendeauftrag 26,90€",
                        currentlyFree: true
                    },

                    {
                        name: "9,99€ Grundgebühr / Monat"
                    },
                    {
                        name: "6 Monate Laufzeit"
                    },
                    {
                        name: "1,25€ Pro Brief"
                    },
                    {
                        name: "2,50€ Sammelsendung + Porto (beliebig viele Briefe inklusive)"
                    },
                    {
                        name: "Archivierung 0,50€ / Monat"
                    }
                ]
            }
        };
    }

    // returns the default plan that can be used if no other plan is applicable.
    public getDefaultBillingPlan() {
        return this.getAvailableBillingPlans().flatrate_herbst;
    }

    // returns the given plan by the name
    public getPlanByName(name: string): any {
        let plans = this.getAvailableBillingPlans();
        return plans[name];
    }

    // fetch stored data from the registration service
    //
    // attributeName: the name of the attribute to search for
    // attributeNestedIn: the subform where the attribute can be found in. used
    // in case form groups are used.
    // registrationStep: the step of the registration to look in.
    //
    // returns the value of the attribute or an empty string.
    fetchStoredData(attributeName, attributeNestedIn, registrationStep): void {
        let step = this[registrationStep];
        if (!step) {
            return null;
        }
        if (step[attributeName]) {
            // check for root level stored values on the registration service.
            return step[attributeName];
        } else if (step[attributeNestedIn] && step[attributeNestedIn][attributeName]) {
            // it could also happen that we are storing a nestefd property in the
            // form. in that case check for the subkey
            return step[attributeNestedIn][attributeName];
        } else if (SignUpService.shouldPrefillRegistrationWithTestData()) {
            // for testing/dev prefill some data in the registration
            return this.fetchPrefilledRegistrationTestData(attributeName);
        } else {
            // nothing found, return an empty string
            return null;
        }
    }

    // returns true if we should prefill the registration with test data.
    private static shouldPrefillRegistrationWithTestData(): boolean {
        return ENV.prefillRegistration;
    }

    // returns prefilled registration data
    private fetchPrefilledRegistrationTestData(attributeName) {
        let data = {
            firstName: 'John',
            lastName: 'Doe Tester',
            address: 'Foostreet 12',
            company: 'Doe Ltd',
            zip: '21075',
            city: 'Hamburg',
            phone: '0000000',
            mailDeliveryFirstName: 'Ally',
            mailDeliveryLastName: 'Doe Tester',
            mailDeliveryAddress: 'Friedelstrasse 12',
            mailDeliveryCompany: 'Mail Ltd',
            mailDeliveryZip: '10245',
            mailDeliveryCity: 'Berlin'
        };

        return data[attributeName];
    }

    mapData() {
        let data = {};
        if (this.completeSignUp) {
            data['first_name'] = this.completeSignUp.firstName;
            data['last_name'] = this.completeSignUp.lastName;
            data['street'] = this.completeSignUp.address;
            data['company'] = this.completeSignUp.company;
            data['voucher'] = this.completeSignUp.voucher;
            data['zipcode'] = this.completeSignUp.zip;
            data['city'] = this.completeSignUp.city;
            data['phone'] = this.completeSignUp.phone;
            data['mail_delivery_first_name'] = this.completeSignUp.mailDeliveryFirstName;
            data['mail_delivery_last_name'] = this.completeSignUp.mailDeliveryLastName;
            data['mail_delivery_street'] = this.completeSignUp.mailDeliveryAddress;
            data['mail_delivery_company'] = this.completeSignUp.mailDeliveryCompany;
            data['mail_delivery_zipcode'] = this.completeSignUp.mailDeliveryZip;
            data['mail_delivery_city'] = this.completeSignUp.mailDeliveryCity;
        }


        if (this.billingOptions) {
            if (this.billingOptions.card && this.billingOptions.card.token) {
                data['token'] = this.billingOptions.card.token;
            } else {
                data['token'] = this.billingOptions.bank.token;
            }
        }

        let userLang = navigator.language.split('-')[0];
        userLang = /(de|en)/gi.test(userLang) ? userLang : 'en';
        data['locale'] = userLang;
        // for now always DE
        data['locale'] = 'de';

        data = {
            onboarding: data
        };

        return data;
    }

    signUpFreeAccount(data: any, used_referral:string): Observable<any> {
        let url = `${this.baseUrl}/registrations`;
        data = {
            registration: {
                email: data.emails.email,
                email_confirmation: data.emails.emailConfirmation,
                phone: data.phone,
                password: data.passwords.password,
                password_confirmation: data.passwords.passwordConfirmation,
                accepted_tos: true,
                accepted_privacy: true,
                is_company: false,
                used_referral: used_referral
            }
        };
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        let headers = new Headers({ 'Accept': 'application/json; version=2' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, data, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    signUpFreeBusinessAccount(data: any): Observable<any> {
        let url = `${this.baseUrl}/registrations`;
        data = {
            registration: {
                email: data.emails.email,
                email_confirmation: data.emails.emailConfirmation,
                phone: data.phone,
                company: data.company,
                password: data.passwords.password,
                is_company: true,
                password_confirmation: data.passwords.passwordConfirmation,
                accepted_tos: true,
                accepted_privacy: true
            }
        };
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        let headers = new Headers({ 'Accept': 'application/json; version=2' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, data, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    signUp(): Observable<any> {
        let url = `${this.baseUrl}/onboardings`;
        return this.signUpWithData(this.mapData(), url);
    }

    signUpWithData(data: any, url: string): Observable<any> {

        // let headers = new Headers({ 'Content-Type': 'application/json' });
        let headers = new Headers({ 'Accept': 'application/json; version=2' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(url, data, options)
            .map(this.extractData)
            .catch(this.handleError);
    }

    fullSignup(signUpForm: FormGroup) {
        let url = `${this.baseUrl}/full_registration`;
        let data = this.getPaymentDataObject(signUpForm);
        return this.signUpWithData({ registration: data }, url);
    }
    // return the stripe payment token
    // for bank or credit card
    getStripePaymentToken(paymentMethodForm): string {
        let method: string = paymentMethodForm.get('type').value;
        switch (method) {
            case 'bank': {
                return paymentMethodForm.controls.bank.get("token").value;
            }
            case 'card': {
                return paymentMethodForm.controls.card.get("token").value;
            }
            default:
                throw new Error("Unknow payment method");
        }
    }

    companySignup(signUpForm: FormGroup) {
        let url = `${this.baseUrl}/full_registration`;
        let data = { ...this.getPaymentDataObject(signUpForm), ...{ "is_company": true } };

        return this.signUpWithData({ registration: data }, url);
    }

    getPaymentDataObject(signUpForm: FormGroup) {
        let userForm = (<any>signUpForm).controls.userForm;
        let addressForm = (<any>signUpForm).controls.addressForm;
        let paymentMethodForm = (<any>signUpForm).controls.paymentMethod;

        let token = this.getStripePaymentToken(paymentMethodForm);

        let data = {
            "first_name": addressForm.get('firstName').value,
            "last_name": addressForm.get('lastName').value,
            "street": addressForm.get("address").value,
            "company": addressForm.get("company").value,
            "zipcode": addressForm.get("zip").value,
            "city": addressForm.get("city").value,
            "phone": addressForm.get("phone").value,
            "voucher": paymentMethodForm.get("voucher").value,
            "email": userForm.controls.emails.get("email").value,
            "email_confirmation": userForm.controls.emails.get("emailConfirmation").value,
            "password": userForm.controls.passwords.get("password").value,
            "password_confirmation": userForm.controls.passwords.get("passwordConfirmation").value,
            "accepted_privacy": true,
            "accepted_tos": true,
            "stripe_plan_id": paymentMethodForm.get("plan").value,
            "plan_id": paymentMethodForm.get("plan_id").value,
            "token": token
        };
        return data;
    }

    private extractData(res: Response) {
        let body = res.json();

        return body || {};
    }

    private handleError(error: Response | any) {
        let err: string[] | string | any;
        let errMsg: string;

        if (error instanceof Response) {
            const body = error.json() || 'Unknown error';
            if (body && body.errors) {
                err = body.errors.full_messages || JSON.stringify(body);
            } else {
                err = ['An unknown error occurred. Please try again later.'];
            }
            let errors: string;
            if (err.isArray) {
                errors = err.join('\n');
            }
            errMsg = `${error.status} - ${error.statusText || ''}\n${errors || err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(err);
    }

    initCardFromForm(cardForm: FormGroup): Card {
        return {
            number: cardForm.value.creditCardNumber,
            cvc: cardForm.value.cvc,
            expiryMonth: cardForm.value.expiryMonth,
            expiryYear: cardForm.value.expiryYear
        };

    }
    initBanAccountFromForm(bankForm: FormGroup, address: Address): BankAccount {
        return {
            accountNumber: bankForm.value.accountNumber,
            accountHolderName: bankForm.value.accountHolderName,
            address: address
        };
    }

    // fetches a payment token for the user
    public getToken(method: string, paymentTypeForm: FormGroup, addresData?: Address) {
        this.setupStripe();
        if (method == 'card') {
            return this.getTokenCreditCard(this.initCardFromForm(paymentTypeForm));
        } else {
            return this.getTokenBankAccount(this.initBanAccountFromForm(paymentTypeForm, addresData));
        }
    }

    // setup stripe with the correct key
    private setupStripe() {
        (<any>window).Stripe.setPublishableKey(ENV.stripeKey);
        return true;
    }
    // returns a token for the user's entered bank account data.
    private getTokenBankAccount(bankAccount: BankAccount) {
        let accountNumber = bankAccount.accountNumber;
        accountNumber = accountNumber.replace(/\s/g,''); // remove spaces
        return new Promise<string>((resolve, reject) => {
            (<any>window).Stripe.source.create({
                type: 'sepa_debit',
                sepa_debit: {
                    iban: accountNumber
                },
                currency: 'EUR',
                owner: {
                    name: bankAccount.accountHolderName,
                    address: {
                        line1: bankAccount.address.address,
                        city: bankAccount.address.city,
                        postal_code: bankAccount.address.zip,
                        country: 'DE'
                    },
                },
            }, (status: number, response: any) => {
                if (status === 200) {
                    resolve(response.id);
                } else {
                    reject(this.handleStripeError(response.error.message));
                }
            });
        });
    }

    // returns a token for the user's entered credit card.
    private getTokenCreditCard(card: Card) {
        return new Promise<string>((resolve, reject) => {
            (<any>window).Stripe.card.createToken({
                number: card.number,
                exp_month: card.expiryMonth,
                exp_year: card.expiryYear,
                cvc: card.cvc
            }, (status: number, response: any) => {
                if (status === 200) {
                    resolve(response.id);
                } else {
                    reject(this.handleStripeError(response.error.message));
                }
            });
        });
    }

    private handleStripeError(errorMessage: string) {
        if (errorMessage.indexOf('sepa_debit[iban]') >= 0) {
            // Invalid IBAN: "The payment method `sepa_debit`
            // requires the parameter: sepa_debit[iban]."
            return 'signUp.stripeError.invalidIban';
        } else if (errorMessage.indexOf('owner[name]') >= 0) {
            // Invalid owner: "You passed an empty string for 'owner[name]'.
            // We assume empty values are an attempt to unset a parameter;
            // however 'owner[name]' cannot be unset. You should
            // remove 'owner[name]' from your request or supply a non-empty value."
            return 'signUp.stripeError.invalidOwner';
        } else {
            // return the message as it is
            return errorMessage;
        }
    }

}