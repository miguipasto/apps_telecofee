import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { NgApexchartsModule } from 'ng-apexcharts';

import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';
 
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

// Configuración de MQTT
export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: '83.35.221.176',
  port: 4500,
  path: '/mqtt',
  protocol: 'ws', 
  
};

const config: SocketIoConfig = { url: 'http://83.35.221.175:500/api', options: {} };

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgApexchartsModule,
    IonicModule.forRoot(),
    AppRoutingModule, 
    HttpClientModule,
    SocketIoModule.forRoot(config),
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
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS)
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy},HttpClientModule,SocketIoModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
