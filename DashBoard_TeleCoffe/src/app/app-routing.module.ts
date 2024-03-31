import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Componentes
import { HomeComponent } from './components/home/home.component';
import { TrabajadoresComponent } from './components/trabajadores/trabajadores.component';
import { MaquinasEstadisticasComponent } from './components/maquinas-estadisticas/maquinas-estadisticas.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'home/:nombre_maquina', component: MaquinasEstadisticasComponent },
  { path: 'trabajadores', component: TrabajadoresComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
