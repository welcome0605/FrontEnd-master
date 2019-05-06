import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { FormBuilder, Validators } from '@angular/forms';
import { FolderService } from '../../providers/folder-service';
import { Folder } from '../../models/folder';


@Component({
  selector: 'create-folder-modal',
  templateUrl: 'create-folder-modal.html'
})

export class CreateFolderModal {

  constructor(
    public viewCtrl: ViewController,
    private fb: FormBuilder,
    private folderService: FolderService
  ) {

  }

  form = this.fb.group({
    title: ["", Validators.required],
  });

  createFolder = (event) => {
    if (this.form.valid) {
      console.log("valid form submitted", this.form.value);
      let folder = new Folder(this.form.value);
      console.log(folder);
      this.folderService.create(folder)
        .subscribe(
          folder => {
            console.log(folder);
          },
          err => {
            console.log(err);
          });
      this.viewCtrl.dismiss();
    } else {
      console.log("invalid form submitted", this.form);
      return true;
    }
  }

  agree() {
    this.viewCtrl.dismiss();
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  ngOnInit() {

  }
}
