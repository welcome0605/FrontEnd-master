import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-terms',
  templateUrl: 'terms.html'
})
export class Terms {
  constructor(public viewCtrl: ViewController) {}

  agree() {
    this.viewCtrl.dismiss(true);
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

}
