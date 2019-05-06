import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from  '@ngx-translate/core';

import { SignupStep1 } from './step-1/step-1';
import { SignupStep2 } from './step-2/step-2';
import { SignupStep3 } from './step-3/step-3';
import { SignupStep4 } from './step-4/step-4';
import { SignupStep5 } from './step-5/step-5';
import { Toc } from './terms-and-conditions/terms-and-conditions';
import { Privacy } from './privacy-policy/privacy-policy';

import { PipeModule } from '../../pipes/pipes.module';

@NgModule({
  imports:      [
    IonicModule,
    ReactiveFormsModule,
    PipeModule,
    TranslateModule
  ],
  declarations: [
    SignupStep1,
    SignupStep2,
    SignupStep3,
    SignupStep4,
    SignupStep5,
    Toc,
    Privacy
  ],
  entryComponents: [
    SignupStep1,
    SignupStep2,
    SignupStep3,
    SignupStep4,
    SignupStep5,
    Toc,
    Privacy
  ]
})
export class SignupModule { }
