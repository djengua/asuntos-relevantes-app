import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsuntosRelevantesPage } from './asuntos-relevantes.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { AsuntosRelevantesPageRoutingModule } from './asuntos-relevantes-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    AsuntosRelevantesPageRoutingModule
  ],
  declarations: [AsuntosRelevantesPage]
})
export class AsuntosRelevantesPageModule {}
