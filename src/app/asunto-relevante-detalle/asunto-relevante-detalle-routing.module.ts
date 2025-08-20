import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsuntoRelevanteDetallePage } from './asunto-relevante-detalle.page';

const routes: Routes = [
  {
    path: '',
    component: AsuntoRelevanteDetallePage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AsuntoRelevanteDetallePageRoutingModule {}