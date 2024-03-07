import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomeSnackPage } from './home-snack.page';

import { HomeSnackPageRoutingModule } from './home-snack-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeSnackPageRoutingModule
  ],
  declarations: [HomeSnackPage]
})
export class HomeSnackPageModule {}
