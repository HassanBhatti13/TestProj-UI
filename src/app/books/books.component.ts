import { Component, Injector, ChangeDetectorRef, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { PagedListingComponentBase } from '@shared/paged-listing-component-base';
import {
    BookServiceProxy, // Your service
    BookDto,           // Your DTO
    BookDtoPagedResultDto // Assuming you have a PagedResultDto for Books
} from '@shared/service-proxies/service-proxies';
import { CreateBookDialogComponent } from './create-book/create-book-dialog.component';
import { EditBookDialogComponent } from './edit-book/edit-book-dialog.component';
import { Table, TableModule } from 'primeng/table';
import { LazyLoadEvent, PrimeTemplate } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { LocalizePipe } from '@shared/pipes/localize.pipe'; 

@Component({
    templateUrl: './books.component.html',
    animations: [appModuleAnimation()],
    standalone: true,
    imports: [FormsModule, TableModule, PrimeTemplate, NgIf, PaginatorModule, LocalizePipe, CommonModule],
})
export class BooksComponent extends PagedListingComponentBase<BookDto> {
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator',           { static: true }) paginator: Paginator;

    books: BookDto[] = [];
    keyword = '';

    constructor(
        injector: Injector,
        private _bookService: BookServiceProxy, // Use your BookService
        private _modalService: BsModalService,
        private _activatedRoute: ActivatedRoute,
        cd: ChangeDetectorRef
    ) {
        super(injector, cd);
        this.keyword = this._activatedRoute.snapshot.queryParams['keyword'] || '';
    }

    list(event?: LazyLoadEvent): void {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        // Ensure your BookServiceProxy.getAll supports these parameters
        this._bookService
            .getAll(
                this.keyword,
                this.primengTableHelper.getSorting(this.dataTable),
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event)
            )
            .pipe(
                finalize(() => {
                    this.primengTableHelper.hideLoadingIndicator();
                })
            )
            .subscribe((result: BookDtoPagedResultDto) => { // Use your PagedResultDto
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.hideLoadingIndicator();
                this.cd.detectChanges();
            });
    }

    delete(book: BookDto): void {
        abp.message.confirm(this.l('BookDeleteWarningMessage', book.title), undefined, (result: boolean) => {
            if (result) {
                this._bookService
                    .delete(book.id)
                    .pipe(
                        finalize(() => {
                            abp.notify.success(this.l('SuccessfullyDeleted'));
                            this.refresh();
                        })
                    )
                    .subscribe(() => { });
            }
        });
    }

    createBook(): void {
        this.showCreateOrEditBookDialog();
    }

    editBook(book: BookDto): void {
        this.showCreateOrEditBookDialog(book.id);
    }

    showCreateOrEditBookDialog(id?: number): void {
        let createOrEditBookDialog: BsModalRef;
        if (!id) {
            createOrEditBookDialog = this._modalService.show(CreateBookDialogComponent, {
                class: 'modal-lg',
            });
        } else {
            createOrEditBookDialog = this._modalService.show(EditBookDialogComponent, {
                class: 'modal-lg',
                initialState: {
                    id: id,
                },
            });
        }

        createOrEditBookDialog.content.onSave.subscribe(() => {
            this.refresh();
        });
    }
}