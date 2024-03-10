import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeDrinkPage } from './home-drink.page';

const routes: Routes = [
  {
    path: '',
    component: HomeDrinkPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeDrinkPageRoutingModule {}
