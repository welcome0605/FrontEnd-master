import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  templateUrl: 'privacy-policy.html'
})
export class Privacy {
  constructor(public viewCtrl: ViewController) {
  }

  agree() {
    let checked = true;
    this.viewCtrl.dismiss(checked);
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

}
