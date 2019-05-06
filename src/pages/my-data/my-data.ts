import { Component } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../models/user';
import { BillingStatement } from '../../models/billing-statement';
import { UserService } from '../../providers/user-service';
import { ProcessErrorsService } from '../../providers/process-errors-service';
import { DisplayMessagesService } from '../../providers/display-messages-service';
import { BillingService } from '../../providers/billing-service';
import { ENV } from '@app/env';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { HttpService } from '../../providers/http-service';
import * as utils from "../../utils/utils";
import { AnalyticsService } from '../../providers/analytics-service';
import { ZendeskService } from "../../providers/zendesk-service";
import { Login } from '../login/login';



@Component({
  selector: 'page-my-data',
  templateUrl: 'my-data.html'
})
export class MyData {
  form: FormGroup;
  user: User = new User();
  statement: BillingStatement;
  loadingData: boolean = true;
  total: number = null;
  errors: any = [];
  private checkerUrl = `${ENV.adminUrl}/`;
  public message = '';
  public voucherCode = '';
  public registrationState = this.userService.getCurrentUser();
  public postfach;
  public bulkscan;
  public accounts: boolean = false;
  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private userService: UserService,
    public formBuilder: FormBuilder,
    private translateService: TranslateService,
    private processErrorsService: ProcessErrorsService,
    private displayMessagesService: DisplayMessagesService,
    private http: HttpService,
    private analyticsService: AnalyticsService,
    private toastCtrl: ToastController,
    public zendeskService: ZendeskService
  ) {
    this.initForm();
  }

  ionViewDidEnter() {
    if(!localStorage.getItem('token')) {
      this.navCtrl.setRoot(Login);
    } else {
      this.userService.getCurrentUser().subscribe(
        user => {
          this.user = user;
          let general_data = {
            'event':'page',
            'p_path':'/my-data',
            'p_title':'My Data',
            'user': user.id
          };
            if (user['accounts']){
                this.postfach = user['accounts']['postfach'];
                this.bulkscan = user['accounts']['bulkscan'];
                this.accounts = true;
            }

          this.analyticsService.trackCustomEvent(general_data);
        },
        err => {
          console.log(this.translateService.instant('myData.loggedOut'));
        });
    }
  }

  initForm() {




    this.form = this.formBuilder.group({
      mailDeliveryFirstName: [
        {
          value: '',
          disabled: false
        },
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(16),
          Validators.pattern(/[a-zA-Z]+/)
        ]
      ],
      mailDeliveryLastName: [
        {
          value: '',
          disabled: false
        },
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(16),
          Validators.pattern(/[a-zA-Z]+/)
        ]
      ],
      mailDeliveryAddress: [
        {
          value: '',
          disabled: false
        },
        Validators.required
      ],
      mailDeliveryHouseNumber: [
        {
          value: '',
          disabled: false
        },
        Validators.required
      ],
      mailDeliveryCompany: [{
        value: '',
        disabled: false
      }],
      mailDeliveryAdresszusatz: [{
        value: '',
        disabled: false
      }],
      mailDeliveryZip: [
        {
          value: '',
          disabled: false
        },
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern(/[0-9]+/)
        ]
      ],
      mailDeliveryCity: [
        {
          value: '',
          disabled: false
        },
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/[a-zA-Z]+/)
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
        ]
      ],
      emailConfirmation: '',
      password: '',
      phone: { value: '', disabled: false },
      passwordConfirmation: '',
      receiveNotificationsViaPush: [
        true,
        Validators.required
      ],
      receiveNotificationsViaEmail: [
        true,
        Validators.required
      ],
      receiveNewsletter: [
        true,
        Validators.required
      ],
      enableWidget:[
        true
      ],
      voucher: [this.voucherCode]
    });
  }


  public updateUser(event) {
    this.errors = [];
    let updateUser: User = this.convertFormToUser();
    this.userService.update(updateUser).subscribe(
      user => {
        this.user = user;
        this.translateService
          .get('myData.accountUpdated')
          .subscribe(value => this.displayMessagesService.displayMessages([value]));
      },
      err => {
        this.processErrorsService.processErrors(err, this.errors);
      });
  }

  private convertFormToUser(): User {
    let user = new User();
    user.email                        = this.form.get('email').value;
    user.emailConfirmation            = this.form.get('emailConfirmation').value;
    user.mailDeliveryStreet           = this.form.get('mailDeliveryAddress').value;
    user.mailDeliveryHouseNumber      = this.form.get('mailDeliveryHouseNumber').value;
    user.mailDeliveryCity             = this.form.get('mailDeliveryCity').value;
    user.mailDeliveryCompany          = this.form.get('mailDeliveryCompany').value;
    user.mailDeliveryAdresszusatz     = this.form.get('mailDeliveryAdresszusatz').value;
    user.mailDeliveryFirstName        = this.form.get('mailDeliveryFirstName').value;
    user.mailDeliveryLastName         = this.form.get('mailDeliveryLastName').value;
    user.mailDeliveryZipcode          = this.form.get('mailDeliveryZip').value;
    user.phone                        = this.form.get('phone').value;
    user.voucher                      = this.form.get('voucher').value;
    user.password                     = this.form.get('password').value;
    user.passwordConfirmation         = this.form.get('passwordConfirmation').value;
    user.receiveNewsletter            = this.form.get('receiveNewsletter').value;
    user.receiveNotificationsViaEmail = this.form.get('receiveNotificationsViaEmail').value;
    user.receiveNotificationsViaPush  = this.form.get('receiveNotificationsViaPush').value;
    user.enableWidget                 = this.form.get('enableWidget').value;
    console.log('Widget toggle...');
    console.log(this.form.get('enableWidget').value);
    return user;
  }

  public logout() {
    this.userService.logout();
    this.navCtrl.setRoot(Login);
  }

  public confirmDelete() {
    let translate = ['myData.confirmAlert.title', 'myData.confirmAlert.message', 'general.understood'];

    this.translateService
      .get(translate)
      .subscribe(
        (translations) => {
          let title = translations['myData.confirmAlert.title'];
          let message = translations['myData.confirmAlert.message'];
          let understood = translations['general.understood'];
          let alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [understood]
          });

          alert.present();
        }
      );
  }
  
  checkVoucher() {
    let voucher = this.form.get("voucher").value;

    if (voucher.length > 6) {
      let url = this.checkerUrl + 'check_voucher/' + voucher;

      this.http.get(url)
        .map(response => {
          let resp = response.json();

          switch (resp.status) {
            case 'invalid':
              this.message = 'Ungültiger Code!';
              break;
            case 'good':
              this.message = 'Gültiger Code!';
              break;
            case 'used':
              this.message = 'Der Code wurde bereits benutzt.';
              break;
          }

          if (this.message.length > 1) {
            utils.presentToast(this.toastCtrl, this.message);
            this.message = '';
          }

          return resp;
        })
        .catch((response) => Observable.throw(response.json()))
        .subscribe();
    }
  }
}
