import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeSnackPage } from './home-snack.page';

const routes: Routes = [
  {
    path: '',
    component: HomeSnackPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeSnackPageRoutingModule {}
