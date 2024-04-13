import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { TrabajadoresComponent } from './components/trabajadores/trabajadores.component';
import { MaquinasEstadisticasComponent } from './components/maquinas-estadisticas/maquinas-estadisticas.component';

//Configuración de MQTT
export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'telecoffe-server.duckdns.org',
  port: 443,
  path: '/mqtt',
  protocol: 'wss', 
  
};

// export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
//   hostname: '192.168.1.130',
//   port: 4500,
//   path: '/mqtt',
//   protocol: 'ws', 
  
// };

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
    provideFirebaseApp(() => initializeApp({
      "projectId":"lpro-workers",
      "appId":"1:945879346205:web:8eb0b852d9cd8be7c0aaf4",
      "storageBucket":"lpro-workers.appspot.com",
      "apiKey":"AIzaSyDm-vKdUAryQ07QaCkCc_xU-j5UJPrnQRg",
      "authDomain":"lpro-workers.firebaseapp.com",
      "messagingSenderId":"945879346205",
      "measurementId":"G-DDS83BHVR9"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
