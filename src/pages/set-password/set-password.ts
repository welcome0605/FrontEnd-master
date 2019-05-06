import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';

import { Login } from '../login/login';


@Component({
  selector: 'page-password',
  templateUrl: 'set-password.html',
  providers: []
})

export class SetPassword {
  passwordSaved: boolean = false;

  public passwordForm = this.fb.group({
    password: ["test12345", Validators.required],
    repeatPassword: ["test12345", Validators.required]
  });

  public toast: any = null;

  constructor(
    public nav: NavController,
    public fb: FormBuilder
  ) {
  }

  public request = (event) => {
    /* Add Logic to request new Password */

    this.passwordSaved = true;
  }

  public goToLogin = () => {
    this.nav.setRoot(Login);
  }
}
