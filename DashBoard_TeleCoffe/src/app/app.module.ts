import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

// Configuración de MQTT
export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: '83.35.221.176',
  port: 4500,
  path: '/mqtt',
  protocol: 'ws', 
  
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgApexchartsModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
