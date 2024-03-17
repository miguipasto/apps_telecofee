import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordPage } from './forgotPassword.page';

const routes: Routes = [
  {
    path: '',
    component: ForgotPasswordPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForgotPasswordPageRoutingModule {}
