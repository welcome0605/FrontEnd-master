import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class DisplayMessagesService {
  constructor (
    private toastCtrl: ToastController
  ) {
  }

  public displayMessages(messages: string[] = []) {
    let toast = this.toastCtrl.create({
      message: messages.join('\n'),
      duration: 5000
    });
    toast.present();
  }
}
