import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: 'main',
    component: MainPage,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'elementos/:nombre',
        loadChildren: () => import('./elementos/elementos.module').then(m => m.ElementosPageModule)
      },
      {
        path: 'support',
        loadChildren: () => import('./support/support.module').then(m => m.SupportPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'map',
        loadChildren: () => import('./map/map.module').then( m => m.MapPageModule)
      }
        
    ]
  },
  {
    path: '',
    redirectTo: 'main/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
