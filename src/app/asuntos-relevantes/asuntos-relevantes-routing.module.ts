import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsuntosRelevantesPage } from './asuntos-relevantes.page';

const routes: Routes = [
  {
    path: '',
    component: AsuntosRelevantesPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsuntosRelevantesPageRoutingModule {}
