import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ElementosPageRoutingModule } from './elementos-routing.module';

import { ElementosPage } from './elementos.page';
import { NgApexchartsModule } from 'ng-apexcharts';
import { HttpClientModule} from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgApexchartsModule,
    HttpClientModule,
    NgxChartsModule,
    IonicModule,
    ElementosPageRoutingModule
  ],
  declarations: [ElementosPage]
})
export class ElementosPageModule {}
