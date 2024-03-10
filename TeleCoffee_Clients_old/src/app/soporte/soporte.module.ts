import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SoportePage } from './soporte.page';

import { SoportePageRoutingModule } from './soporte-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SoportePageRoutingModule
  ],
  declarations: [SoportePage]
})
export class SoportePageModule {}
