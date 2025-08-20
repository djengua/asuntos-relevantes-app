import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AsuntoRelevanteDetallePageRoutingModule } from './asunto-relevante-detalle-routing.module';
import { AsuntoRelevanteDetallePage } from './asunto-relevante-detalle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsuntoRelevanteDetallePageRoutingModule
  ],
  declarations: [AsuntoRelevanteDetallePage]
})
export class AsuntoRelevanteDetallePageModule {}