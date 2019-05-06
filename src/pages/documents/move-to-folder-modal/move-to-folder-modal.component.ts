import { Component } from '@angular/core';
import { ViewController, NavParams, ToastController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { FolderService } from '../../../providers/folder-service';
import { DocumentService } from '../../../providers/document-service';
import { Document } from '../../../models/document';


@Component({
  selector: 'move-to-folder-modal',
  templateUrl: 'move-to-folder-modal.component.html'
})

export class MoveToFolderModal {
  private folders = [];
  private document: Document;
  constructor(
    public viewCtrl: ViewController,
    private params: NavParams,
    private folderService: FolderService,
    private toastCtrl: ToastController,
    private documentService: DocumentService,
    private translateService: TranslateService
  ) {
    this.document = this.params.data.document;
  }

  moveDocumentToFolder = (folder) => {
    if(folder) {
      this.document.folders = [folder.id];
    } else {
      this.document.folders = [];
    }
    this.documentService.update(this.document,folder.slug)
      .subscribe(document => {
        this.toast(this.translateService.instant('documents.documentList.hasBeenMovedToFolder'));
        this.viewCtrl.dismiss(this.document);
      },
      err => {
        this.toast(this.translateService.instant('general.genericError'));
      });
  }

  ngOnInit() {
    this.folderService.folders.subscribe(
      folders => this.folders = folders
    );
  }

  agree() {
    this.viewCtrl.dismiss(this.document);
  }
  dismiss() {
    this.viewCtrl.dismiss(this.document);
  }

  private toast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
}
