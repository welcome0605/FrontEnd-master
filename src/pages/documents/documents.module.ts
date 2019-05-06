import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { Inbox } from './inbox/inbox';
import { DocumentList } from './document-list/document-list.component';
import { LabelEditor } from './label-editor/label-editor.component';
import { MoveToFolderModal } from './move-to-folder-modal/move-to-folder-modal.component';
import { DocModal } from './doc-modal/doc-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  imports: [
    IonicModule,
    TranslateModule,
      PdfViewerModule
  ],
  declarations: [
    Inbox,
    DocumentList,
    LabelEditor,
    MoveToFolderModal,
    DocModal
  ],
  entryComponents: [
    Inbox,
    LabelEditor,
    MoveToFolderModal,
    DocModal
  ]
})
export class DocumentsModule { }
