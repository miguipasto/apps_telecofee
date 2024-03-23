import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth} from '@angular/fire/auth';
import {AngularFireModule} from '@angular/fire/compat';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { NgModule } from '@angular/core';
import { sendPasswordResetEmail } from 'firebase/auth';

import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';

// Configuración de MQTT
export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'localhost',
  port: 4500,
  path: '/mqtt',
  protocol: 'ws', 
  
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Aquí se importa ReactiveFormsModule
    BrowserModule,
    AngularFireModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp({
      "projectId": "lpro-e1d36",
      "appId": "1:1016118181849:web:7b803bb96800537354e3c8",
      "storageBucket": "lpro-e1d36.appspot.com",
      "apiKey": "AIzaSyAg1CdQTE4M9pAhqTUpqhFwhymENynkXiw",
      "authDomain": "lpro-e1d36.firebaseapp.com",
      "messagingSenderId": "1016118181849"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
