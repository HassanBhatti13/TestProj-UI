import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { BooksRoutingModule } from './books-routing.module';

// Import your standalone components
import { BooksComponent } from './books.component';
import { CreateBookDialogComponent } from './create-book/create-book-dialog.component';
import { EditBookDialogComponent } from './edit-book/edit-book-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        BooksRoutingModule,

        // Import the standalone components here
        BooksComponent,
        CreateBookDialogComponent,
        EditBookDialogComponent
    ],
    // Declarations array must be empty!
    declarations: []
})
export class BooksModule { }

