import { Component } from '@angular/core';
import { NavController, ModalController, ToastController } from 'ionic-angular';
import { Inbox } from '../../documents';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { RegistrationService } from '../../../providers/registration-service';
import { Toc } from '../terms-and-conditions/terms-and-conditions';
import { Privacy } from '../privacy-policy/privacy-policy';

import { SignupStep5 } from '../step-5/step-5';
import { SignupStep3 } from '../step-3/step-3';
import { SignupStep2 } from '../step-2/step-2';
import { SignupStep1 } from '../step-1/step-1';

@Component({
  selector: 'signup-step4',
  templateUrl: 'step-4.html'
})
export class SignupStep4 {
  errors: any = [];
  pushPage: any = null;
  public form;

  public toViewOne: any = SignupStep1;
  public toViewTwo: any = SignupStep2;
  public toViewThree: any = SignupStep3;

  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public reg: RegistrationService,
    public modalCtrl: ModalController,
    private translateService: TranslateService,
    private toastCtrl: ToastController
  ) {
    let self = this;
    this.form = this.fb.group({
      checkedTermsAndConditions: [self.fetchValue('checkedTermsAndConditions'), Validators.required],
      checkedPrivacyPolicy: [self.fetchValue('permissionToRedirectMail'), Validators.required],
      signatureFullName: [""]
    });
  }

  public signup() {
    this.navCtrl.setRoot(Inbox);
  }

  public formSubmitted = (event) => {
    this.errors = [];
    if (this.form.valid) {
      if (this.form.value.checkedTermsAndConditions && this.form.value.checkedPrivacyPolicy) {
        this.reg.stepFourData = this.form;
        this.reg.create(this.reg.mapData())
          .subscribe(
          r => {
            // todo handle in case there are errors returned
            this.navCtrl.setRoot(SignupStep5);
          },
          err => {
            this.errors = err.json().errors;
          }
          );
        console.log("valid form submitted", this.form);
      } else {
        this.translateService.get('signup.step3.needToAccept').subscribe(
          value => {
            let message = value;
            this.toast(message);
          }
        );
      }
    } else {
      console.log("invalid form submitted", this.form);
      return true;
    }
  }

  public fetchValue = (key, subkey = null) => {
    if (this.reg && this.reg.stepFourData && this.reg.stepFourData.value[key]) {
      return this.reg.stepFourData.value[key];
    } else if (this.reg && this.reg.stepFourData && this.reg.stepFourData.value[subkey] && this.reg.stepFourData.value[subkey][key]) {
      return this.reg.stepFourData.value[subkey][key];
    } else {
      return false;
    }
  }

  acceptTermsAndConditions($event) {
    let tocModal = this.modalCtrl.create(Toc);
    this.form.patchValue({ checkedTermsAndConditions: false });
    tocModal.onDidDismiss(checked => {
      this.form.patchValue({ checkedTermsAndConditions: checked });
    });
    tocModal.present();
  }

  acceptPrivacyPolicy($event) {
    let tocModal = this.modalCtrl.create(Privacy);
    this.form.patchValue({ checkedPrivacyPolicy: false });
    tocModal.onDidDismiss(checked => {
      this.form.patchValue({ checkedPrivacyPolicy: checked });
    });
    tocModal.present();
  }

  private toast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

}
