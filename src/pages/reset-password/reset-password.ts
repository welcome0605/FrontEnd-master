import { Component } from '@angular/core';

import { NavController, NavParams, ToastController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { Login } from '../login/login';

import { ResetPasswordService } from '../../providers/reset-password-service';
import * as  utils from '../../utils/utils';

@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
  providers: [ResetPasswordService]
})

export class ResetPassword {
  private token: number | any = this.params.get('token');
  private form: FormGroup = this.fb.group({
    password: [
      null,
      Validators.compose([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ])
    ]
  });
  public errors: string[] = [];

  constructor(
    public nav: NavController,
    public params: NavParams,
    public fb: FormBuilder,
    private resetPasswordService: ResetPasswordService,
    private translateService: TranslateService,
    private toastCtrl: ToastController
  ) { }

  public reset(event: any) {
    if (!event) { return; }
    let data = {
      password_reset: {
        password: this.form.value.password,
        reset_password_token: this.token
      }
    };

    this.resetPasswordService
      .reset(data)
      .subscribe(
      user => {
        this.goToLogin(user);
        let message = this.translateService
          .instant('password_resets.please_login_again');
        utils.presentToast(this.toastCtrl, message);
      },
      error => {
        if (error.isArray) {
          this.errors = <string[]>error;
        } else {
          this.errors.length = null;
          this.errors.push(<string>error);
        }
      }
      );
  }

  public goToLogin(user: any) {
    this.nav.setRoot(Login, user);
  }
}
