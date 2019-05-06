import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment/locale/de';

export class Document {
  id: string;
  title: string;
  file: Object;
  userId: any;
  pagesCount: number;
  favoritedByUser: boolean;
  pendingUserDelivery: boolean;
  openedByUser: boolean;
  sentToUserAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  readyToSend: boolean;
  tags: Array<Object>;
  folders: Array<String>;
  folderSlugs: Array<String>;
  account_modificator: String;
  box: String;

  constructor(data:any = null) {
    if(data) {
      this.id = data.id;
      this.title = data.title,
      this.file = data.file.url;
      this.userId = data.user_id;
      this.pagesCount = data.pages_count;
      this.favoritedByUser = data.favorited_by_user;
      this.pendingUserDelivery = data.pending_user_delivery;
      this.openedByUser = data.opened_by_user;
      this.sentToUserAt = data.sent_to_user_at;
      this.createdAt = data.created_at;
      this.updatedAt = data.updated_at;
      this.deletedAt = data.deleted_at;
      this.readyToSend = data.ready_to_send;
      this.tags = _.map(data.tags || [], function(t) {
        return {
          name: t.name,
          id: t.id
        };
      });
      this.folders = data.folder_ids;
      this.folderSlugs = data.folder_slugs || [];
      this.account_modificator = data.account_modificator;
    }
  }

  public toJson() {
    return {
      "document": {
        "id": this.id,
        "file": {
          "url": this.file
        },
        // "preview_image": {
        //   "url": this.preview
        // },
        "title": this.title,
        "pages_count": this.pagesCount,
        "favorited_by_user": this.favoritedByUser,
        "pending_user_delivery": this.pendingUserDelivery,
        "user_id": this.userId,
        "opened_by_user": this.openedByUser,
        "sent_to_user_at": this.sentToUserAt,
        "created_at": this.createdAt,
        "updated_at": this.updatedAt,
        "deleted_at": this.deletedAt,
        "tag_names": (function(tags) {
          return _.map(tags, function(tag) {
            return tag.name;
          });
        })(this.tags),
        "folder_ids": this.folders,
          "account_modificator": this.account_modificator,
          "folder_slugs": this.folderSlugs,
      }
    };
  }

  public showInInbox() : Boolean {
    return this.folderSlugs.length
      && this.folderSlugs[0] == 'inbox'
      && !this.deletedAt
      && moment(this.createdAt).isAfter(moment().add(-31, 'days'))
      && !this.deletedAt
      && !this.favoritedByUser
      && !this.pendingUserDelivery
      && !this.sentToUserAt;
  }

  public showInArchive() : Boolean {
    return !this.showInInbox()
      && !this.deletedAt;
  }
}
