import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ElementosPageRoutingModule } from './elementos-routing.module';

import { ElementosPage } from './elementos.page';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    IonicModule,
    ElementosPageRoutingModule
  ],
  declarations: [ElementosPage]
})
export class ElementosPageModule {}
