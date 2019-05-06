declare var cordova: any;
import { Component, Input } from '@angular/core';
import { NavController, Platform, ActionSheetController, ToastController, NavParams, LoadingController, ModalController, PopoverController, AlertController } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { SocialSharing } from '@ionic-native/social-sharing';

import { Document } from '../../../models/document';
import { DocumentService } from '../../../providers/document-service';
import { LabelEditor } from '../label-editor/label-editor.component';
import { MoveToFolderModal } from '../move-to-folder-modal/move-to-folder-modal.component';
import { Popover } from '../popover/popover';
import { DocModal } from '../doc-modal/doc-modal.component';

import * as moment from 'moment';
import * as _ from 'lodash';

import 'rxjs/add/operator/map';


@Component({
    selector: 'document-list',
    templateUrl: 'document-list.component.html'
})
export class DocumentList {



    @Input() documents: Document[];
    @Input() folder: string;
    public canOpenActionMenu: boolean = true;

    constructor(
        private documentService: DocumentService,
        public navCtrl: NavController,
        public platform: Platform,
        public actionsheetCtrl: ActionSheetController,
        public popoverCtrl: PopoverController,
        private translateService: TranslateService,
        private toastCtrl: ToastController,
        private navParams: NavParams,
        private loadingCtrl: LoadingController,
        private modalCtrl: ModalController,
        private sanitizer: DomSanitizer,
        private alertCtrl: AlertController,
        private socialSharing: SocialSharing
    ) {
        this.platform = platform;
    }
    public setDivider(record, recordIndex, records) {
        if (recordIndex == 0 || (records[recordIndex - 1] && moment(records[recordIndex].createdAt).month() != moment(records[recordIndex - 1].createdAt).month())) {
            return moment.months(moment(record.createdAt).month()) + " " + moment(record.createdAt).year();
        }
        return null;
    }

    openDocViewModal(document) {
        console.log(document)
        let docModal = this.modalCtrl.create(DocModal, { document: document });
        docModal.present();
    }

    openBrowser(document: Document) {
        console.log(document)
        this.platform.ready().then(() => {
            return this.markAsRead(document)
                .subscribe(
                document => {
                    let url = document.file.toString();

                    console.log(url);

                    this.openDocViewModal(document);

                }
                );
        });
    }


    deleteDocument(document) {
        let confirm = this.alertCtrl.create({
            title: this.translateService.instant('documents.documentList.destroyAlert.title'),
            message: this.translateService.instant('documents.documentList.destroyAlert.message'),
            buttons: [
                {
                    text: this.translateService.instant('general.disagree'),
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                },
                {
                    text: this.translateService.instant('general.agree'),
                    handler: () => {
                        this.documentService.destroy(document)
                            .subscribe(
                            document => {
                                let i = _.findIndex(this.documents, (d) => d.id == document.id);
                                if (i != -1) {
                                    this.documents.splice(i, 1);
                                }
                                this.toast(this.translateService.instant('documents.documentList.hasBeenDestroyed'));
                            },
                            err => {
                                this.toast(this.translateService.instant('general.genericError'));
                            }
                            );
                    }
                }
            ]
        });
        confirm.present();
    }

    private markAsFavorite(document: Document) {
        document.favoritedByUser = !document.favoritedByUser;
        return this.updateDocument(document)
            .subscribe(
            document => {

                this.translateService.get('documents.documentList.hasBeenFavorited').subscribe(
                    value => {
                        let message = value;

                        if (!document.favoritedByUser) {
                            this.toast(this.translateService.instant('documents.documentList.hasBeenUnfavorited'));
                        } else {
                            this.toast(message);
                        }
                    },
                    err => {
                        console.error(err);
                    }
                );
            },
            err => {
                this.translateService.get('general.genericError').subscribe(
                    value => {
                        let message = value;
                        this.toast(message);
                    },
                    err => {
                        console.error(err);
                    }
                );
            }
            );
    }

    toggleSendToUser(document: Document) {
        document.pendingUserDelivery = !document.pendingUserDelivery;
        return this.updateDocument(document)
            .subscribe(
            document => {
                console.log(document.pendingUserDelivery);
                if (!document.pendingUserDelivery) {
                    this.toast(this.translateService.instant('documents.documentList.hasBeenMovedToFolder'));
                } else {
                    this.toast(this.translateService.instant('documents.documentList.hasBeenMovedToFolder'));
                }
            },
            err => {
                if (err.pending_user_delivery) {
                    this.toast(err.pending_user_delivery);
                } else {
                    this.toast(this.translateService.instant('general.genericError'));
                }
            }
            );
    }

    markAsRead(document: Document) {
        document.openedByUser = true;
        return this.updateDocument(document);
    }

    updateDocument(document: Document) {
        return this.documentService.update(document, document.folderSlugs[0]);
    }

    openMenu(ev, document) {
        console.log(this.folder);
        this.platform.ready().then(() => {
            if (this.platform.is('core')) {
                this.openMenuDesktop(ev, document);
            } else {
                this.openActionSheet(ev, document);
            }
        });

    }

    openLabelEditor(document) {
        console.log(document);
        let LabelEditorModal = this.modalCtrl.create(LabelEditor, { document: document });
        LabelEditorModal.onDidDismiss(document => {
            console.log(document);
            this.allowEditingMenuAgain();
        });
        LabelEditorModal.present();
    }

    openMoveToFolderModal(document) {
        console.log(document);
        let moveToFolderModal = this.modalCtrl.create(MoveToFolderModal, { document: document });
        moveToFolderModal.onDidDismiss(document => {
            console.log(document);
            this.allowEditingMenuAgain();
        });
        moveToFolderModal.present();
    }

    private lockActionMenu() {
        this.canOpenActionMenu = false;
        return false;
    }

    private allowEditingMenuAgain() {
        this.canOpenActionMenu = true;
        return true;
    }

    private toast(message: string) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000
        });
        toast.present();
    }

    private openMenuDesktop(triggerEvent, doc: Document): Document {
        console.log('openMenu');
        console.log(triggerEvent)
        console.log(doc)
        let url = doc.file.toString();
        let popover = this.popoverCtrl.create(Popover, {
            document: doc,
            url: url
        });
        let event = {
            target: {
                getBoundingClientRect: () => {
                    return {
                        top: triggerEvent.pageY,
                        left: triggerEvent.pageX
                    };
                }
            }
        };
        // enable again opening another popover 
        // when this one is dismissed
        popover.onDidDismiss(() => {
            this.canOpenActionMenu = true;
        });

        if (this.canOpenActionMenu) {
            // we are going to show a popover,
            // so disable showing another
            this.canOpenActionMenu = false;
            popover.present({
                ev: event
            });
        }
        return doc;
    }

    private openActionSheet(triggerEvent, doc: Document): Document {

        let title = this.translateService.instant('documents.documentList.actions.title');
        let share = this.translateService.instant('documents.documentList.actions.share');
        let labels = this.translateService.instant('documents.documentList.actions.labels');
        let destroy = this.translateService.instant('documents.documentList.actions.destroy');
        let cancel = this.translateService.instant('documents.documentList.actions.cancel');
        let move = this.translateService.instant('documents.documentList.actions.move');
        let favorite = this.favoriteText(doc);
        let sendToMe = this.sendToMeText(doc);
        let markUnreadText = this.translateService.instant('documents.documentList.actions.markAsUnread');
        let options = [];

        switch (this.folder) {
            case 'trash':
                options = [
                    {
                        text: 'Ololo1', //share,
                        icon: !this.platform.is('ios') ? 'download' : null,
                        handler: () => {
                            let url = doc.file.toString();
                            this.socialSharing.share("", "", "", url).then(() => {
                                console.log("shareSheetShare: Success");
                            }).catch(() => {
                                console.error("shareSheetShare: failed");
                            });
                        }    
                    },
                    {
                        text: cancel,
                        role: 'cancel',
                        icon: !this.platform.is('ios') ? 'close' : null,
                        handler: () => {
                            console.log('Cancel clicked');
                        }
                    }
                ];
                break;
            default:
                if (doc.deletedAt) {
                    options = [
                        {
                            text: 'Ololo2',//share,
                            icon: !this.platform.is('ios') ? 'download' : null,
                            handler: () => {
                                let url = doc.file.toString();
                                this.socialSharing.share("", "", "", url).then(() => {
                                    console.log("shareSheetShare: Success");
                                }).catch(() => {
                                    console.error("shareSheetShare: failed");
                                });
                            }
                        },
                        {
                            text: cancel,
                            role: 'cancel',
                            icon: !this.platform.is('ios') ? 'close' : null,
                            handler: () => {
                                console.log('Cancel clicked');
                            }
                        }
                    ];
                } else if (doc.readyToSend) {
                    options = [
                        {
                            text: share,
                            icon: !this.platform.is('ios') ? 'download' : null,
                            handler: () => {
                                let url = doc.file.toString();
                                this.socialSharing.share("", "", "", url).then(() => {
                                    console.log("shareSheetShare: Success");
                                }).catch(() => {
                                    console.error("shareSheetShare: failed");
                                });
                            }
                        },
                        {
                            text: favorite,
                            icon: !this.platform.is('ios') ? 'star' : null,
                            handler: () => {
                                this.markAsFavorite(doc);
                            }
                        },
                        {
                            text: labels,
                            icon: !this.platform.is('ios') ? 'bookmark' : null,
                            handler: () => {
                                this.openLabelEditor(doc);
                            }
                        },
                        {
                            text: move,
                            icon: !this.platform.is('ios') ? 'undo' : null,
                            handler: () => {
                                this.openMoveToFolderModal(doc);
                            }
                        },
                        {
                            text: cancel,
                            role: 'cancel',
                            icon: !this.platform.is('ios') ? 'close' : null,
                            handler: () => {
                                console.log('Cancel clicked');
                            }
                        }
                    ];
                } else {
                    options = [
                        {
                            text: share,
                            icon: !this.platform.is('ios') ? 'download' : null,
                            handler: () => {
                                let url = doc.file.toString();
                                console.log("**4 share url", url);
                                this.socialSharing.share("", "", "", url).then(() => {
                                    console.log("shareSheetShare: Success");
                                }).catch(() => {
                                    console.error("shareSheetShare: failed");
                                });
                            }
                        },
                        {
                            text: favorite,
                            icon: !this.platform.is('ios') ? 'star' : null,
                            handler: () => {
                                this.markAsFavorite(doc);
                            }
                        },
                        {
                            text: labels,
                            icon: !this.platform.is('ios') ? 'bookmark' : null,
                            handler: () => {
                                this.openLabelEditor(doc);
                            }
                        },
                        {
                            text: move,
                            icon: !this.platform.is('ios') ? 'undo' : null,
                            handler: () => {
                                this.openMoveToFolderModal(doc);
                            }
                        },
                        {
                            text: sendToMe,
                            icon: !this.platform.is('ios') ? 'bookmark' : null,
                            handler: () => {
                                console.log('Send to Me clicked');
                                this.toggleSendToUser(doc);
                            }
                        },
                        {
                            text: destroy,
                            role: 'destructive',
                            icon: !this.platform.is('ios') ? 'trash' : null,
                            handler: () => {
                                console.log('Delete clicked');
                                this.deleteDocument(doc);
                            }
                        },
                        {
                            text: cancel,
                            role: 'cancel',
                            icon: !this.platform.is('ios') ? 'close' : null,
                            handler: () => {
                                console.log('Cancel clicked');
                            }
                        }
                    ];
                }
                break;
        }
        if (doc.openedByUser) {
            // add option for mark as unread
            options.splice(1, 0, {
                text: markUnreadText,
                icon: !this.platform.is('ios') ? 'download' : null,
                handler: () => {
                    this.markAsUnread(doc);
                }
            });
        }


        let actionSheet = this.actionsheetCtrl.create({
            title: title,
            cssClass: 'action-sheets-basic-page',
            buttons: options,
            enableBackdropDismiss: true
        });
        
        actionSheet.onDidDismiss(() => {
            console.log("others can open action menu again");
            this.allowEditingMenuAgain();
        });
        if (this.canOpenActionMenu) {
            actionSheet.present();
        }

        // lock opening up other action menues
        this.lockActionMenu();
        return doc;
    }

    markAsUnread(doc: Document) {
        // tslint:disable-next-line:no-shadowed-variable
        this.documentService.markDocumentAsUnread(doc).subscribe(doc => {
            console.log("document marked as unread");
        }, error => {
            console.error("failed to mark document " + doc.id + "as unread");
        });
    }
    private openDocumentAsPopup(): Boolean {
        return (this.platform.is('core') || !window['cordova']);
    }

    private sendToMeText(doc): String {
        if (doc.pendingUserDelivery) {
            return this.translateService.instant('documents.documentList.actions.removeFromSendToMe');
        } else {
            return this.translateService.instant('documents.documentList.actions.moveToSendToMe');
        }
    }

    private favoriteText(doc): String {
        if (doc.favoritedByUser) {
            return this.translateService.instant('documents.documentList.actions.unfavorite');
        } else {
            return this.translateService.instant('documents.documentList.actions.favorite');
        }
    }
}
