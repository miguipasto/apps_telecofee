import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SignUpPage } from './signup.page';

import { SignUpPageRoutingModule } from './signup-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignUpPageRoutingModule
  ],
  declarations: [SignUpPage]
})
export class SignUpPageModule {}
