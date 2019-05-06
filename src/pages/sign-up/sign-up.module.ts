import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SignUpService } from '../../providers/sign-up-service';

import { PipeModule } from '../../pipes/pipes.module';

import { FreeAccount } from './free-account/free-account';
import { FreeBusinessAccount } from './free-business-account/free-business-account';
import { Terms } from './terms/terms';
import { Policy } from './policy/policy';
import { CompleteSignUp } from './complete-sign-up/complete-sign-up';
import { BillingOptions } from './billing-options/billing-options';
import { SignUpSuccess } from './sign-up-success/sign-up-success';
import { Success } from './success/success';
import { FullSignupPage } from "./full-signup/fullsignup";
import { CompanySignupPage } from "./company-signup/companysignup";
import { MailRedirectConfirmationPage } from "./mail-redirect-confirmation/mail-redirect-confirmation";
import { PaymentSuccess } from "./payment-success/payment-success";
import { UserPaymentTutorial } from "./user-payment-tutorial/user-payment-tutorial";

@NgModule({
  imports: [
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    PipeModule
  ],
  declarations: [
    FullSignupPage,
    CompanySignupPage,
    FreeAccount,
    FreeBusinessAccount,
    Terms,
    Policy,
    Success,
    PaymentSuccess,
    UserPaymentTutorial,
    CompleteSignUp,
    BillingOptions,
    SignUpSuccess,
    MailRedirectConfirmationPage
  ],
  entryComponents: [
    FullSignupPage,
    CompanySignupPage,
    FreeAccount,
    FreeBusinessAccount,
    Terms,
    Policy,
    Success,
    PaymentSuccess,
    UserPaymentTutorial,
    CompleteSignUp,
    BillingOptions,
    SignUpSuccess,
    MailRedirectConfirmationPage
  ],
  providers: [SignUpService]
})
export class SignUpModule {}
