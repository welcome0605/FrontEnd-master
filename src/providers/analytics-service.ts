import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import 'rxjs/add/observable/throw';
@Injectable()
export class AnalyticsService  {

  // track a page view by the user. pass options that will be passed to the
  // tracking API.
  //public trackPageView(options = {}) {
  //  setTimeout(() => {
  //    this.pushDataToGoogle(options);
  //  }, 2500);
  //}
  public pushEventToTaboola() {
    setTimeout(() => {
      let taboo = window['_tfa'] || [];
      taboo.push({ notify: 'action',name: 'Sign-Up' });
      console.log('Taboola sent');
    }, 2500);
  }

  public trackUserEvent(options = {}) {
    setTimeout(() => {
      this.pushEventToGoogle(options);
    }, 2500);
  }

  public trackCustomEvent(data = {}) {
    setTimeout(() => {
      this.pushCustomDataToGoogle(data);
    }, 2000);
  }


  // proceeds and pushes the data to the google analytics web service
  private pushDataToGoogle(options) {
    console.info('tracking event with data', options);
    let data = {
      'event':'virtualPageView',
      'url': options.url || '/',
      'page': options,
      'data': options
    };
    this.getDataLayer().push(data);
  }

  private pushCustomDataToGoogle(data) {
    console.info('pushCustomDataToGoogle ', data);
    this.getDataLayer().push(data);
  }

  private pushEventToGoogle(options) {
    console.info('tracking used plan: ', options);
    let data = {
      'pageCategory': options.pageCategory,
      'visitorType': options.visitorType,
      'userId': options.userId,
      'subscription': options.subscription,
      'revenue_predicted': options.revenue_predicted,
      'revenue_cashflow': options.revenue_cashflow,
      'url': options.url || '/',
      'event': options.event
    };
    this.getDataLayer().push(data);
  }

  // returns the data layer service by google.
  private getDataLayer() {
    let fallback = {
      push: function(opts) {
        return opts;
      }
    };
    // see the following code on why we use the window object like this.
    // http://stackoverflow.com/questions/12709074/how-do-you-explicitly-set-a-new-property-on-window-in-typescript
    return window['dataLayer'] || fallback;
  }
}
