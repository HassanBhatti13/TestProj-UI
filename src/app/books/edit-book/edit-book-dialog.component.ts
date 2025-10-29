import {
    Component,
    Injector,
    OnInit,
    Output,
    EventEmitter,
    ChangeDetectorRef
} from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/app-component-base';
import {
    BookServiceProxy,
    BookDto
} from '@shared/service-proxies/service-proxies';
// Import shared components
import { AbpModalHeaderComponent } from "@shared/components/modal/abp-modal-header.component";
import { AbpModalFooterComponent } from "@shared/components/modal/abp-modal-footer.component";
import { AbpValidationSummaryComponent } from "@shared/components/validation/abp-validation.summary.component";
import { LocalizePipe } from "@shared/pipes/localize.pipe";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    templateUrl: 'edit-book-dialog.component.html',
    standalone: true, // <-- SET TO TRUE
    imports: [
        CommonModule,
        FormsModule,
        AbpModalHeaderComponent,
        AbpModalFooterComponent,
        AbpValidationSummaryComponent,
        LocalizePipe
    ]
})
export class EditBookDialogComponent extends AppComponentBase implements OnInit {
    saving = false;
    book: BookDto =     new BookDto();
    id: number;

    @Output() onSave = new EventEmitter<any>();

    constructor(
        injector: Injector,
        private _bookService: BookServiceProxy,
        public bsModalRef: BsModalRef,
        private cd: ChangeDetectorRef // Added for change detection
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this._bookService.get(this.id).subscribe((result: BookDto) => {
            this.book = result;
            this.cd.detectChanges(); // Manually trigger change detection
        });
    }

    save(): void {
        this.saving = true;

        this._bookService
            .update(this.book)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.bsModalRef.hide();
                this.onSave.emit();
            });
    }
}