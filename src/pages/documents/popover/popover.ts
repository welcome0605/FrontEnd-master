import { Component, Input } from '@angular/core';
import { NavParams, ToastController, ModalController, ViewController, AlertController } from 'ionic-angular';
import * as _ from 'lodash';
import { DocumentService } from '../../../providers/document-service';
import { TranslateService } from '@ngx-translate/core';
import { Document } from '../../../models/document';
import { LabelEditor } from '../label-editor/label-editor.component';
import { MoveToFolderModal } from '../move-to-folder-modal/move-to-folder-modal.component';
import { assert } from "ionic-angular/util/util";


@Component({
  selector: 'popover',
  templateUrl: 'popover.html'
})

export class Popover {
  public doc: any;
  public url: any;

  @Input() documents: Document[];

  constructor(
    public viewCtrl: ViewController,
    private toastCtrl: ToastController,
    private documentService: DocumentService,
    private navParams: NavParams,
    private translateService: TranslateService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {

  }

  ngOnInit() {
    if (this.navParams.data) {
      this.doc = this.navParams.data.document;
      // console.log("doc",this.doc);
      this.url = this.navParams.data.url;

      if (this.doc.readyToSend) {
        document.getElementById('sendToMe').style.display = 'none';
        document.getElementById('destroyMe').style.display = 'none';
      }
    }
  }

  deleteDocument(document) {
    this.viewCtrl.dismiss();
    let confirm = this.alertCtrl.create({
      title: this.translateService.instant('documents.documentList.destroyAlert.title'),
      message: this.translateService.instant('documents.documentList.destroyAlert.message'),
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
            this.documentService.destroy(document)
              .subscribe(
                document => {
                  let i = _.findIndex(this.documents, (d) => d.id == document.id);
                  if(i != -1) {
                    this.documents.splice(i, 1);
                  }
                  this.toast(this.translateService.instant('documents.documentList.hasBeenDestroyed'));
                },
                err => {
                  this.toast(this.translateService.instant('general.genericError'));
                }
              );
          }
        }
      ]
    });
    console.log(12313132123123)
    confirm.present();
  }

  markAsFavorite(document: Document) {
    document.favoritedByUser = !document.favoritedByUser;
    this.viewCtrl.dismiss();
    return this.updateDocument(document)
      .subscribe(
        document => {

          this.translateService.get('documents.documentList.hasBeenFavorited').subscribe(
            value => {
              let message = value;

              if (!document.favoritedByUser) {
                this.toast(this.translateService.instant('documents.documentList.hasBeenUnfavorited'));
              } else {
                this.toast(message);
              }
            },
            err => {
              console.error(err);
            }
          );
        },
        err => {
          this.translateService.get('general.genericError').subscribe(
            value => {
              let message = value;
              this.toast(message);
            },
            err => {
              console.error(err);
            }
          );
        }
      );
    }

  toggleSendToUser(document: Document) {
    document.pendingUserDelivery = !document.pendingUserDelivery;
    this.viewCtrl.dismiss();
    return this.updateDocument(document)
      .subscribe(
        document => {
          if (!document.pendingUserDelivery) {
            this.toast(this.translateService.instant('documents.documentList.hasBeenMovedToFolder'));
          } else {
            this.toast(this.translateService.instant('documents.documentList.hasBeenMovedToFolder'));
          }
        },
        err => {
          if(err.pending_user_delivery) {
            this.toast(err.pending_user_delivery);
          } else {
            this.toast(this.translateService.instant('general.genericError'));
          }
        }
      );
    }

  markAsRead(document: Document) {
    document.openedByUser = true;
    this.viewCtrl.dismiss();
    return this.updateDocument(document);
  }

  updateDocument(document: Document) {
    return this.documentService.update(document,document.folderSlugs[0]);
  }

  openLabelEditor(document) {
    let LabelEditorModal = this.modalCtrl.create(LabelEditor, { document: document });
    LabelEditorModal.onDidDismiss(document => {
    });
    this.viewCtrl.dismiss();
    LabelEditorModal.present();
  }

  openMoveToFolderModal(document) {
    let moveToFolderModal = this.modalCtrl.create(MoveToFolderModal, { document: document });
    moveToFolderModal.onDidDismiss(document => {
    });
    this.viewCtrl.dismiss();
    moveToFolderModal.present();
  }

  openDocument(url)  {
    this.viewCtrl.dismiss();
    window.open(url, '_blank');
  }

  // marks the document as unread by the user
  markAsUnread(doc:Document){
    // dismiss the popover
    this.viewCtrl.dismiss();
    this.documentService.markDocumentAsUnread(doc).subscribe( doc => {
      assert(doc.openedByUser === false, "the document should not marked as opened");
      console.log("document marked as unread");
    }, error => {
      console.error("failed to mark document " + doc.id + " as unread");
      console.error(error);
    });
  }
  private toast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

}
