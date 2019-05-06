import { Component, ViewChild } from '@angular/core';
import { App, Platform, AlertController, NavController, ModalCmp, ToastCmp, PopoverCmp, AlertCmp, ActionSheetCmp, ModalController } from 'ionic-angular';
import { StatusBar, Splashscreen, Badge } from 'ionic-native';

import { DocumentService } from '../providers/document-service';
import { UserService } from '../providers/user-service';
import { TranslateService } from '@ngx-translate/core';

import { Inbox } from '../pages/documents';
import { Login } from '../pages/login/login';
import { MyData } from '../pages/my-data/my-data';

import { TokenService } from '../providers/token-service';
import { ENV } from '@app/env';
import { CompleteSignupPromptPage } from "../pages/complete-signup-prompt/complete-signup-prompt";
import { Observable } from "rxjs/Observable";
import { ZendeskService} from '../providers/zendesk-service';
import "rxjs/add/observable/of";
import { Push, PushObject, PushOptions } from '@ionic-native/push';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('nav') nav: NavController;
  @ViewChild('menuScrollContainer') menuScrollContainer;
  rootPage: any;
  public showMenu: boolean;
  private showCompleteSignupBanner: Boolean = false;
  private showEmailConfirmationBanner: Boolean = false;
  private token: any;
  public language: String = 'en';
  public srcWidth: any;
  private BANNER_PAGES = [Inbox, MyData, ModalCmp, ToastCmp, PopoverCmp, AlertCmp, ActionSheetCmp];
  public viewsNames: string[] = [
    'Login',
    'FreeAccount',
    'CompleteSignUp',
    'BillingOptions',
    'SignUpSuccess',
    'FullSignupPage',
    'Success'
  ];
  public currentView: string;

  constructor(
    public app: App,
    public platform: Platform,
    public alertCtrl: AlertController,
    translate: TranslateService,
    private documentService: DocumentService,
    private userService: UserService,
    private tokenService: TokenService,
    private modalCtrl: ModalController,
    private zendeskService: ZendeskService,
    private push: Push

  ) {

    console.log("globals", ENV.adminUrl);

    this.startWatchingZendeskStatus();
    // Auto-Detect User-Language
    // var userLang = (<any>navigator).languages && (<any>navigator).languages.length ? (<any>navigator).languages[0].split('-')[0] : (<any>navigator).language.split('-')[0];
    // userLang = /(de|en)/gi.test(userLang) ? userLang : 'en';
    let userLang = ENV.locale;
    this.language = userLang;
    // TODO: please make this configurable via a setting in the environment.
    translate.setDefaultLang(userLang);
    translate.use(userLang);

    this.initializeApp();
    this.token = this.tokenService.get();
    if (this.token) {
      this.rootPage = Inbox;
    } else {
      this.rootPage = Login;
    }
    platform.ready().then((readySource) => {
       this.srcWidth = platform.width();

        let options: PushOptions = {
            ios: {
                alert: 'true',
                badge: true,
                sound: 'true'
            },
            windows: {},
            browser: {
                pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            }
        };

        const pushObject: PushObject = this.push.init(options);


        function registerCallBack(registration){
        }
        pushObject.on('registration').subscribe((registration: any) => registerCallBack(registration));


    });
  }

  onResize(event) {

        const innerWidth = event.target.innerWidth;
        this.srcWidth = innerWidth;
    }
  srceenWidth(){
    return this.srcWidth;
  }
  menuOpened() {
    // natural behavior for iOS. Not for other platforms.
    if (this.platform.is('ios')) {
      // StatusBar.hide();
    }
  }

  menuClosed() {
    // natural behavior for iOS. Not for other platforms.
    if (this.platform.is('ios')) {
      // StatusBar.show();
    }
  }

  initializeApp() {
    console.log("app initialized", this);
    this.platform.ready().then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
      let inBrowser = (this.platform.is('core') == true || this.platform.is('mobileweb') == true);
      if (!inBrowser) {
        // we are in iOS or Android
        Badge.clear();
      }

    });
  }

  ngOnInit() {
    console.log("app opened", this);
    this.tokenService
      .subscribe(
      token => {
        if (token) {
          this.showMenu = true;
            this.userService.load();
        } else {
          this.showMenu = false;
          this.documentService.reset();
        }
      },
      e => console.log(e)
      );
    this.app
      .viewWillEnter
      .subscribe(
      view => {

        if (this.menuScrollContainer) {
          // make sure the ion menu
          // is scrolled to the top
          // after changing the view
          this.menuScrollContainer.scrollToTop(0);
        }
        this.currentView = view.name;

        let match = this.viewsNames
          .some(element => element == view.name);
        if (match) {
          this.showMenu = false;
        } else if (view.name == 'Inbox') {
          this.showMenu = true;
        }
        this.updateBannerVisibility(view);

      },
      error => console.log(error)
      );
  }


  public completeSignupTapped(event) {
    let completeSignupPage = this.modalCtrl.create(CompleteSignupPromptPage);
    completeSignupPage.present();
    // mark so we don't show it twice
      this.userService.showPromptCompleteSignupShown = true;
  }
  // checks if the banner at the top should be shown or not
  updateBannerVisibility(view) {
    if (view.component == AlertCmp) {
      //showing a modal, just keep the previos banner state
      return;
    }
    let allowedPageForBanner = this.BANNER_PAGES.indexOf(view.component) != -1;
    console.log("current view", this.currentView);
    if (allowedPageForBanner) {
      // check if we should show the complete signup banner;
      this.userService.getCurrentUser().subscribe(
        user => {
          console.log("fetched the user", user);
          this.showCompleteSignupBanner = user.canCompleteSignup;
        }, err => {
          console.log("error fetching user", err);
        }
      );
      // check if we should show the pending email confirmation banner
      this.userService.getCurrentUser().subscribe(
        user => {
          console.log("fetched the user", user);
          this.showEmailConfirmationBanner = user.pendingEmailConfirmation;
        }, err => {
          console.log("error fetching user", err);
        }
      );
    } else {
      this.showCompleteSignupBanner = false;
      this.showEmailConfirmationBanner = false;
    }
  }


    private getZendeskStatusStream() : Observable<boolean> {

        return( Observable.of( true, false ) );

    }

    private startWatchingZendeskStatus() {

        this.zendeskService.show();

        this.getZendeskStatusStream().subscribe(
            ( value: boolean ) => {

                console.log( 'Zendesk status value changed to [${ value }].' );

                value
                    ? this.zendeskService.show()
                    : this.zendeskService.hide()
                ;

            }
        );

    }

}
