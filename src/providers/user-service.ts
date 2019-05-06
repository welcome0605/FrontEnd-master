import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import { User } from '../models/user';
import { TokenService } from './token-service';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Push, PushToken } from '@ionic/cloud-angular';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { ENV } from '@app/env';
import {Badge} from 'ionic-native';

@Injectable()
export class UserService {
  public user: BehaviorSubject<User>;
  public tutorialShown: Boolean = false;
  public showPromptCompleteSignupShown: Boolean = false;
  private baseUrl = `${ENV.apiUrl}/profile`;
  public isUserSession: boolean = null;

  constructor(
    public http: HttpService,
    private tokenService: TokenService,
    public push: Push,
    private platform: Platform
  ) {
    this.user = <BehaviorSubject<User>>new BehaviorSubject(new User());
  }

  public isLoggedIn():Promise<boolean>{
    let promise =  new Promise((resolve, reject)=>{
      resolve( this.tokenService.get() !== null);
    });
    return promise; 
  }

  public getCurrentUser(): Observable<User> {
    return this.user.asObservable();
  }

  public getUserSession(): Observable<User> {
    return this.getCurrentUser()
      .takeWhile(() => !this.isUserSession)
      .skipWhile(user => {
          if(user.id){
            this.isUserSession = true;
          }
          return user.id == undefined;
        })
      .take(1);
  }

  getRegistrationState(): boolean {
    let result: boolean;
    this.user
      .subscribe(user => result = user.registrationState != 'complete');
    return !result;
  }

  public canCompleteSignup(): Boolean {
    let result = this.user.getValue().canCompleteSignup;
    return result;
  }

  public pendingEmailConfirmation(): Boolean {
    let result: Boolean;
    this.user
      .subscribe(user => result = user.pendingEmailConfirmation);
    result = this.user.getValue().pendingEmailConfirmation;
    return result;
  }

  public load() : Observable<User> {
    let obs = this.http.get(this.baseUrl + '?token=' + this.tokenService.get())
                       .map(res => new User(res.json()))
                       .share();
    obs.subscribe(user => {
      this.user.next(user);
      this.updatePushNotificationTokenForUserProfile(user);
    });
    return obs;
  }

  public update(user: User): Observable<User> {
    let data = user.toJson();
    let url = this.baseUrl + '?token=' + this.tokenService.get();
    let obs = this.http.put(url, data)
                       .map(res => new User(res.json()))
                       .share();
    obs.subscribe(updatedUser => {
      this.user.next(updatedUser);
      this.updatePushNotificationTokenForUserProfile(updatedUser);
    },
    err => {
      return err;
    });
    return obs;
  }

  public logout() {
    this.tokenService.reset();
    this.user.next(new User());
    this.isUserSession = null;
    return true;
  }

  public delete(user: User) {
    return this.http.delete(this.baseUrl + '?token=' + this.tokenService.get())
                       .map(res => res.json());
  }

  public requestMailDelivery() {
    let obs = this.http.post(this.baseUrl + '/request_mail_delivery?token=' + this.tokenService.get(), {})
                       .map((res) => new User(res.json()))
                       .share();
    obs.subscribe(user => this.user.next(user), err => {});
    return obs;
  }

  public updatePushNotificationTokenForUserProfile(user) {
    console.log(user)
    // user does not want to receive push notifications
    if (!user.receiveNotificationsViaPush) {
      return false;
    }

    this.platform.ready().then((platform) => {
      if(this.platform.is('ios') || this.platform.is('android')) {
        this.push.register().then((t: PushToken) => {
          return this.push.saveToken(t, {
            ignore_user: true
          });
        }, e => console.log(e)).then((t: PushToken) => {
          if(t !== undefined) {
            if(user.deviceTokens.indexOf(t.token) == -1) {
              user.deviceTokens.push(t.token);
              user.receiveNotificationsViaPush = true;
              console.log('Token:', t.token);
                console.log(JSON.stringify(user.toJson()));
                this.http.put(this.baseUrl + '?token=' + this.tokenService.get(), user.toJson())
                       .map((res) => new User(res.json()))
                       .subscribe(updatedUser => {
                         console.log('device token stored in user');
                       });
            }
          }
        });
        this.push.rx.notification().subscribe(msg => {
          Badge.increase(1);
        });
      }
    });
  }
}
