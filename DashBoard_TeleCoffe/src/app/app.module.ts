import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  // added
import { ReactiveFormsModule } from '@angular/forms';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { TrabajadoresComponent } from './components/trabajadores/trabajadores.component';
import { MaquinasEstadisticasComponent } from './components/maquinas-estadisticas/maquinas-estadisticas.component';

// Configuración de MQTT
export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: '83.35.235.160',
  port: 4500,
  path: '/mqtt',
  protocol: 'ws', 
  
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    FooterComponent,
    TrabajadoresComponent,
    MaquinasEstadisticasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
