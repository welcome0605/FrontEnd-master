import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  templateUrl: 'terms-and-conditions.html'
})
export class Toc {
  constructor(public viewCtrl: ViewController) {
  }

  agree() {
    let checked = true;
    this.viewCtrl.dismiss(checked);
  }

  dismiss() {
    let checked = false;
    this.viewCtrl.dismiss(checked);
  }

}
