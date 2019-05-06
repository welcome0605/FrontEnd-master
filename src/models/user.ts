interface Referral{
  code: String;
  expiration_date: String;
  possible_number: number;
  usage_counter: number;
}
interface Group{
    main: String;
    postfach: String;
    bulkscan: number;
}
interface Accounts{
    main: String;
    postfach: String;
    bulkscan: number;
    group: Group;
}

export class User {
  id: number;
  email: String;
  emailConfirmation: String;
  firstName: String;
  lastName: String;
  street: String;
  company: String;
  is_company: Boolean;
  companyName: String;
  zipcode: String;
  city: String;
  phone: String;
  receiveNotificationsViaPush: Boolean;
  receiveNotificationsViaEmail: Boolean;
  receiveNewsletter: Boolean;
  enableWidget: Boolean;
  nextMailDeliveryAt: String;
  deviceTokens: Array<String>;
  password: String;
  passwordConfirmation: String;
  locale: String;
  registrationState: string;
  canCompleteSignup: Boolean;
  pendingEmailConfirmation: Boolean;
  showGettingStartedTutorial: Boolean;
  showPromptCompleteSignup: Boolean;
  plan_slug: String;
  planName: String;
  voucher: String;
  referral: Referral;
  usedReferral: String;
  accounts : Accounts;

  mailDeliveryFirstName: String;
  mailDeliveryLastName: String;
  mailDeliveryStreet: String;
  mailDeliveryHouseNumber: String;
  mailDeliveryCompany: String;
  mailDeliveryAdresszusatz: String;
  mailDeliveryZipcode: String;
  mailDeliveryCity: String;

  token: string;
  method: string;

  constructor(data: any = null) {
    if (data) {
      this.id                           = data.id;
      this.email                        = data.email;
      this.emailConfirmation            = data.email_confirmation;
      this.firstName                    = data.first_name;
      this.lastName                     = data.last_name;
      this.street                       = data.street;
      this.company                      = data.company;
      this.companyName                  = data.company_name;
      this.is_company                   = data.is_company;
      this.zipcode                      = data.zipcode;
      this.city                         = data.city;
      this.phone                        = data.phone;
      this.voucher                      = data.voucher;
      this.receiveNotificationsViaPush  = data.receive_notifications_via_push;
      this.receiveNotificationsViaEmail = data.receive_notifications_via_email;
      this.enableWidget                 = data.user_settings.zendesk_widget;
      this.receiveNewsletter            = data.receive_newsletter;
      this.nextMailDeliveryAt           = data.next_mail_delivery_at;
      this.deviceTokens                 = data.device_tokens;
      this.password                     = data.password;
      this.passwordConfirmation         = data.passwordConfirmation;
      this.locale                       = data.locale;
      this.plan_slug                    = data.plan_slug;
      this.planName                     = data.plan_name;
      this.registrationState            = data.registration_state;
      this.canCompleteSignup            = data.can_complete_signup;
      this.pendingEmailConfirmation     = data.pending_email_confirmation;
      this.showGettingStartedTutorial   = data.show_getting_started_tutorial;
      this.showPromptCompleteSignup     = data.show_prompt_complete_signup;
      this.referral                     = data.referral;
      this.usedReferral                 = data.used_referral;
      this.accounts                     = data.accounts;
      if (data.mail_delivery_address) {
        this.mailDeliveryFirstName = data.mail_delivery_address.first_name;
        this.mailDeliveryLastName = data.mail_delivery_address.last_name;
        this.mailDeliveryStreet = data.mail_delivery_address.street;
        this.mailDeliveryHouseNumber = data.mail_delivery_address.house_number;
        this.mailDeliveryCompany = data.mail_delivery_address.company;
        this.mailDeliveryAdresszusatz = data.mail_delivery_address.adresszusatz;
        this.mailDeliveryZipcode = data.mail_delivery_address.zipcode;
        this.mailDeliveryCity = data.mail_delivery_address.city;
      }
      if (data.token) {
        this.token = data.token;
        if (data.method){
          this.method = data.method;
        }
          
      }
    }
  }

  public toJson() {
    return {
      "user": {
          "id": this.id,
          "device_tokens": this.deviceTokens,
          "email": this.email,
          "email_confirmation": this.emailConfirmation,
          "mail_delivery_first_name": this.mailDeliveryFirstName,
          "mail_delivery_last_name": this.mailDeliveryLastName,
          "mail_delivery_street": this.mailDeliveryStreet,
          "mail_delivery_house_number": this.mailDeliveryHouseNumber,
          "mail_delivery_company": this.mailDeliveryCompany,
          "mail_delivery_addition_to_address": this.mailDeliveryAdresszusatz,
          "mail_delivery_zipcode": this.mailDeliveryZipcode,
          "mail_delivery_city": this.mailDeliveryCity,
          "receive_notifications_via_push": this.receiveNotificationsViaPush,
          "receive_notifications_via_email": this.receiveNotificationsViaEmail,
          "user_settings": { 'zendesk_widget': this.enableWidget },
        "receive_newsletter": this.receiveNewsletter,
        "password": this.password,
        "password_confirmation": this.passwordConfirmation,
        "locale": this.locale,
        "phone": this.phone,
        "company": this.companyName,
        "voucher": this.voucher,
        "referral": this.referral,
        "used_referral": this.usedReferral,
         "accounts": this.accounts
      }
    };
  }

  shouldUpdatePushNotificationToken() {
    return (!this.deviceTokens.length && 
    !this.receiveNotificationsViaPush) || this.receiveNotificationsViaPush;
  }

}
