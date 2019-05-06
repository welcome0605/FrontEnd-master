import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { FolderService } from '../../providers/folder-service';

@Component({
  selector: 'edit-folder-modal',
  templateUrl: 'edit-folder-modal.html'
})

export class EditFolderModal {
  private form: any;
  private folder: any;
  constructor(
    public viewCtrl: ViewController,
    private fb: FormBuilder,
    private folderService: FolderService,
    private params: NavParams
  ) {
    this.folder = this.params.get('folder');
    this.form = this.fb.group({
      title: [this.folder.title, Validators.required],
    });
  }


  updateFolder = (event) => {
    if (this.form.valid) {
      console.log("valid form submitted", this.form.value);
      this.folder.title = this.form.value.title;
      this.folderService.update(this.folder)
        .subscribe(
          folder => {
            this.folder = folder;
            this.viewCtrl.dismiss(this.folder);
          },
          err => {
            console.log(err);
          }
        );
    } else {
      console.log("invalid form submitted", this.form);
      return true;
    }
  }

  agree() {
    this.viewCtrl.dismiss(this.folder);
  }
  dismiss() {
    this.viewCtrl.dismiss(this.folder);
  }

  ngOnInit() {

  }
}
