export class Folder {
  id: string;
  title: string;
  type: string;
  slug: string;
  icon: string;
  documentsCount: number;
  unreadDocumentsCount: number;
  account_modificator: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;

  constructor(data:any = null) {
    if(data) {
      this.id = data.id;
      this.title = data.title;
      this.type = data.type;
      this.slug = data.slug;
      this.icon = data.icon;
      this.documentsCount = data.documents_count;
      this.unreadDocumentsCount = data.unread_documents_count;
      this.account_modificator = data.account_modificator;
      this.createdAt = data.created_at;
      this.updatedAt = data.updated_at;
      this.deletedAt = data.deleted_at;
    }
  }

  public toJson() {
    return {
      "folder": {
        "id": this.id,
        "title": this.title,
        "type": this.type,
        "slug": this.slug,
        "icon": this.icon,
        "documents_count": this.documentsCount,
        "unread_documents_count": this.unreadDocumentsCount,
         "account_modificator":  this.account_modificator,
        "created_at": this.createdAt,
        "updated_at": this.updatedAt,
        "deleted_at": this.deletedAt
      }
    };
  }
}
