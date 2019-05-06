import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Folder } from '../models/folder';
import { TokenService } from './token-service';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { ENV } from '@app/env';

@Injectable()
export class FolderService {
  public loading: boolean = false;
  public archive: Object = {};
  public counts: Object = {};
  private baseUrl = `${ENV.apiUrl}/folders`;
  private dataStore: Object = {};
  private _folders: BehaviorSubject<any>;
  public folders: Observable<any>;
  public groupedFolders: Object = {};

  constructor (
    private http: Http,
    private tokenService: TokenService
  ) {
    this.dataStore = { folders: [] };
    this._folders = <BehaviorSubject<Folder[]>> new BehaviorSubject([]);
    this.folders = this._folders.asObservable();
  }

  public reset() {
    this.dataStore = {};
    //this._folders.next(Object.assign({}, this.dataStore));
  }
  public all(): Observable<any> {
    this.loading = true;
    this.http.get(this.baseUrl + '?token=' + this.tokenService.get())
      .map(response => {
        this.loading = false;
        return response.json().map(d => new Folder(d));
      })
        .subscribe(response => {
            let groupedFolders = {
                system: [],
                custom: []
            };
            for (let i = 0; i < response.length-1; i++) {
                if (response[i].type==='custom'){
                    groupedFolders['custom'].push(response[i]);
                } else {
                    if (response[i].slug==='trash')
                    {  if (response[i].account_modificator==='User'){
                        groupedFolders['system'].push(response[i]);
                    }

                    } else {
                        groupedFolders['system'].push(response[i]);
                    }
                }
            }
            if (groupedFolders.system.length >4) {
                groupedFolders.system = this.sortSystemFolders(groupedFolders.system );
            }
            this._folders.next(Object.assign({}, groupedFolders));
        });
      return this.folders;
  }
    public sortSystemFolders(folders: any){
        folders.splice(1,0,folders[5]);
        folders.pop();
        folders.splice(2,0,folders[5]);
        folders.pop();
        return folders;
    }


  public create(folder: any): Observable<any> {
    let observable = this.http.post(this.baseUrl, { api_token: this.tokenService.get(), folder: folder, account_modificator:'User' })
                              .map((response) => new Folder(response.json()))
                              .share();
    observable.subscribe(response => {
      let groupedFolders = this._folders.getValue();
      if (!groupedFolders[response.type]) {
        groupedFolders[response.type] = [];
      }
      groupedFolders[response.type].push(response);
      this._folders.next(Object.assign({}, groupedFolders));
    });
    return observable;
  }

  public update(folder: Folder): Observable<any> {
    return this.http.put(this.baseUrl + '/' + folder.id, { api_token: this.tokenService.get(), folder: folder, account_modificator:'User' })
                               .map((response) => new Folder(response.json()));
  }
  public delete(folder:Folder):Observable<any> {

     return this.http.delete(this.baseUrl + '/' + folder.id  + '?token=' + this.tokenService.get())
         .map((response) => response.json()).concatMap((val)=>{

       return this.all();
     });
  }
}
