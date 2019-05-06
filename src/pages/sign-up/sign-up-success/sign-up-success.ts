import { Component } from '@angular/core';
import { App, NavController, NavParams } from 'ionic-angular';
import { Login } from '../../login/login';
import { TokenService } from "../../../providers/token-service";
import { UserService } from "../../../providers/user-service";

@Component({
  selector: 'page-sign-up-success',
  templateUrl: 'sign-up-success.html'
})
export class SignUpSuccess {

  
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private tokenService: TokenService,
    private userService: UserService, 
    public appCtrl: App) {

  }



  

  onLogin() {
    this.navCtrl.setRoot(Login);
  }
}
