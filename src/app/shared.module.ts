import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    Apollo, // Proporcionar Apollo
    HttpLink, // Proporcionar HttpLink
  ],
})
export class SharedModule {}
