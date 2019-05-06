import { FormBuilder, Validators, FormGroup } from '@angular/forms';

export class UserForm {
    formGroup: FormGroup;
    constructor(private formBuilder: FormBuilder) {
        this.initModel();
    }

    private initModel() {
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        this.formGroup =  this.formBuilder.group({
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
    
    // validator for password matching
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
}