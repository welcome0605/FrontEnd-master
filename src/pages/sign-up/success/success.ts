import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Inbox } from '../../documents/inbox/inbox';
import { TokenService } from '../../../providers/token-service';
import { UserService } from "../../../providers/user-service";
import { AnalyticsService } from '../../../providers/analytics-service';

@Component({
  selector: 'page-success',
  templateUrl: 'success.html'
})
export class Success {
  userLoaderSubscription: any = null;

  constructor(
    private analyticsService: AnalyticsService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private tokenService: TokenService,
    private userService: UserService
  ) {
    let token:string =  this.navParams.get('token');

    if(token){
      this.loginUserWithToken(token);
    }
  }

  loginUserWithToken(token:string){
      this.tokenService.set(token);
      this.userLoaderSubscription = this.userService.load().subscribe(res => {
        // user loaded
      });
  }

  ionViewWillLeave() {
    if(this.userLoaderSubscription){
      // make sure we unsuscribe properly
      this.userLoaderSubscription.unsusbcribe();
    }
  }

  onRedirect() {
    let user = this.navParams.get('user');
    this.tokenService.set(user.token);
    this.navCtrl.setRoot(Inbox, {
      registrationSuccess: true
    });
  }
}
