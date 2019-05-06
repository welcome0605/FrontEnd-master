import { Component, Input } from '@angular/core';
import { Platform, NavController, AlertController, ModalController, Events, ToastController, MenuController, Toggle } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { DocumentService } from '../../providers/document-service';
import { FolderService } from '../../providers/folder-service';

import { User } from '../../models/user';
import { Folder } from '../../models/folder';
import { UserService } from '../../providers/user-service';

import { ProcessErrorsService } from '../../providers/process-errors-service';
import { DisplayMessagesService } from '../../providers/display-messages-service';

import { CreateFolderModal } from '../create-folder-modal/create-folder-modal';

import { Inbox } from '../../pages/documents';
import { MyData } from '../../pages/my-data/my-data';

import { CompleteSignUp } from '../../pages/sign-up/complete-sign-up/complete-sign-up';
import { CompleteSignupPromptPage } from "../../pages/complete-signup-prompt/complete-signup-prompt";

@Component({
  selector: 'app-menu',
  templateUrl: 'app-menu.html'
})
export class AppMenu {
  @Input() nav: NavController;
  public user: User;
  public months: any = [];
  public folders: any = [];
  public toggle: boolean;
  public currentPageIdentifier: String = 'inbox';

  public pages: any = {
    "Inbox": Inbox,
    "MyData": MyData
  };

  constructor(
    private platform: Platform,
    private translateService: TranslateService,
    private documentService: DocumentService,
    private modalCtrl: ModalController,
    private folderService: FolderService,
    private userService: UserService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private processErrorsService: ProcessErrorsService,
    private displayMessagesService: DisplayMessagesService,
    private events: Events,
    public menuCtrl: MenuController
  ) {
    this.userService.getCurrentUser()
      .subscribe(user => this.user = user);

    this.folderService.all()
      .subscribe(folders => this.folders = folders);
    this.events.subscribe("folder:delete", (event, folder: Folder) => this.deleteFolder(event, folder));
  }

  isActive(identifier) {
    return this.currentPageIdentifier == identifier;
  }

  openPageByIdentifier(identifier, opts = { type: null, account_modificator: null, slug:null}) {
    let page = this.pages[identifier];
    if (opts && opts.type) {
      this.currentPageIdentifier = opts.type;
    } else {
      this.currentPageIdentifier = identifier;
    }
    this.nav.setRoot(page, opts);
  }

  openInbox(type, account_modificator) {
    this.nav.setRoot(Inbox, {
      type: type,
      account_modificator: account_modificator
    });
  }

  sendLetters() {
    let confirm = this.alertCtrl.create({
      title: this.translateService.instant('general.menu.sendAlert.title'),
      message: this.translateService.instant('general.menu.sendAlert.message'),
      buttons: [
        {
          text: this.translateService.instant('general.disagree'),
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: this.translateService.instant('general.agree'),
          handler: () => {
            this.userService.requestMailDelivery()
              .subscribe(
              res => {
                let confirmMessage = this.translateService.instant('general.menu.confirmAlert.message');
                this.displayMessagesService.displayMessages([confirmMessage]);
              }, err => {
                this.processErrorsService.processErrors(err);
              });
          }
        }
      ]
    });
    confirm.present();
  }

  // delete the given folder
  public deleteFolder($event, folder) {
    $event.stopPropagation();

    let confirm = this.alertCtrl.create({
      title: this.translateService.instant('deleteFolder.title'),
      message: this.translateService.instant('deleteFolder.message'),
      buttons: [
        {
          text: this.translateService.instant('deleteFolder.abort')
        },
        {
          text: this.translateService.instant('deleteFolder.yes'),
          handler: () => {
            let navTransition = confirm.dismiss();
            setTimeout(() => {
              navTransition.then(() => {
                console.log("transition finished");
                this.folderService.delete(folder).subscribe(folders => {
                  this.folders = folders;
                  if (this.currentPageIdentifier === folder.slug) {
                    // navigate to inbox
                    this.openPageByIdentifier("Inbox", { type: 'inbox', account_modificator: 'User', slug: 'inbox' });
                    // refresh all the documents
                  }
                }, error => {
                  console.log("failed to delete folder");
                });

              });
            }, 100);
            return false;
          }
        }]
    });
    confirm.present();
  }

  createFolder($event) {
    let createFolderModal = this.modalCtrl.create(CreateFolderModal);
    createFolderModal.onDidDismiss(checked => {
    });
    createFolderModal.present();
  }

  onToggle(event) {
    if (event.checked) {
      setTimeout(() => {
        if (event.checked) {
          this.toggle = false;
          if (this.platform.is('ios')) {
            this.menuCtrl
              .close()
              .then(showCompleteSingupPrompt);
          } else {
            showCompleteSingupPrompt();
          }
        }
      }, 600);
    }

    const showCompleteSingupPrompt = () => {

      //show complete signup modal when try to turn on the toggle btn
      let completeSignupPage = this.modalCtrl.create(CompleteSignupPromptPage);
      completeSignupPage.present();
      // mark so we don't show it twice
      this.userService.showPromptCompleteSignupShown = true;
    };
  }

  onStopTogglePropagation(event) {
    event.stopPropagation();
  }
}
