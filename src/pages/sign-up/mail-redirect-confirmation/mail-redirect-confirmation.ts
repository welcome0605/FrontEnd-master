
import { Component } from '@angular/core';
import { App, NavController, NavParams} from 'ionic-angular';
import { Inbox} from '../../documents/inbox/inbox';
import { Login} from '../../login/login';
import { TokenService} from '../../../providers/token-service';

@Component({
    selector: 'mail-redirect-confirmation-page',
    templateUrl: 'mail-redirect-confirmation-page.html'
})
export class MailRedirectConfirmationPage {

    token: string = null;
    constructor(
        public navController: NavController, 
        public app: App,
        public navParams: NavParams,
        private tokenService: TokenService) {

        this.token = this.navParams.get('token');
        if(this.tokenService.get()){
            // already logged in
          setTimeout(() => {
            this.app.getRootNav().setRoot(Inbox);
          }, 1000);
          return;
        }
        if(this.token){
          setTimeout(() => {
            this.app.getRootNav().setRoot(Inbox);
            this.tokenService.set(this.token);
          }, 1000);
          return;
        }else{
          setTimeout(() => {
            this.app.getRootNav().setRoot(Login);
          }, 1000);
        }
    }


}