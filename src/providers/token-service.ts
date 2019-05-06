import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs/Rx';

// import { Observable, BehaviorSubject } from 'rxjs/Rx';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/observable/throw';

@Injectable()
export class TokenService {
  public token: BehaviorSubject<String>;

  constructor(
    private storage: Storage
  ) {
    this.token = <BehaviorSubject<String>>new BehaviorSubject(null);
  }

  set(token) {
    localStorage.setItem('token', token);
    this.token.next(token);
    return token;
  }

  get() {
    let token = localStorage.getItem('token');
    if(token != this.token.getValue()) {
      this.token.next(window.localStorage.getItem('token'));
    }
    return token;
  }

  reset() {
    localStorage.removeItem('token');
    this.token.next(null);
    return true;
  }

  subscribe(onChange, onError) {
    this.token.asObservable().subscribe(
      t => onChange(t),
      e => onError(e)
    );
  }
}
