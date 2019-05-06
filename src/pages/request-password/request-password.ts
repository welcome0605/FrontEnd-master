import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { ForgotPasswordService } from '../../providers/forgot-password-service';

@Component({
  selector: 'page-password',
  templateUrl: 'request-password.html',
  providers: [ForgotPasswordService]
})

export class RequestPassword {
  passwordRequested: boolean = false;

  public passwordForm = this.fb.group({
    email: ["", Validators.required]
  });

  constructor(
    public nav: NavController,
    public fb: FormBuilder,
    public forgotPasswordService: ForgotPasswordService,
  ) {
  }

  public request = (event) => {
    let opts = {
      password_reset: {
        email: this.passwordForm.value.email
      }
    };
    this.forgotPasswordService.request(opts)
      .subscribe(
        data => {
        },
        err => {
        }
      );
    this.passwordRequested = true;
  }

  public goBack = () => {
    this.nav.pop();
  }
}
