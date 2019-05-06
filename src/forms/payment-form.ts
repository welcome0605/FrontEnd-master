

import { FormBuilder, Validators, FormGroup, FormControl, AbstractControl, Validator } from '@angular/forms';

import { OnChanges, Provider, SimpleChanges } from '@angular/core';

export class PaymentForm {

    formGroup: FormGroup = null;
    public PAYMENT_METHOD_TYPE = {
        BANK: 'bank',
        CARD: 'card'
    };

    public cardCtrl: FormGroup;
    public bankCtrl: FormGroup;

    constructor(private formBuilder: FormBuilder,
                public stripePlan: string,
                public plan_id: string,
                public voucherCode = '') {

        this.initModel();
        // listen for changes of payment type and set validators
        this.subscribePaymentTypeChanges();
        // set bank by default
        this.setPaymentMethodType(this.PAYMENT_METHOD_TYPE.BANK);
    }

    private initModel() {
        // initialize payment method form group

        this.formGroup = this.formBuilder.group({
            voucher: [this.voucherCode],
            type: [this.PAYMENT_METHOD_TYPE.BANK],
            plan: [this.stripePlan, Validators.required],
            card: this.formBuilder.group(this.initPaymentMethodCardModel(this)),
            bank: this.formBuilder.group(this.initPaymentMethodBankModel(this)),
            plan_id: this.plan_id
        });

        this.cardCtrl = (<any>this.formGroup).controls.card;
        this.bankCtrl = (<any>this.formGroup).controls.bank;
    }
    public getMethod(): string {
        return this.formGroup.get("type").value;
    }

    public setToken(token: string) {
        let method = this.getMethod();

        if (method == "card") {
            this.cardCtrl.patchValue({ token: token });
        } else {
            this.bankCtrl.patchValue({ token: token });
        }
    }

    setPaymentMethodType(type: string) {
        // type should be either 'bank' or 'card'
        // update payment method type value
        const ctrl: FormControl = (<any>this.formGroup).controls.type;
        ctrl.setValue(type);
    }

    initPaymentMethodBankModel(self) {
        return {
            accountHolderName: [
                this.fetchValue('accountHolderName'),
                Validators.required
            ],
            accountNumber: [
                this.fetchValue('accountNumber'),
                (form:FormGroup) => this.isValidIban(form)
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
            token: this.fetchValue('token')
        };

    }
    private fetchValue(field: string): string {
        return "";
    }


    subscribePaymentTypeChanges() {
        // listen for changes in the payment type 
        // and set update the validators properly

        // initialize value changes stream
        const changes$ = this.formGroup.controls.type.valueChanges;
        // subscribe to the stream
        changes$.subscribe(paymentMethodType => {
            if (paymentMethodType === this.PAYMENT_METHOD_TYPE.BANK) {

                // set back validators for bank control
                Object.keys(this.bankCtrl.controls).forEach(key => {
                    let form = this.initPaymentMethodBankModel(this)[key];
                    if (form && Object.keys(form).length > 1) {
                        let validators = form[1];
                        this.bankCtrl.controls[key].setValidators(validators);
                        this.bankCtrl.controls[key].updateValueAndValidity();

                    }
                });
                // remove validators for card control
                Object.keys(this.cardCtrl.controls).forEach(key => {
                    this.cardCtrl.controls[key].setValidators(null);
                    this.cardCtrl.controls[key].updateValueAndValidity();
                });
            }

            if (paymentMethodType === this.PAYMENT_METHOD_TYPE.CARD) {
                // remove validators for bank form control
                Object.keys(this.bankCtrl.controls).forEach(key => {
                    this.bankCtrl.controls[key].setValidators(null);
                    this.bankCtrl.controls[key].updateValueAndValidity();
                });
                // set back validators for card control
                Object.keys(this.cardCtrl.controls).forEach(key => {
                    let form = this.initPaymentMethodCardModel(this)[key];
                    if (form && Object.keys(form).length > 1) { // check if has validators
                        let validators = form[1];
                        this.cardCtrl.controls[key].setValidators(validators);
                        this.cardCtrl.controls[key].updateValueAndValidity();
                    }
                });
            }
        });
    }

    

    isValidIban(ibanControl: AbstractControl): {
        [key: string]: any;
    } {
        const value = ibanControl.value;
        const aCode = 'A'.charCodeAt(0);
        const zCode = 'Z'.charCodeAt(0);
        const IBAN_LENGTH = 22;

        let mod97 = (num) => {
            let currNum = Number.parseInt(num.splice(0, 9).join(''));
            let rem = currNum % 97;
            while (num.length > 0) {
                let newNumber = rem.toString().split('').concat(num.splice(0, 7)).join('');
                rem = Number.parseInt(newNumber) % 97;
            }
            return rem;
        };
        if (value == null || value.length === 0) {
            return { 'required': true };
        }
        // replace all  non alphanumeric characters
        let iban: string = value.replace(/[^A-Za-z0-9]/g, "");
        iban = iban.toUpperCase();
        
        if (iban.length !== IBAN_LENGTH) {
            return { "requiredLength": IBAN_LENGTH, "currentLength": iban.length };
        }
        // format DE 2n 18n
        const ibanRegEx: RegExp = /^DE(\d\d)(\d{4})(\d{4})(\d{10})$/;
        if (!ibanRegEx.test(iban)) {
            return { "invalid": "regex not matched" };
        }
        let result: RegExpExecArray = ibanRegEx.exec(iban);
        let checkCode:string = result[1];
        let bankCode = result[2];
        let sucursalCode = result[3];
        let account = result[4];
        let codeCharacters:string = bankCode + sucursalCode + account  + "DE";
        codeCharacters = codeCharacters.split('').map((character) => {
            
            let charCode = character.charCodeAt(0);

            if (charCode >= aCode && charCode <= zCode) {
                // is alphanumeric, so convert to number
                let number = charCode - aCode + 10;
                return number.toString();
            }
            return character;
        }).join('');

        let codeNumber:string[] = (codeCharacters + checkCode).split('');
        let remainder = mod97(codeNumber);

        return (remainder == 1) ? null : {"invalid": "checksum invalid"};
    }

           
}


export class IbanValidator implements Validator, OnChanges {
    private _validator;
    private _onChange;
    pattern: string;

    ngOnChanges(changes: SimpleChanges): void {

    }
    validate(c: AbstractControl): {
        [key: string]: any;
    } {

        return [];
    }
    registerOnValidatorChange(fn: () => void): void {

    }
    private _createValidator() {

    }
}