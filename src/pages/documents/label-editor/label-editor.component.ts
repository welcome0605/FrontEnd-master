import { Component } from '@angular/core';
import { ViewController, NavParams, ToastController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { Document } from '../../../models/document';
import { DocumentService } from '../../../providers/document-service';

@Component({
  templateUrl: 'label-editor.component.html'
})
export class LabelEditor {
  private document: Document;
  constructor(
    private translateService: TranslateService,
    private viewCtrl: ViewController,
    private params: NavParams,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private documentService: DocumentService
  ) {
    this.document = this.params.data.document;
    console.log(this.document);
  }
  form = this.fb.group({
    name: ["", Validators.required],
  });

  deleteTag(index) {
    this.document.tags.splice(index, 1);
    this.documentService.update(this.document,this.document.folderSlugs[0])
      .subscribe(document => {
        this.translateService.get('documents.labelEditor.tagDeleted').subscribe(
          value => {
            let message = value;
            this.toast(message);
          }
        );
      },
      err => {
        this.translateService.get('general.genericError').subscribe(
          value => {
            let message = value;
            this.toast(message);
          }
        );
      });
  }

  addTag = (event) => {
    if (this.form.valid) {
      console.log("valid form submitted", this.form.value);
      this.document.tags.push(this.form.value);
      this.documentService.update(this.document, this.document.folderSlugs[0])
        .subscribe(document => {
          this.toast("Tag hinzugefügt");
        },
        err => {
          this.translateService.get('general.genericError').subscribe(
            value => {
              let message = value;
              this.toast(message);
            }
          );
        });
      this.form.reset();
    } else {
      console.log("invalid form submitted", this.form);
      return true;
    }
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
