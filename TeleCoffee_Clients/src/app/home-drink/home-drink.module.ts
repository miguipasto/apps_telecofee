import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomeDrinkPage } from './home-drink.page';

import { HomeDrinkPageRoutingModule } from './home-drink-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeDrinkPageRoutingModule
  ],
  declarations: [HomeDrinkPage]
})
export class HomeDrinkPageModule {}
