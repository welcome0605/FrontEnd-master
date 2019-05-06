import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Login } from '../../login/login';

@Component({
  selector: 'page-step-5',
  templateUrl: 'step-5.html'
})
export class SignupStep5 {

  public goToLogin: any = Login;

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {}

}
