import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-policy',
  templateUrl: 'policy.html'
})
export class Policy {
  constructor(public viewCtrl: ViewController) {}

  agree() {
    this.viewCtrl.dismiss(true);
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

}
