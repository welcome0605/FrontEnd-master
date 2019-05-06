import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastController } from 'ionic-angular';

import { DisplayMessagesService } from './display-messages-service';

@Injectable()
export class ProcessErrorsService {
  constructor (
    private translateService: TranslateService,
    private toastCtrl: ToastController,
    private displayMessagesService: DisplayMessagesService
  ) {
  }

  public processErrors(response: any, errors: string[] = []) {
    let responseErrorMessages = this.parseResponse(response);
    let errorMessages = errors.concat(responseErrorMessages);

    if (errorMessages.length !== 0){
      this.displayMessagesService.displayMessages(errorMessages);
    } else {
      this.displayGenericError();
    }
  }

  private parseResponse(response: any): string[] {
    try {
      let responseJson = JSON.parse(response._body);
      return responseJson.errors.full_messages || [];
    } catch (_) {
      return [];
    }
  }

  private displayGenericError() {
    this.translateService.get('general.genericError').subscribe( (value) => {
      this.displayMessagesService.displayMessages([value]);
    });
  }
}
