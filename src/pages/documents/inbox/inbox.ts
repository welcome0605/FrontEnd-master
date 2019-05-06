declare var cordova: any;
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, Platform, ActionSheetController, NavParams, ToastController, LoadingController, ModalController, AlertController, Events, Searchbar, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { Document } from '../../../models/document';
import { DocumentService } from '../../../providers/document-service';
import { FolderService } from '../../../providers/folder-service';
import { UserService } from '../../../providers/user-service';
import { ProcessErrorsService } from '../../../providers/process-errors-service';
import { DisplayMessagesService } from '../../../providers/display-messages-service';
import { AnalyticsService } from '../../../providers/analytics-service';

import { EditFolderModal } from '../../../components/edit-folder-modal/edit-folder-modal';
import { OnboardingPage } from '../../onboarding/onboarding';
import { CompleteSignupPromptPage } from '../../complete-signup-prompt/complete-signup-prompt';
import { CompleteSignUp } from '../../sign-up/complete-sign-up/complete-sign-up';
import { ZendeskService } from '../../../providers/zendesk-service';
import { ReferralPrompt } from '../../referral-prompt/referral-prompt';
import { BannerService} from "../../../providers/banner-service";
import * as moment from 'moment';
import * as utils from '../../../utils/utils';

import * as _ from 'lodash';
import 'rxjs/add/operator/map';

@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html'
})
export class Inbox implements AfterViewInit{
  public isSearchMode: boolean   = false;
  private filter: any;
  private type: string;
  private title: string;
  private customFolder: any      = null;
  private noContentIcon: string  = 'md-mail-open';
  private noContentMessage: string;
  public dataLoad: any           = true;
  public queryString: string     = "";
  public searchQuery: string     = null;
  private documentsSub: any;
  public documents: Document[]   = [];
  public refresher: any          = null;
  public currentUser: any        = null;
  public canSendLetters: boolean = false;
  public standart_folders: string[] = new Array();
  public srcWidth: any;
  public hide:boolean = false;
  private searchBarFocused: boolean = false;
  public account_modificator:string;
  public slug:string;
  public accounts:any;
  public active:boolean;
  public first_letter_received:boolean;
  public letter_address:string;

  @ViewChild('searchbar') searchbar: Searchbar;


  constructor(
    public viewCtrl: ViewController,
    private documentService: DocumentService,
    private folderService: FolderService,
    public navCtrl: NavController,
    public platform: Platform,
    public actionsheetCtrl: ActionSheetController,
    private translateService: TranslateService,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private userService: UserService,
    private alertCtrl: AlertController,
    private processErrorsService: ProcessErrorsService,
    private displayMessagesService: DisplayMessagesService,
    private analyticsService: AnalyticsService,
    private events: Events,
    private toastCtrl: ToastController,
    public zendeskService: ZendeskService,
    public bannerService: BannerService

  ) {
      this.dataLoad = true;
      this.platform = platform;
      this.type = navParams.get('type') || 'system' || 'archive';
      this.account_modificator = navParams.get('account_modificator') || 'User' ;
      this.slug = navParams.get('slug') || 'inbox';
      platform.ready().then((readySource) => {
          this.srcWidth = platform.width();
      });
      // user can be redirected to the inbox if his registration was successful.
      if (navParams.get('registrationSuccess')) {
          this.handleRegistrationSuccess();
          return;
      }

      // user can be redirected to the inbox if his registration was successful.
      if (navParams.get('onboardingCompleted')) {
          this.handleOnboardingCompleted();
          return;
      }
      this.noContentIcon = 'md-mail-open';
      this.translateService.get('documents.inbox.noLetters').subscribe(
          value => {
              this.noContentMessage = value;
          }
      );
      this.userService.getCurrentUser().subscribe(user=> {
         this.accounts = user.accounts;
      });
      let archive;
      let folder;
      if(folder = navParams.get('folder')) {
          // if is custom folder
          this.customFolder = folder;
          this.title = this.customFolder.title;
          this.noContentIcon = 'md-folder';
          this.documentService.loadFolders(this.type).subscribe(
              res => {
                  this.documents = res;
              });
      } else if(this.type==='system') {
          switch (this.slug) {
              case 'marked':
                  this.noContentIcon = 'md-star';
                  this.title = this.translateService.instant('general.menu.marked');
                  this.noContentMessage = this.translateService.instant('documents.inbox.noMarkedLetters');
                  this.documentService.loadFolders('marked').subscribe(
                      res => {
                          this.documents = res;
                      });
                  break;
              case 'sendtome':
                  this.translateService.get('general.menu.sendtome').subscribe(
                      value => {
                          this.title = value;
                      }
                  );
                  this.noContentIcon = 'md-send';
                  this.translateService.get('documents.inbox.noNotSendLetters').subscribe(
                      value => {
                          this.noContentMessage = value;
                      }
                  );
                  this.documentService.loadFolders('sendtome')
                      .subscribe(
                          data=> {
                              this.documents = data;
                          }
                      );
                  break;
              case 'trash':
                  this.translateService.get('general.menu.trash').subscribe(
                      value => {
                          this.title = value;
                      }
                  );
                  this.translateService.get('documents.inbox.noNotSendLetters').subscribe(
                      value => {
                          this.noContentMessage = value;
                      }
                  );
                  this.noContentIcon = 'md-trash';
                  this.translateService.get('documents.inbox.noDestroyed').subscribe(
                      value => {
                          this.noContentMessage = value;
                      }
                  );
                  this.documentService.loadFolders('trash').subscribe(
                      res => {
                          this.documents = res;
                      });
                  break;
              case 'inbox':
                  if (this.account_modificator === 'PostfachAccount') {
                      this.noContentIcon = 'md-folder';
                      this.translateService.get('general.menu.PostfachAccount').subscribe(
                          value => {
                              this.title = value;
                          });
                      this.documentService.loadInbox('inbox', 'PostfachAccount').subscribe(
                          res => {
                              this.documents = res;
                          });
                      this.active = this.accounts.postfach_active;
                      this.first_letter_received = this.accounts.postfach_received_first_letter;
                      this.letter_address = this.accounts.postfach;

                  } else if (this.account_modificator === 'BulkscanAccount') {
                      this.noContentIcon = 'md-folder';
                      this.translateService.get('general.menu.BulkscanAccount').subscribe(
                          value => {
                              this.title = value;
                          });
                      this.documentService.loadInbox('inbox', 'BulkscanAccount').subscribe(
                          res => {
                              this.documents = res;

                          });
                      this.active = this.accounts.bulkscan_active;
                      this.first_letter_received = this.accounts.bulkscan_received_first_letter;
                      this.letter_address = this.accounts.bulkscan;
                  }else if (this.account_modificator === 'User') {
                      this.noContentIcon = 'md-mail-open';
                      this.translateService.get('general.menu.inbox').subscribe(
                          value => {
                              this.title = value;
                          });
                      this.documentService.loadInbox('inbox', 'User') .subscribe(
                          data=> {
                              this.documents = data;
                          }
                      );
                  }
                  break;

          }
      } else if(String(this.type.match(/\w+\-\d{4}/)) && this.type!=='earlier' ) {
          this.title =  this.type.charAt(0).toUpperCase() + this.type.substring(1);
          this.noContentIcon = 'md-folder';
          if(this.documentService.archive[this.type]){
              this.documentService.loadArchive(this.documentService.archive[this.type].moment).subscribe(
                  data => {
                      this.documents = data;
                  }
              );
          }
      } else if(this.type==='earlier') {
          this.noContentIcon = 'md-folder';
          this.title ="Früher";
          if(this.documentService.archive[this.type]) {
              this.documentService.loadArchive(moment(this.documentService.archive[this.type].moment).add(-1, 'month')).subscribe(
                  data => {
                      this.documents = data;
                  }
              );
          }
      }

      this.userService.getCurrentUser().subscribe(
          user => {
              if (user.id) {
                  let userData = {
                      name: user.firstName + ' ' + user.lastName,
                      email: user.email
                  };
                  this.zendeskService.identify(userData);
                  this.getUserAnalytic(user);
                  if ( user.enableWidget === true) {
                      this.zendeskService.show();
                  } else {

                      this.zendeskService.hide();
                  }
                  if (user.registrationState ==='complete'){
                      if (user['referral'].possible_number - user['referral'].usage_counter !== 0 && !this.bannerService.getHide() ) {
                          this.bannerService.setHide(false);
                      }
                      if (user['referral'].possible_number - user['referral'].usage_counter !== 0 && this.bannerService.getHide()) {
                          this.bannerService.setHide(true);
                      }
                  }else{
                      this.bannerService.setHide(true);
                  }
              }
              this.canSendLetters = user.registrationState == "complete";
              this.currentUser    = user;
          }
      );


      return this;


  }


    ngOnInit() {
        // obtain the user to do tracking for the user.
        this.userService.getUserSession()
            .subscribe(
                user => {
                    let data = {
                        title: this.type, //'Dashboard | digitalkasten.de',
                        url: '/inbox',
                        CUSTOMER_ID: user.id
                    };
                    this.currentUser = user;
                    // show tutorial dialog here
                    if (this.navParams.get("registrationSuccess")) {
                        // in this case do not show the tutorial, since we just opened the
                        // page.
                    } else if (!this.navParams.get("registrationSuccess") && user.showGettingStartedTutorial && !this.userService.tutorialShown) {
                        let onboardingPage = this.modalCtrl.create(OnboardingPage);
                        onboardingPage.present();
                        // mark so we don't show it twice
                        this.userService.tutorialShown = true;
                    } else if (!this.navParams.get("registrationSuccess") && user.showPromptCompleteSignup && !this.userService.showPromptCompleteSignupShown) {

                        let completeSignupPage = this.modalCtrl.create(CompleteSignupPromptPage);
                        completeSignupPage.present();
                        // mark so we don't show it twice
                        this.userService.showPromptCompleteSignupShown = true;
                    }
                    //this.analyticsService.trackPageView(data);
                },
                err => {
                    console.log('failed to load user');
                });

        return true;
    }
    ngAfterViewInit(){
        this.searchbar.ionFocus.subscribe(()=>{
            console.log('focused');
            this.searchBarFocused = true;
            this.hideRefresher();

        });
        this.searchbar.ionBlur.subscribe(()=>{
            console.log('blured');
            this.searchBarFocused = false;
        });
    }
    onResize(event) {

        const innerWidthsrceenWidth= event.target.innerWidth;
        this.srcWidth = innerWidth;
    }
    srceenWidth(){
        return this.srcWidth;
    }
    private handleRegistrationSuccess() {
        this.presentLoadingWithTranslation('inbox.waitWhileSettingUp');
        setTimeout(() => {
            // not sure how to do this better, but make sure the browser has a new
            // URL set so that we land on the root inbox page for a logged in user.
            window.location.href = "/";
            window.location.reload();
        },  2000);
        return true;
    }

    private presentLoadingWithTranslation(translationKey) {
        let spinner = this.platform.is('ios') ? 'ios' : 'crescent';
        let content;
        this.translateService.get(translationKey)
            .subscribe(translation => content = translation);

        let loader = this.loadingCtrl.create({
            spinner: spinner,
            content: content
        });
        loader.present();
    }
    private handleOnboardingCompleted() {
        this.presentLoadingWithTranslation('inbox.waitWhileSettingUp');
        setTimeout(() => {
            // not sure how to do this better, but make sure the browser has a new
            // URL set so that we land on the root inbox page for a logged in user.
            window.location.href = "/";
            window.location.reload();
        },  2000);
        return true;
    }
    hideRefresher(error?) {
        const that = this;

        if (this.refresher) {
                if (!error){
                    setTimeout(function () {
                        that.refresher.complete();
                    }, 500);
                }
                else{
                    setTimeout(function () {
                        that.refresher.cancel();
                    }, 500);
                }
            setTimeout(function () {
                that.refresher = null;

            }, 500);
        }
    }
    doRefresh(refresher) {




        if (this.slug==='inbox'){
          this.documentService.loadInbox(this.slug, this.account_modificator);
            this.refresher = refresher;
        } else {
           this.documentService.loadFolders(this.slug);
           this.refresher = refresher;
        }
        this.hideRefresher();
    }
    clear(ev:any) {
        this.isSearchMode = false;
        this.documents = [];
        //this.loadDocuments();
    }
    public closeTapped(){
        this.hide = !this.hide;
        this.bannerService.setHide(true);
    }
    editFolder(folder) {

        let editFolderModal = this.modalCtrl.create(EditFolderModal, { folder: folder });
        editFolderModal.onDidDismiss(dismissedFolder => {
            if(dismissedFolder){
                this.customFolder = dismissedFolder;
                this.title = folder.title;
            }

        });
        editFolderModal.present();
    }
    public deleteFolderTapped($event,folder){
        $event.stopPropagation();
        this.events.publish('folder:delete',$event, folder);
    }
    public referralPromptTapped(event) {
        let referalPrompt = this.modalCtrl.create(ReferralPrompt);
        referalPrompt.present();

    }
    getItems(ev: any) {
        this.isSearchMode = true;
        this.documents = [];
        let val = ev.target.value;
        this.searchQuery = val;
        this.documentService.search(val)
            .map(documents => {
                return documents;
            })
            .subscribe(
                documents => {
                    this.documents = documents;
                },
                err => {
                    console.log(err);
                }
            );
    }
    getUserAnalytic(user) {

        let general_data = {
            'event':'page',
            'p_path':'/inbox',
            'p_title':'Main App',
            'user': user.id
        };

        this.analyticsService.trackCustomEvent(general_data);
    }
    private toast(message: string) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000
        });
        toast.present();
    }
    sendLetters($event) {
        if(this.canSendLetters){
            let confirm = this.alertCtrl.create({
                title: this.translateService.instant('general.menu.sendAlert.title'),
                message: this.translateService.instant('general.menu.sendAlert.message'),
                buttons: [
                    {
                        text: this.translateService.instant('general.menu.sendAlert.doNotSent'),
                        handler: () => {
                            console.log('Disagree clicked');
                        }
                    },
                    {
                        text: this.translateService.instant('general.menu.sendAlert.send'),
                        handler: () => {
                            this.userService.requestMailDelivery()
                                .subscribe(
                                    res => {
                                        let confirmMessage = this.translateService.instant('general.menu.confirmAlert.message');
                                        this.displayMessagesService.displayMessages([confirmMessage]);
                                        _.each(this.documents, d => {d.pendingUserDelivery = false; d.readyToSend = true; });
                                        this.documents = [];
                                    },
                                    err => {
                                        this.processErrorsService.processErrors(err);
                                    }
                                );
                        }
                    }
                ]
            });
            confirm.present();
        } else {
            if (this.currentUser.canCompleteSignup) {
                // redirect to signup
                this.navCtrl.setRoot(CompleteSignUp, {message: "signUp.completeFirst"});
            } else {
                this.toast(this.translateService.instant('general.menu.sendAlert.pleaseConfirmEmailFirst'));
            }
        }
    }
    public upgrade(event){
        let completeSignupPage = this.modalCtrl.create(CompleteSignupPromptPage);
        completeSignupPage.present();
        // mark so we don't show it twice
        this.userService.showPromptCompleteSignupShown = true;
    }

}
