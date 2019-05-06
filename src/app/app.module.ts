
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler, DeepLinkConfig } from 'ionic-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule, Http } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { Badge } from 'ionic-native';
import { SocialSharing } from '@ionic-native/social-sharing';

import { TokenService } from '../providers/token-service';
import { DocumentService } from '../providers/document-service';
import { FolderService } from '../providers/folder-service';
import { UserService } from '../providers/user-service';
import { RegistrationService } from '../providers/registration-service';
import { HttpService } from '../providers/http-service';
import { ProcessErrorsService } from '../providers/process-errors-service';
import { DisplayMessagesService } from '../providers/display-messages-service';
import { AnalyticsService } from '../providers/analytics-service';
import { MyApp } from './app.component';
import { AppMenu } from '../components/app-menu/app-menu';

import { Login } from '../pages/login/login';
import { ZendeskService } from "../providers/zendesk-service";
import { BrowserModule } from '@angular/platform-browser';
import IbanInput from '../components/iban-input/iban-input';
import { BannerService } from '../providers/banner-service';
import {
  SignUpModule,
  FullSignupPage,
  CompanySignupPage,
  FreeAccount,
  FreeBusinessAccount,
  Success,
  PaymentSuccess,
  UserPaymentTutorial,
  CompleteSignUp,
  BillingOptions,
  SignUpSuccess, MailRedirectConfirmationPage
} from '../pages/sign-up';
import { DocumentsModule, Inbox } from '../pages/documents';
import { MyData } from '../pages/my-data/my-data';
import { RequestPassword } from '../pages/request-password/request-password';
import { SetPassword } from '../pages/set-password/set-password';
import { ResetPassword } from '../pages/reset-password/reset-password';

import { CreateFolderModal } from '../components/create-folder-modal/create-folder-modal';
import { EditFolderModal } from '../components/edit-folder-modal/edit-folder-modal';
import { Popover } from '../pages/documents/popover/popover';

import { PipeModule } from '../pipes/pipes.module';
import { OnboardingPage } from "../pages/onboarding/onboarding";
import { CompleteSignupPromptPage } from "../pages/complete-signup-prompt/complete-signup-prompt";
import { SignupStep1, SignupStep2, SignupStep3, SignupStep4, SignupStep5 } from "../pages/signup/index";
import { SignupModule } from "../pages/signup/signup.module";
import { ReferralPrompt } from "../pages/referral-prompt/referral-prompt";

import { PdfViewerModule } from 'ng2-pdf-viewer';


import { DocumentViewer } from '@ionic-native/document-viewer';
import { Push, PushObject, PushOptions } from '@ionic-native/push';


const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '44a8c582'
  },
  'push': {
    'sender_id': '5104595532',
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      },
      'android': {
        'iconColor': '#343434'
      }
    }
  }
};

export const deepLinkConfig: DeepLinkConfig = {
  links: [
    { component: Login, name: 'Login', segment: 'login' },
    { component: Login, name: 'Login', segment: 'login/:message' },
    { component: Inbox, name: 'Inbox', segment: 'inbox' },
    { component: MyData, name: 'My Data', segment: 'my-data' },
    { component: SignupStep1, name: 'Signup Step 1', segment: 'signup-step1' },
    { component: SignupStep2, name: 'Signup Step 2', segment: 'signup-step2' },
    { component: SignupStep3, name: 'Signup Step 3', segment: 'signup-step3' },
    { component: SignupStep4, name: 'Signup Step 4', segment: 'signup-step4' },
    { component: SignupStep5, name: 'Signup Step 5', segment: 'signup-step5' },
    { component: RequestPassword, name: 'Forget Password', segment: 'forget-password' },
    { component: SetPassword, name: 'Set New Password', segment: 'set-password' },
    { component: ResetPassword, name: 'Reset Password', segment: 'password_resets/:token' },
    { component: FreeAccount, name: 'Free Account', segment: 'free-account' },
    { component: FreeBusinessAccount, name: 'Free Business Account', segment: 'free-business-account' },
    { component: Success, name: 'Success', segment: 'success' },
    { component: MailRedirectConfirmationPage, name: 'Success', segment: 'login/registration_success/:token', defaultHistory: [Inbox] },
    { component: FullSignupPage, name: 'Full Signup', segment: 'full-signup' },
    { component: CompanySignupPage, name: 'Company Signup', segment: 'company-signup' },
    { component: CompanySignupPage, name: 'Company Signup', segment: 'company-signup/:planType' },
    { component: FullSignupPage, name: 'Full Signup', segment: 'full-signup/:planType' },
    { component: CompleteSignUp, name: 'Complete Sign Up', segment: 'complete-sign-up' },
    { component: BillingOptions, name: 'Billing Options', segment: 'billing-options', defaultHistory: [Inbox] },
    { component: SignUpSuccess, name: 'Sign Up Success', segment: 'sign-up-success' },
    { component: PaymentSuccess, name: 'Payment Success', segment: 'payment-success' },
    { component: UserPaymentTutorial, name:'User tutorial', segment: 'user-tutorial'}
  ]
};

@NgModule({
  declarations: [
    MyApp,
    AppMenu,
    Login,
    MyData,
    RequestPassword,
    SetPassword,
    ResetPassword,
    Popover,
    CreateFolderModal,
    EditFolderModal,
    OnboardingPage,
    CompleteSignupPromptPage,
    ReferralPrompt,
  ],
  imports: [
    IonicStorageModule.forRoot({
      name: 'digitalkasten',
      driverOrder: ['sqlite', 'websql', 'indexeddb']
    }),
    IonicModule.forRoot(MyApp, {}, deepLinkConfig),
      BrowserModule,
    CloudModule.forRoot(cloudSettings),
    ReactiveFormsModule,
      HttpClientModule,
      HttpModule,
    SignUpModule,
      PdfViewerModule,
    SignupModule,
    DocumentsModule,
      TranslateModule.forRoot({
          loader: {
              provide: TranslateLoader,
              useFactory: (createTranslateLoader),
              deps: [HttpClient]
          }
      }),
    PipeModule,
  ],
  bootstrap: [
    IonicApp
  ],
  entryComponents: [
    MyApp,
    Login,
    MyData,
    RequestPassword,
    SetPassword,
    ResetPassword,
    Popover,
    CreateFolderModal,
    EditFolderModal,
    OnboardingPage,
    CompleteSignupPromptPage,
      ReferralPrompt
  ],
  providers: [
    TokenService,
    DocumentService,
    FolderService,
    RegistrationService,
    DocumentViewer,
    HttpService,
    UserService,
    ProcessErrorsService,
    DisplayMessagesService,
    AnalyticsService,
    ZendeskService,
    BannerService,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Badge,
    Push,
    SocialSharing
  ]
})
export class AppModule { }

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/translations/', '.json');
}
