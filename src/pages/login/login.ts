import { Component } from '@angular/core';

import { NavController, NavParams,
   ToastController,
   LoadingController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

import { Inbox } from '../documents';

import { LoginService } from '../../providers/login-service';
import { TokenService } from '../../providers/token-service';
import { FreeAccount } from '../sign-up/free-account/free-account';
import { RequestPassword } from '../request-password/request-password';
import { UserService } from "../../providers/user-service";
import * as utils from '../../utils/utils';
import { BannerService } from "../../providers/banner-service";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [
    LoginService
  ]
})

export class Login {
  pushPage: any = null;
  forgetPassword: any = null;
  session: any = null;
  errorMessage: boolean = false;

  public loginForm = this.fb.group({
    email: ["", Validators.required],
    password: ["", Validators.required]
  });

  constructor(
    public nav: NavController,
    public fb: FormBuilder,
    public loginService: LoginService,
    public toastCtrl: ToastController,
    private translateService: TranslateService,
    private storage: Storage,
    private tokenService: TokenService,
    private userService: UserService,
    private params: NavParams,
    private loadingCtrl: LoadingController,
    public bannerService: BannerService,
  ) {
    this.pushPage = FreeAccount;
    this.forgetPassword = RequestPassword;
  }













  public login = (event) => {
    console.log(event);
    let loadingCtrlOptions = {
      content: this.translateService.instant('login.wait')
    };
    let loader = this.loadingCtrl.create(loadingCtrlOptions);
    loader.present();

    this.loginService.login({email: this.loginForm.value.email, password: this.loginForm.value.password})
      .subscribe(
        session => {
          this.tokenService.set(session['token']);
          // load the user first so we
          // know the authentication state
          // and can show the banner properly
          this.userService.load().subscribe( user =>{
            if (user.registrationState !== "complete"){
                  this.bannerService.setHide(true);
            } else {
                this.bannerService.setHide(false);
            }
            this.nav.setRoot(Inbox);
              loader.dismiss();
          }, error =>{
            loader.dismiss();
            console.log("failed to load user");
          });
        },
        err => {
          loader.dismiss();
          if (err.status == 403) {

            utils.presentToast(this.toastCtrl,"Bitte bestätige Deine Emailadresse");

          } else {
            this.translateService.get('login.credentialsDontMatch').subscribe(
              value => {
                let message = value;
                utils.presentToast(this.toastCtrl, message);
              }
            );
          }
        }
      );
  }













  ionViewDidEnter() {
    if(this.params.get('message') == 'registration_success') {
      this.translateService.get('login.accountActivated').subscribe(
        value => {
          let message = value;
         utils.presentToast(this.toastCtrl, message);
        }
      );
    }
  }

  showLoginForm() {
    let loginForm = document.getElementById("login-form"),
        loginInfo = document.getElementById("login-info"),
        loginButton = document.getElementById("login-button");

    loginButton.style.display = 'none';
    loginInfo.style.display = 'none';
    loginForm.style.display = 'block';
  }

  ionViewCanEnter(){
    let token = this.tokenService.get();

    if(token != null && token.length == 0){
      // the user is logged in
      // so this view can't be entered
      return false;
    }
    return true;
  }
}
