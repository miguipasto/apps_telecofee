import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Componentes
import { HomeComponent } from './components/home/home.component';
import { TrabajadoresComponent } from './components/trabajadores/trabajadores.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'trabajadores', component: TrabajadoresComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
