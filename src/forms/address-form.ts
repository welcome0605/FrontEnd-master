
import { FormBuilder, Validators } from '@angular/forms';

export class AddressForm {

    formGroup: any;
    constructor(private formBuilder: FormBuilder) {
        this.initModel();
    }
    private initModel() {
        this.formGroup = this.formBuilder.group(
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
                company: [this.fetchValue('company')],
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
                    [
                      Validators.required,
                      Validators.minLength(5),
                      Validators.maxLength(55)
                    ]
                ]
            });
    }
    private fetchValue(field: string): string {
        return "";
    }
}