import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import { Document } from '../models/document';
import { TokenService } from './token-service';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import {FolderService} from "./folder-service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment/locale/de';
import { ENV } from '@app/env';

import * as utils from '../utils/utils';

// inpired by on https://coryrylan.com/blog/angular-observable-data-services

@Injectable()
export class DocumentService {
  public loading: boolean = false;
  public archive: Object = {};
  public counts: Object = {};
  private trash_folder_id: any;
  private baseUrl = `${ENV.apiUrl}/documents`;
  private dataStore: {
    documents: Document[],
    archive: Document[]
  };
  private _documents: BehaviorSubject<Document[]>;
  public documents: Observable<Document[]>;
  public archives: Observable<Document[]>;
  constructor(private http: HttpService,
              private tokenService: TokenService,
              private folderService:FolderService
  ) {
    this.dataStore = { documents: [], archive:[] };
    this._documents = <BehaviorSubject<Document[]>>new BehaviorSubject([]);
    this.documents = this._documents.asObservable();
    this.archive = this.buildArchive(6);
    this.documents.subscribe(documents => this.counts = this.updateCounts(documents));
  }

  public reset() {
    this.dataStore = { documents: [], archive:[] };
    this._documents.next(Object.assign({}, this.dataStore).documents);
  }

  public search(val): Observable<Document[]> {
    this.loading = true;
    return this.http.get(this.baseUrl + '?token=' + this.tokenService.get() + '&q=' + val)
        .map(response => {
          this.loading = false;
          console.log(response);
          return response.json().map(d => new Document(d));
        })
        .catch((response) => Observable.throw(response.json()));
  }

  public loadArchive(date): Observable<Document[]> {
      this.loading = true;
      let utc_date = Math.floor(date/1000);
      this.http.get(this.baseUrl+'/archive/'+ utc_date  + '?token=' + this.tokenService.get() )
          .map(response => {
          this.loading = false;
          return response.json().map(d => new Document(d));
      })
          .subscribe(
              data => {
                  this.dataStore.documents = data;
                  this._documents.next(Object.assign({}, this.dataStore).documents);
              }, err => {
                  console.log(err);
              });
    return this.documents;
    }

  public loadInbox(box:string, account_modificator:string): Observable<Document[]>{
        this.loading = true;
        this.http.get(this.baseUrl + '?token=' + this.tokenService.get() + '&box=' + box +'&account_modificator=' + account_modificator )
            .map(response => {
                this.loading = false;
                return response.json().map(d => new Document(d));
            })
            .catch((response) => Observable.throw(response.json()))
            .subscribe(
                data => {
                    this.dataStore.documents = data;
                    this._documents.next(Object.assign({}, this.dataStore).documents);
                }, err => {
                    console.log(err);
                });
        return this.documents;
    }

    public loadFolders(box:string): Observable<Document[]>{
      this.loading = true;
      this.http.get(this.baseUrl + '?token=' + this.tokenService.get() + '&box=' + box)
          .map(response => {
              this.loading = false;
              return response.json().map(d => new Document(d));
                       })
          .catch((response) => Observable.throw(response.json()))
          .subscribe(
              data => {
                    this.dataStore.documents = data;
                    this._documents.next(Object.assign({}, this.dataStore).documents);
                    }, err => {
                             console.log(err);
              });
               return this.documents;
    }


    public all(folderId: string = ""): Observable<Document[]> {
    this.loading = true;
    if (folderId != "") {
      this.http.get(this.baseUrl + '?token=' + this.tokenService.get())
          .map(response => {
            this.loading = false;
            return response.json().map(d => new Document(d));
          })
          .catch((response) => Observable.throw(response.json()))
          .subscribe(
              data => {
                this.dataStore.documents = data;
                this._documents.next(Object.assign({}, this.dataStore).documents);
              }, err => {
                console.log(err);
              });
    } else {
      this.http.get(this.baseUrl + '?token=' + this.tokenService.get())
          .map(response => {
            this.loading = false;
            return response.json().map(d => new Document(d));
          })
          .subscribe(
              data => {
                this.dataStore.documents = data;
                this._documents.next(Object.assign({}, this.dataStore).documents);
              }, err => {
                console.log(err);
              });
    }
    return this.documents;
  }

  public update(document: Document, box:String): Observable<Document> {
    return Observable.create(observer => {

                   this.http.put(this.baseUrl + '/' + document.id + '?token=' + this.tokenService.get()+'&box='+box, document.toJson())
          .map((response) => new Document(response.json()))
          .catch((response) => Observable.throw(response.json()))
          .subscribe(
              data => {
                this.dataStore.documents.forEach((d, i) => {
                  if (d.id === data.id) {
                    this.dataStore.documents[i] = data;
                  }
                });
                this._documents.next(Object.assign({}, this.dataStore).documents);
                observer.next(data);
                observer.complete();
              },
              err => {
                console.log('Could not update document.');
                observer.error(err);
                observer.complete();
              }
          );
    });
  }

  public destroy(document) {
    document.deletedAt = new Date();
    return this.putInTrash(document);
  }
    public putInTrash(document: Document): Observable<Document> {
        return Observable.create(observer => {
            this.http.put(this.baseUrl + '/' + document.id + '?token=' + this.tokenService.get() +'&box=trash' , document.toJson())
                .map((response) => new Document(response.json()))
                .catch((response) => Observable.throw(response.json()))
                .subscribe(
                    data => {
                        this.dataStore.documents.forEach((d, i) => {
                            if (d.id === data.id) {
                                this.dataStore.documents[i] = data;
                            }
                        });
                        this._documents.next(Object.assign({}, this.dataStore).documents);
                        observer.next(data);
                        observer.complete();
                        },
                        err => {
                        console.log('Could not update document.');
                        observer.error(err);
                        observer.complete();
                    });
            });
         }

  // public remove(documentId: string) {
  //   // this.http.delete(this.baseUrl + '/' + document.id + '?token=' + token, document.toJson())...
  //   this.dataStore.documents.forEach((d, i) => {
  //     if (d.id == documentId) {
  //       this.dataStore.documents.splice(i, 1);
  //     }
  //   });
  //   this._documents.next(Object.assign({}, this.dataStore).documents);
  // }

  public buildArchive(archiveMonths: number) {
    const t0 = performance.now();
    let months = {};
    let userLang = navigator.language.split('-')[0];
    userLang = /(de|en)/gi.test(userLang) ? userLang : 'en';
    moment.locale(userLang);

    for (let i = 1; i < archiveMonths+1; i++) {
      let month = moment().add(i * -1, 'months');
      let monthName = moment.months(month.month()) + " " + month.year();
      let monthSlug = utils.slugify(monthName);
      months[monthSlug] = {
        month: month.month(),
        name: moment.months(month.month()) + " " + month.year(),
        moment: month,
      };
    }

    let earlier = moment().add(-1 * archiveMonths, 'months');

    months['earlier'] = {
      month: 'earlier',
      name: "Früher",
      moment: earlier,
    };
    return months;
  }

  public updateCounts(documents) {
      const t0 = performance.now();
      let counts = {
          "all": 0,
          "marked": 0,
          "notSent": 0,
          "destroy": 0,
          "pendingUserDelivery": 0,
          "months": {},
          "folders": {
              "inbox": 0,
              "marked": 0,
              "sendtome": 0,
              "trash": 0
          }
      };

      // Setup time based archives
      if (this.archive) {
          for (let archive in this.archive) {
              counts["months"][this.archive[archive].month] = 0;
          }
      }
      return counts;
  }

  markDocumentAsUnread(document: Document): Observable<Document> {
    document.openedByUser = false;
    return this.update(document, document.folderSlugs[0]);
  }
}

